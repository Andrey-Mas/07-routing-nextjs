"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import type { FetchNotesResponse, UITag } from "@/types/note";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteList from "@/components/NoteList/NoteList";
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
  const [page, setPage] = useState<number>(initialPage || 1);
  const [searchTerm, setSearchTerm] = useState<string>(initialQuery || "");
  const debouncedQuery = useDebounce(searchTerm, 500);

  const baseHref = useMemo(
    () =>
      initialTag === "All"
        ? "/notes/filter/All"
        : `/notes/filter/${encodeURIComponent(initialTag)}`,
    [initialTag],
  );

  const fromHref = useMemo(() => {
    const p = new URLSearchParams();
    if (page && page !== 1) p.set("page", String(page));
    if (debouncedQuery) p.set("query", debouncedQuery);
    const qs = p.toString();
    return qs ? `${baseHref}?${qs}` : baseHref;
  }, [baseHref, page, debouncedQuery]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (page && page !== 1) p.set("page", String(page));
    if (debouncedQuery) p.set("query", debouncedQuery);
    const qs = p.toString();
    router.replace(qs ? `${baseHref}?${qs}` : baseHref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQuery, baseHref]);

  const { data, isLoading, isError, error } = useQuery<FetchNotesResponse>({
    queryKey: ["notes", { page, query: debouncedQuery, tag: initialTag }],
    queryFn: () => fetchNotes({ page, query: debouncedQuery, tag: initialTag }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <main className={css.app}>
      <div className={css.toolbar}>
        <SearchBox value={searchTerm} onChange={setSearchTerm} />
        <Link
          href={{ pathname: "/notes/new", query: { from: fromHref } }}
          scroll={false}
          className={css.button}
        >
          Create note +
        </Link>
      </div>

      {isLoading && <p>Loading…</p>}
      {isError && (
        <div
          style={{
            color: "#dc3545",
            background: "#ffe6e9",
            padding: 12,
            borderRadius: 8,
          }}
        >
          {(error as Error).message}
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && <p>No notes found.</p>}

      {!isLoading && !isError && items.length > 0 && (
        <>
          <NoteList
            notes={items}
            page={page}
            query={debouncedQuery}
            from={fromHref}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </main>
  );
}
