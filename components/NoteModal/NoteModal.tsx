"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api";
import css from "./NoteModal.module.css";

export default function NoteModal({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  if (isLoading) return <p>Loading…</p>;
  if (isError)
    return <p style={{ color: "#dc3545" }}>{(error as Error).message}</p>;
  if (!data) return <p>Note not found.</p>;

  return (
    <div className={css.item}>
      <div className={css.header}>
        <h2>{data.title}</h2>
        <span className={css.tag}>{data.tag}</span>
      </div>
      <div className={css.content}>{data.content}</div>
    </div>
  );
}
