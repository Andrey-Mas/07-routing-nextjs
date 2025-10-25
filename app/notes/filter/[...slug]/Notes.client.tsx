"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import type { FetchNotesResponse, UITag, BackendTag } from "@/types/note";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteList from "@/components/NoteList/NoteList";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import css from "./NotesPage.module.css";

export default function NotesClient({
  initialPage,
  initialQuery,
  initialTag,
}: {
  initialPage: number;
  initialQuery: string;
  initialTag: UITag;
}) {
  const router = useRouter();
  const [page, setPage] = useState(initialPage);
  const [query, setQuery] = useState(initialQuery);
  const [isCreateOpen, setCreateOpen] = useState(false);

  // ✍️ чернетка зберігається між відкриттями модалки
  const [draft, setDraft] = useState<{
    title: string;
    content: string;
    tag: BackendTag;
  }>({
    title: "",
    content: "",
    tag: "Todo",
  });

  const debouncedQuery = useDebounce(query, 400);

  // keep URL in sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (page && page !== 1) params.set("page", String(page));
    if (debouncedQuery) params.set("query", debouncedQuery);
    const qs = params.toString();
    const href = qs
      ? `/notes/filter/${encodeURIComponent(initialTag)}?${qs}`
      : `/notes/filter/${encodeURIComponent(initialTag)}`;
    router.replace(href, { scroll: false });
  }, [page, debouncedQuery, initialTag, router]);

  // Fetch notes
  const { data, isFetching, isError, error } = useQuery<FetchNotesResponse>({
    queryKey: ["notes", { page, query: debouncedQuery, tag: initialTag }],
    queryFn: () => fetchNotes({ page, query: debouncedQuery, tag: initialTag }),
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.totalPages ?? 1;
  const notes = data?.items ?? [];

  const fromHref = useMemo(() => {
    const params = new URLSearchParams();
    if (page && page !== 1) params.set("page", String(page));
    if (debouncedQuery) params.set("query", debouncedQuery);
    return `/notes/filter/${encodeURIComponent(initialTag)}${
      params.toString() ? `?${params}` : ""
    }`;
  }, [page, debouncedQuery, initialTag]);

  // reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, initialTag]);

  return (
    <main className={css.container}>
      <div className={css.headerRow}>
        <h1 className={css.title}>Notes — {initialTag}</h1>
        <div className={css.headerActions}>
          <button
            className={css.createButton}
            onClick={() => setCreateOpen(true)}
          >
            + New note
          </button>
          <Link href="/" className={css.homeLink}>
            Home
          </Link>
        </div>
      </div>

      <SearchBox value={query} onChange={setQuery} isLoading={isFetching} />

      {isError ? (
        <p className={css.errorText}>{(error as Error).message}</p>
      ) : (
        <>
          <NoteList notes={notes} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {isCreateOpen && (
        <Modal
          title="Create note"
          closeHref={fromHref}
          onClose={() => setCreateOpen(false)} // локально закриваємо без навігації
        >
          <NoteForm
            backTo={fromHref}
            // керовані пропси з чернетки
            title={draft.title}
            content={draft.content}
            tag={draft.tag}
            onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            // успіх: очищаємо чернетку і закриваємо модалку
            onSuccess={() => {
              setDraft({ title: "", content: "", tag: "Todo" });
              setCreateOpen(false);
            }}
            // cancel: просто закриваємо модалку, чернетка залишається
            onCancel={() => setCreateOpen(false)}
          />
        </Modal>
      )}
    </main>
  );
}
