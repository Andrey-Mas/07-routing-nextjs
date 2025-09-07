// lib/api.ts
import axios from "axios";
import type { Note, BackendTag, FetchNotesResponse } from "@/types/note";

/* ================== CONFIG ================== */
const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://notehub-public.goit.study/api"
).trim();

const TOKEN = (
  process.env.NEXT_PUBLIC_API_TOKEN ||
  process.env.NEXT_PUBLIC_NOTEHUB_TOKEN ||
  ""
).trim();

export const PAGE_SIZE =
  Number(process.env.NEXT_PUBLIC_NOTES_PAGE_SIZE ?? 10) || 10;

/** можливі ключі для пошуку (бекенд може відрізнятися) */
const SEARCH_KEYS = ["search", "query", "q", "title"] as const;
type SearchKey = (typeof SEARCH_KEYS)[number];

/** можливі ключі розміру сторінки */
const PAGE_KEYS = ["perPage", "limit", "pageSize"] as const;
type PageKey = (typeof PAGE_KEYS)[number];

/** Якщо в .env задано фіксований ключ пошуку — використаємо його (як у HW06) */
let preferredSearchKey: SearchKey | null =
  ((process.env.NEXT_PUBLIC_NOTES_SEARCH_KEY as SearchKey) ?? null) || null;

/** Кешований робочий ключ для розміру сторінки */
let preferredPageKey: PageKey | null = null;

/* ============== AXIOS INSTANCE ============== */
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
  },
});

/* ================== HELPERS ================== */
const lsGet = (k: string) =>
  typeof window === "undefined" ? null : window.localStorage.getItem(k);
const lsSet = (k: string, v: string) =>
  typeof window === "undefined" ? void 0 : window.localStorage.setItem(k, v);

/** Нормалізація терму пошуку */
const clean = (s: string) => s.trim().replace(/[^\p{L}\p{N}\s-]/gu, "");

/** Підтримує різні форми відповіді бекенда */
function normalizeNotesResponse(
  raw: any,
  fallback: { page: number; limit: number },
): FetchNotesResponse {
  // GoIT формат: { data: [], page, perPage, totalItems, totalPages }
  if (Array.isArray(raw?.data)) {
    const items: Note[] = (raw.data as any[]).map((n) => ({
      ...n,
      tag: n.tag as BackendTag,
    }));
    const total = Number(raw.totalItems ?? items.length ?? 0) || 0;
    const page = Number(raw.page ?? fallback.page) || fallback.page;
    const limit = Number(raw.perPage ?? fallback.limit) || fallback.limit;
    const totalPages =
      Number(raw.totalPages) ||
      Math.max(1, Math.ceil(total / Math.max(1, limit)));
    return { items, total, page, limit, totalPages };
  }

  // Старий формат HW06: { notes: [], totalPages, page }
  if (Array.isArray(raw?.notes)) {
    const items: Note[] = (raw.notes as any[]).map((n) => ({
      ...n,
      tag: n.tag as BackendTag,
    }));
    const totalPages =
      Number(raw.totalPages) ||
      Math.max(
        1,
        Math.ceil(
          (items.length || fallback.limit) / Math.max(1, fallback.limit),
        ),
      );
    const page = Number(raw.page ?? fallback.page) || fallback.page;
    const limit = fallback.limit;
    const total = totalPages * limit;
    return { items, total, page, limit, totalPages };
  }

  // Запасні варіанти
  const items: Note[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : [];
  const total = Number(raw?.total ?? items.length ?? 0) || 0;
  const page = Number(raw?.page ?? fallback.page) || fallback.page;
  const limit = Number(raw?.limit ?? fallback.limit) || fallback.limit;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  return { items, total, page, limit, totalPages };
}

/* ==================== API ==================== */
export interface FetchNotesParams {
  page?: number;
  query?: string;
  /** бекенд-тег; якщо "All" — не відправляємо */
  tag?: string;
}

/** Список нотаток з пагінацією/пошуком/фільтром за тегом */
export const fetchNotes = async (
  params: FetchNotesParams = {},
  options?: { signal?: AbortSignal },
): Promise<FetchNotesResponse> => {
  const page =
    Number.isFinite(params.page) && (params.page as number) > 0
      ? (params.page as number)
      : 1;

  const q = clean(params.query ?? "");
  const tag = params.tag && params.tag !== "All" ? params.tag : undefined;

  // базові параметри
  const baseParams: Record<string, string | number> = { page };
  if (preferredPageKey) baseParams[preferredPageKey] = PAGE_SIZE;
  if (tag) baseParams.tag = tag;

  // піднімемо кеш ключів, якщо ще не ініціалізували
  preferredSearchKey ??=
    (lsGet("nh_search_key") as SearchKey | null) ?? preferredSearchKey;
  preferredPageKey ??= (lsGet("nh_page_key") as PageKey | null) ?? null;

  // 1) короткий пошук — НЕ додаємо поле пошуку, але тег працює
  if (q.length < 2) {
    const { data } = await axiosInstance.get("/notes", {
      params: baseParams,
      signal: options?.signal,
    });
    return normalizeNotesResponse(data, { page, limit: PAGE_SIZE });
  }

  // 2) якщо знаємо робочий ключ пошуку — використовуємо його
  if (preferredSearchKey) {
    const paramsReady: Record<string, string | number> = {
      ...baseParams,
      [preferredSearchKey]: q,
    };

    const { data } = await axiosInstance.get("/notes", {
      params: paramsReady,
      signal: options?.signal,
    });

    // якщо ще не зафіксували pageKey — одноразово підберемо
    if (!preferredPageKey && (data?.data || data?.notes)) {
      for (const pk of PAGE_KEYS) {
        const probeParams: Record<string, string | number> = {
          page,
          [pk]: PAGE_SIZE,
          [preferredSearchKey]: q,
        };
        if (tag) probeParams.tag = tag;

        const { data: probe } = await axiosInstance.get("/notes", {
          params: probeParams,
          signal: options?.signal,
        });
        if (probe?.data || probe?.notes) {
          preferredPageKey = pk;
          lsSet("nh_page_key", pk);
          break;
        }
      }
    }

    return normalizeNotesResponse(data, { page, limit: PAGE_SIZE });
  }

  // 3) автопідбір ключів: перебираємо pageKey та searchKey
  for (const pk of preferredPageKey ? [preferredPageKey] : PAGE_KEYS) {
    const withPage: Record<string, string | number> = { page, [pk]: PAGE_SIZE };
    if (tag) withPage.tag = tag;

    for (const sk of SEARCH_KEYS) {
      const tryParams = { ...withPage, [sk]: q };
      const { data } = await axiosInstance.get("/notes", {
        params: tryParams,
        signal: options?.signal,
      });

      if (data?.data || data?.notes) {
        preferredPageKey = pk;
        preferredSearchKey = sk;
        lsSet("nh_page_key", pk);
        lsSet("nh_search_key", sk);
        return normalizeNotesResponse(data, { page, limit: PAGE_SIZE });
      }
    }
  }

  // фолбек
  return { items: [], total: 0, page, limit: PAGE_SIZE, totalPages: 1 };
};

/** Отримати одну нотатку за id */
export const fetchNoteById = async (id: string): Promise<Note> => {
  const { data } = await axiosInstance.get(`/notes/${encodeURIComponent(id)}`);
  const note = data?.data ?? data;
  return { ...note, tag: note.tag as BackendTag } as Note;
};

/** Створити нотатку (ЛИШЕ POST /notes) */
export const createNote = async (payload: {
  title: string;
  content: string;
  tag: "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";
}): Promise<Note> => {
  const { data } = await axiosInstance.post("/notes", payload);
  return (data?.data ?? data) as Note;
};

/** Оновити нотатку */
export const updateNote = async (
  id: string,
  patch: Partial<Pick<Note, "title" | "content" | "tag">>,
): Promise<Note> => {
  const { data } = await axiosInstance.patch(
    `/notes/${encodeURIComponent(id)}`,
    patch,
  );
  const note = data?.data ?? data;
  return { ...note, tag: note.tag as BackendTag } as Note;
};

/** Видалити нотатку */
export const deleteNote = async (id: string) => {
  const { data } = await axiosInstance.delete(
    `/notes/${encodeURIComponent(id)}`,
  );
  return data as { ok: boolean };
};
