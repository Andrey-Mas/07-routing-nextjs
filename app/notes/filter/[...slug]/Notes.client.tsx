"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteNote, fetchNotes } from "@/lib/api";
import type { FetchNotesResponse, Note, UITag } from "@/types/note";
import css from "./NotesPage.module.css";

/**
 * Будуємо ряд сторінок із “…” (ellipsis).
 * При малих total показуємо всі сторінки, при більших — першу, останню, сусідів поточної.
 */
function buildPages(
  current: number,
  total: number,
  sibling: number = 1,
): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(2, current - sibling);
  const right = Math.min(total - 1, current + sibling);

  const pages: (number | "...")[] = [1];
  if (left > 2) pages.push("...");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

interface NotesClientProps {
  initialPage: number;
  initialQuery: string;
  initialTag: UITag; // "All" або реальний бекенд-тег
}

export default function NotesClient({
  initialPage,
  initialQuery,
  initialTag,
}: NotesClientProps) {
  const router = useRouter();
  const qc = useQueryClient();

  const [page, setPage] = useState<number>(initialPage);
  const [searchTerm, setSearchTerm] = useState<string>(initialQuery);
  const tag = initialTag;

  const debouncedTerm = useDebounce(searchTerm, 400);

  const { data, isPending, isError, error, refetch } =
    useQuery<FetchNotesResponse>({
      queryKey: ["notes", { page, query: debouncedTerm, tag }],
      queryFn: () => fetchNotes({ page, query: debouncedTerm, tag }),
      // аналог keepPreviousData
      placeholderData: (prev) => prev,
    });

  // Безпечні значення
  const items: Note[] = Array.isArray(data?.items)
    ? (data!.items as Note[])
    : [];
  const totalPages: number =
    Number.isFinite(Number(data?.totalPages)) && Number(data?.totalPages) > 0
      ? Number(data!.totalPages)
      : 1;

  // Мутація на видалення
  const { mutateAsync: removeNote, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["notes"] });
      refetch();
    },
  });

  // Скидаємо сторінку при зміні тега
  useEffect(() => {
    setPage(1);
  }, [tag]);

  // Якщо пошук очистили — теж на першу сторінку
  useEffect(() => {
    if (!debouncedTerm) setPage(1);
  }, [debouncedTerm]);

  // Синхронізуємо URL без повного перезавантаження
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));

    const cleaned = debouncedTerm.trim().replace(/[^\p{L}\p{N}\s-]/gu, "");
    if (cleaned) params.set("query", cleaned);

    const base =
      tag && tag !== "All"
        ? `/notes/filter/${encodeURIComponent(tag)}`
        : `/notes/filter/All`;

    const href = params.toString() ? `${base}?${params.toString()}` : base;
    router.replace(href);
  }, [page, debouncedTerm, tag, router]);

  const pageRange = useMemo(
    () => buildPages(page, totalPages, 1),
    [page, totalPages],
  );

  if (isPending) return <p className={css.loading}>Loading...</p>;
  if (isError) return <p className={css.error}>{(error as Error).message}</p>;

  return (
    <div className={css.wrapper}>
      {/* Верхня панель: пошук + кнопка створення */}
      <div className={css.toolbar}>
        <input
          className={css.search}
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Link
          href="/notes/new"
          prefetch={false}
          scroll={false}
          className={css.createBtn}
        >
          Create note +
        </Link>
      </div>

      {/* Сітка карток нотаток */}
      <ul className={css.list}>
        {items.map((note) => (
          <li key={note.id} className={css.card}>
            <h3 className={css.title}>{note.title}</h3>
            <p className={css.body}>{note.content}</p>

            <div className={css.cardFooter}>
              <span className={css.tag}>{note.tag}</span>

              <div className={css.actions}>
                <Link
                  href={`/notes/${note.id}`}
                  scroll={false}
                  className={css.viewBtn}
                >
                  View details
                </Link>

                <button
                  className={css.deleteBtn}
                  disabled={isDeleting}
                  onClick={async () => {
                    if (!confirm("Delete this note?")) return;
                    try {
                      await removeNote(note.id);
                    } catch (e) {
                      // eslint-disable-next-line no-console
                      console.error(e);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {items.length === 0 && <p className={css.empty}>No notes yet</p>}

      {/* Нумерована пагінація з «…» */}
      <div className={css.pagination}>
        <button
          className={css.pageBtn}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pageRange.map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className={css.dots}>
              …
            </span>
          ) : (
            <button
              key={p}
              className={`${css.pageBtn} ${p === page ? css.active : ""}`}
              onClick={() => setPage(p as number)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          className={css.pageBtn}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}
