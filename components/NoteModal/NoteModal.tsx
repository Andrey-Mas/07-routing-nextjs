"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api";
import type { Note } from "@/types/note";

export default function NoteModal({ id }: { id: string }) {
  if (!id || id === "new") return null;

  const { data, isLoading, isError, error } = useQuery<Note>({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
    enabled: !!id && id !== "new",
  });

  if (isLoading) return <p>Loading…</p>;
  if (isError)
    return <p style={{ color: "crimson" }}>{(error as Error).message}</p>;
  if (!data) return null;

  return (
    <article>
      <h2>{data.title}</h2>
      <p>{data.content}</p>
      <span>{data.tag}</span>
    </article>
  );
}
