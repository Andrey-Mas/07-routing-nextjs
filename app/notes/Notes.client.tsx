"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { fetchNotes, type FetchNotesResponse } from "@/lib/api";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import SearchBox from "@/components/SearchBox/SearchBox";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import css from "./NotesPage.module.css";

export default function NotesClient({
  initialPage,
  initialQuery,
}: {
  initialPage: number;
  initialQuery: string;
}) {
  const router = useRouter();
  const [page, setPage] = useState(initialPage);
  const [term, setTerm] = useState(initialQuery);
  const [debouncedTerm] = useDebounce(term, 450);
  const [isModalOpen, setModalOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    const cleaned = debouncedTerm.trim().replace(/[^\p{L}\p{N}\s-]/gu, "");
    if (cleaned.length >= 2) params.set("query", cleaned);
    const qs = params.toString();
    router.push(`/notes${qs ? `?${qs}` : ""}`);
  }, [page, debouncedTerm, router]);

  const { data, isLoading, isError } = useQuery<FetchNotesResponse>({
    queryKey: ["notes", { page, query: debouncedTerm }],
    queryFn: () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      return fetchNotes(
        { page, query: debouncedTerm },
        { signal: abortRef.current.signal },
      );
    },
    placeholderData: (prev) => prev,
  });

  const handlePageChange = (p: number) => setPage(p);
  const handleSearchChange = (v: string) => {
    setTerm(v);
    setPage(1);
  };
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  if (isLoading) return <p>Loading, please wait...</p>;
  if (isError || !data) return <p>Something went wrong.</p>;

  return (
    <div className={css.app}>
      {/* тулбар */}
      <div className={css.toolbar}>
        <SearchBox value={term} onChange={handleSearchChange} />
        <div className={css.toolbarRight}>
          <button className={css.primary} onClick={openModal}>
            Create note +
          </button>
        </div>
      </div>

      {/* пагінація зверху */}
      {data.totalPages > 1 && (
        <div className={css.paginationTop}>
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* список */}
      {data.notes.length === 0 ? (
        <div
          style={{
            padding: 24,
            border: "1px dashed #dee2e6",
            borderRadius: 8,
            background: "#fff",
          }}
        >
          <p style={{ margin: 0 }}>
            No notes found
            {term.trim() ? (
              <>
                {" "}
                for “<strong>{term.trim()}</strong>”.
              </>
            ) : (
              "."
            )}
          </p>
          {term.trim() && (
            <button
              className={css.primary}
              style={{ marginTop: 12 }}
              onClick={() => {
                setTerm("");
                setPage(1);
              }}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <NoteList notes={data.notes} page={page} query={debouncedTerm} />
      )}

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <NoteForm onSuccess={closeModal} onCancel={closeModal} />
        </Modal>
      )}
    </div>
  );
}
