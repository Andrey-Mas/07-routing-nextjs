"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api";

export default function NotePreviewClient({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: true,
  });

  if (isLoading) return <p>Loading…</p>;
  if (isError)
    return <p style={{ color: "#dc3545" }}>{(error as Error).message}</p>;
  if (!data) return <p>Note not found.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Заголовок + прибрали кнопку Close, залишили тільки “×” у Modal */}
      <h2 style={{ margin: 0 }}>{data.title}</h2>

      <div style={{ fontSize: 12, color: "#666" }}>
        {data.createdAt ? new Date(data.createdAt).toLocaleString() : null}
      </div>

      <div>
        <span
          style={{
            display: "inline-block",
            padding: "2px 10px",
            fontSize: 12,
            background: "#e7f1ff",
            border: "1px solid #b6d4fe",
            borderRadius: 12,
          }}
        >
          {data.tag}
        </span>
      </div>

      <div style={{ whiteSpace: "pre-wrap", color: "#333", lineHeight: 1.5 }}>
        {data.content}
      </div>
    </div>
  );
}
