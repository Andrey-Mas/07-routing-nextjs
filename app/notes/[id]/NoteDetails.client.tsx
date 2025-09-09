"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api"; // якщо немає alias @ — заміни на відносний імпорт

export default function NoteDetailsClient({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  if (isLoading) return <p>Loading…</p>;
  if (isError)
    return <p style={{ color: "#dc3545" }}>{(error as Error).message}</p>;
  if (!data) return <p>Note not found.</p>;

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>{data.title}</h2>
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 12,
            color: "#0d6efd",
            background: "#e7f1ff",
            border: "1px solid #b6d4fe",
            borderRadius: 12,
          }}
        >
          {data.tag}
        </span>
      </header>
      <div style={{ whiteSpace: "pre-wrap", color: "#333", lineHeight: 1.5 }}>
        {data.content}
      </div>
    </article>
  );
}
