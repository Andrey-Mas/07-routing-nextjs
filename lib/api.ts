// lib/api.ts
import axios from "axios";
import type { Note } from "@/types/note";

/* ================== CONFIG ================== */
const BASE_URL = "https://notehub-public.goit.study/api";
const TOKEN = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN || "";

// Скільки нотаток на сторінку (можеш задати у .env.local)
const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_NOTES_PAGE_SIZE ?? 12) || 12;

// Кандидати для ключа пошуку та розміру сторінки (API можуть відрізнятися)
const SEARCH_KEYS = ["search", "query", "q", "title"] as const;
type SearchKey = (typeof SEARCH_KEYS)[number];

const PAGE_KEYS = ["limit", "perPage", "pageSize"] as const;
type PageKey = (typeof PAGE_KEYS)[number];

/* ======== AXIOS INSTANCE ======== */
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${TOKEN}` },
});

/* ================== TYPES ================== */
export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
  page: number;
}
export interface FetchNotesParams {
  page?: number;
  query?: string;
}
export interface CreateNoteParams {
  title: string;
  content: string;
  tag: Note["tag"];
}

/* ============ LOCAL CACHE (BROWSER) ============ */
let preferredSearchKey: SearchKey | null = null;
let preferredPageKey: PageKey | null = null;

// читаємо з localStorage тільки на клієнті
const lsGet = (k: string) =>
  typeof window === "undefined" ? null : window.localStorage.getItem(k);
const lsSet = (k: string, v: string) =>
  typeof window === "undefined" ? void 0 : window.localStorage.setItem(k, v);

/* ================ HELPERS ================= */
const cleanQuery = (s: string) => s.trim().replace(/[^\p{L}\p{N}\s-]/gu, "");

/* ================ API ===================== */
export const fetchNotes = async (
  params: FetchNotesParams = {},
  options?: { signal?: AbortSignal },
): Promise<FetchNotesResponse> => {
  const page =
    Number.isFinite(params.page) && (params.page as number) > 0
      ? (params.page as number)
      : 1;

  const q = cleanQuery(params.query ?? "");

  // базові параметри (сторінка)
  const baseParams: Record<string, string | number> = { page };

  // піднімемо кеш ключів, якщо ще не ініціалізували
  preferredSearchKey ??= (lsGet("nh_search_key") as SearchKey | null) ?? null;
  preferredPageKey ??= (lsGet("nh_page_key") as PageKey | null) ?? null;

  // якщо вже знаємо робочий ключ для розміру сторінки — додамо відразу
  if (preferredPageKey) baseParams[preferredPageKey] = PAGE_SIZE;

  // Коли пошуковий терм короткий — не додаємо поле пошуку
  if (q.length < 2) {
    // Спроба напряму з відомим pageKey (якщо є)
    const { data, status } = await axiosInstance.get<FetchNotesResponse>(
      "/notes",
      {
        params: baseParams,
        signal: options?.signal,
        validateStatus: () => true,
      },
    );

    // Якщо ще не підібрали pageKey — зробимо одноразове авто-визначення
    if (!preferredPageKey && status >= 400) {
      for (const pk of PAGE_KEYS) {
        const { data: d2, status: s2 } =
          await axiosInstance.get<FetchNotesResponse>("/notes", {
            params: { ...baseParams, [pk]: PAGE_SIZE },
            signal: options?.signal,
            validateStatus: () => true,
          });
        if (s2 >= 200 && s2 < 300 && (d2 as any)?.notes) {
          preferredPageKey = pk;
          lsSet("nh_page_key", pk);
          return d2;
        }
      }
    }

    if ((data as any)?.notes) return data;
    return { notes: [], totalPages: 1, page };
  }

  // Якщо знаємо ключі — використовуємо їх (один чистий запит)
  if (preferredSearchKey) {
    const paramsReady = {
      ...baseParams,
      ...(preferredPageKey ? { [preferredPageKey]: PAGE_SIZE } : {}),
      [preferredSearchKey]: q,
    };

    const { data, status } = await axiosInstance.get<FetchNotesResponse>(
      "/notes",
      {
        params: paramsReady,
        signal: options?.signal,
        validateStatus: () => true,
      },
    );

    if (status >= 200 && status < 300 && (data as any)?.notes) return data;

    // Якщо раптом перестало працювати, скинемо кеш і підберемо знову
    preferredSearchKey = null;
    lsSet("nh_search_key", "");
  }

  // Авто-визначення: спершу вибираємо ключ розміру сторінки (якщо не визначений),
  // потім — ключ пошуку. Кешуємо обидва після першого успішного запиту.
  for (const pk of preferredPageKey ? [preferredPageKey] : PAGE_KEYS) {
    const withPage = { ...baseParams, [pk]: PAGE_SIZE };

    for (const sk of SEARCH_KEYS) {
      const { data, status } = await axiosInstance.get<FetchNotesResponse>(
        "/notes",
        {
          params: { ...withPage, [sk]: q },
          signal: options?.signal,
          validateStatus: () => true,
        },
      );

      if (status >= 200 && status < 300 && (data as any)?.notes) {
        preferredPageKey = pk;
        preferredSearchKey = sk;
        lsSet("nh_page_key", pk);
        lsSet("nh_search_key", sk);
        return data;
      }
    }
  }

  // Тихий фолбек (UI не впаде, просто покаже "нічого не знайдено")
  return { notes: [], totalPages: 1, page };
};

export const createNote = async (note: CreateNoteParams): Promise<Note> => {
  const { data } = await axiosInstance.post<Note>("/notes", note);
  return data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const { data } = await axiosInstance.delete<Note>(`/notes/${id}`);
  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const { data } = await axiosInstance.get<Note>(`/notes/${id}`);
  return data;
};
