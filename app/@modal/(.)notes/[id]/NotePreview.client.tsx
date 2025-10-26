"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Modal from "@/components/Modal/Modal";
import { fetchNoteById } from "@/lib/api";
import type { Note } from "@/types/note";

export default function NotePreviewClient({ id }: { id: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const fromHref = `${pathname}${search.toString() ? `?${search.toString()}` : ""}`;

  const { data, isLoading, isError, error } = useQuery<Note>({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: false,
  });

  if (isLoading) return <p>Loading…</p>;
  if (isError)
    return <p style={{ color: "#dc3545" }}>{(error as Error).message}</p>;
  if (!data) return <p>Note not found.</p>;

  // захист від undefined
  const createdAt = data.createdAt ? new Date(data.createdAt) : null;

  const handleClose = () => {
    router.back();
  };

  return (
    <Modal
      title={data.title}
      closeHref="/notes/filter/all"
      onClose={handleClose}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {createdAt && (
          <time
            dateTime={createdAt.toISOString()}
            style={{ fontSize: 12, color: "#666" }}
          >
            {createdAt.toLocaleString()}
          </time>
        )}
        <span
          style={{
            padding: "2px 8px",
            fontSize: 12,
            background: "#e7f1ff",
            border: "1px solid #b6d4fe",
            borderRadius: 12,
          }}
        >
          {data.tag}
        </span>
      </div>

      <div
        style={{
          whiteSpace: "pre-wrap",
          color: "#333",
          lineHeight: 1.5,
          marginBottom: 16,
        }}
      >
        {data.content}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          style={{
            display: "inline-block",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
