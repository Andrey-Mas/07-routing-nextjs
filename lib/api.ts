// lib/api.ts
import axios, { AxiosError } from "axios";
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

export const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_NOTES_PAGE_SIZE || 12);

/* ============== Axios instance ============== */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
  },
  withCredentials: false,
});

/* ==================== Types ==================== */
export interface FetchNotesParams {
  page?: number;
  query?: string;
  /** бекенд-тег; якщо "All" — НЕ відправляємо у запиті */
  tag?: string;
}

/* ==================== Helpers ==================== */
const n = (v: unknown, d: number) => {
  const num = Number(v);
  return Number.isFinite(num) && num > 0 ? num : d;
};

/** Універсальна нормалізація форми відповіді бекенда у формат FetchNotesResponse */
function normalizeNotesResponse(raw: any, perPage: number): FetchNotesResponse {
  const candidates = [
    raw?.items,
    raw?.results,
    raw?.docs,
    raw?.data?.items,
    raw?.data?.results,
    raw?.data?.docs,
    raw?.data,
    raw?.notes,
    Array.isArray(raw) ? raw : undefined,
  ];
  const items: Note[] =
    (candidates.find((c) => Array.isArray(c)) as Note[]) || [];

  const total = n(
    raw?.total ?? raw?.totalHits ?? raw?.count ?? raw?.data?.total,
    items.length,
  );
  const page = n(raw?.page ?? raw?.currentPage ?? raw?.data?.page, 1);
  const limit = n(raw?.limit ?? raw?.perPage ?? raw?.data?.limit, perPage);

  const totalPagesRaw = raw?.totalPages ?? raw?.pages ?? raw?.data?.totalPages;
  const totalPages =
    Number.isFinite(Number(totalPagesRaw)) && Number(totalPagesRaw) > 0
      ? Number(totalPagesRaw)
      : Math.max(
          1,
          Math.ceil((total || items.length) / (limit || perPage || 1)),
        );

  return { items, total, page, limit, totalPages };
}

/* ===== Adaptive param selection (окремо для size і для search) ===== */
type SizeKey = "perPage" | "limit";
type QueryKey = "query" | "search" | "q";

/** ⚙️ Розумні дефолти, щоб уникнути перших 400 */
let SELECTED_SIZE_KEY: SizeKey | null = "perPage";
let SELECTED_QUERY_KEY: QueryKey | null = "search";

const SIZE_KEYS: readonly SizeKey[] = ["perPage", "limit"] as const;
const QUERY_KEYS: readonly QueryKey[] = ["search", "query", "q"] as const; // search спробуємо першим

/* ==================== API ==================== */
export const fetchNotes = async (
  params: FetchNotesParams = {},
  options?: { signal?: AbortSignal },
): Promise<FetchNotesResponse> => {
  const page =
    Number.isFinite(params.page) && (params.page as number) > 0
      ? (params.page as number)
      : 1;

  const query = (params.query ?? "").trim();
  const tag = params.tag && params.tag !== "All" ? params.tag : undefined;

  const call = async (sizeKey: SizeKey, queryKey?: QueryKey) => {
    const p: Record<string, any> = {
      page,
      [sizeKey]: PAGE_SIZE,
      ...(tag ? { tag } : {}),
    };
    if (queryKey && query) p[queryKey] = query;
    const { data } = await api.get("/notes", {
      signal: options?.signal,
      params: p,
    });
    return data;
  };

  // 1) Спробуємо з поточними (дефолтними/запам’ятаними) ключами
  try {
    const data = await call(
      (SELECTED_SIZE_KEY as SizeKey) ?? "perPage",
      query ? ((SELECTED_QUERY_KEY as QueryKey) ?? "search") : undefined,
    );
    return normalizeNotesResponse(data, PAGE_SIZE);
  } catch (err) {
    const st = (err as AxiosError)?.response?.status;
    if (!st || st !== 400) {
      // інші помилки не «підбираємо»
      if (axios.isAxiosError(err)) {
        const body = err.response?.data as any;
        const msg =
          typeof body === "string" ? body : body?.message || "Request failed";
        throw new Error(`Failed to load notes (${st ?? "ERR"}). ${msg}`);
      }
      throw err;
    }
    // 400 — перейдемо до підбору
    if (st === 400) {
      // якщо злетіло на дефолтних — скинемо відповідний ключ і підберемо
      if (SELECTED_QUERY_KEY && query) SELECTED_QUERY_KEY = null;
      if (SELECTED_SIZE_KEY == null) SELECTED_SIZE_KEY = "perPage"; // safety
    }
  }

  // 2) Підбір sizeKey (без query, щоб не мішало)
  if (!SELECTED_SIZE_KEY) {
    let lastErr: unknown;
    for (const sk of SIZE_KEYS) {
      try {
        const data = await call(sk);
        SELECTED_SIZE_KEY = sk;
        return normalizeNotesResponse(data, PAGE_SIZE);
      } catch (err) {
        lastErr = err;
        const st = (err as AxiosError)?.response?.status;
        if (st && st !== 400) break;
      }
    }
    if (axios.isAxiosError(lastErr)) {
      const st = lastErr.response?.status;
      const body = lastErr.response?.data as any;
      const msg =
        typeof body === "string" ? body : body?.message || "Bad Request";
      throw new Error(`Failed to load notes (${st}). ${msg}`);
    }
    throw lastErr;
  }

  // 3) Підбір queryKey (тільки якщо є query та ще не обрано ключ)
  if (query && !SELECTED_QUERY_KEY) {
    let lastErr: unknown;
    for (const qk of QUERY_KEYS) {
      try {
        const data = await call(SELECTED_SIZE_KEY, qk);
        SELECTED_QUERY_KEY = qk;
        return normalizeNotesResponse(data, PAGE_SIZE);
      } catch (err) {
        lastErr = err;
        const st = (err as AxiosError)?.response?.status;
        if (st && st !== 400) break;
      }
    }
    if (axios.isAxiosError(lastErr)) {
      const st = lastErr.response?.status;
      const body = lastErr.response?.data as any;
      const msg =
        typeof body === "string" ? body : body?.message || "Bad Request";
      throw new Error(`Failed to load notes (${st}). ${msg}`);
    }
    throw lastErr;
  }

  // 4) Ключі відомі — звичайний виклик без зайвих 400
  const data = await call(
    SELECTED_SIZE_KEY,
    query ? (SELECTED_QUERY_KEY ?? "search") : undefined,
  );
  return normalizeNotesResponse(data, PAGE_SIZE);
};

export const fetchNoteById = async (
  id: string,
  options?: { signal?: AbortSignal },
): Promise<Note> => {
  if (!id) throw new Error("Note id is required");
  const { data } = await api.get<Note>(`/notes/${encodeURIComponent(id)}`, {
    signal: options?.signal,
  });
  return data;
};

export const createNote = async (payload: {
  title: string;
  content: string;
  tag: BackendTag;
}): Promise<Note> => {
  const { data } = await api.post<Note>("/notes", payload);
  return data;
};

export const updateNote = async (
  id: string,
  payload: { title: string; content: string; tag: BackendTag },
): Promise<Note> => {
  if (!id) throw new Error("Note id is required");
  const { data } = await api.patch<Note>(
    `/notes/${encodeURIComponent(id)}`,
    payload,
  );
  return data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  if (!id) throw new Error("Note id is required");
  const { data } = await api.delete<Note>(`/notes/${encodeURIComponent(id)}`);
  return data;
};
