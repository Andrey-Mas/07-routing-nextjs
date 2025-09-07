// app/notes/[id]/page.tsx
import { fetchNoteById } from "@/lib/api";
import type { Note } from "@/types/note";

export const dynamic = "force-dynamic";

type MaybePromise<T> = T | Promise<T>;

export default async function NoteDetailsPage({
  params,
}: {
  params: MaybePromise<{ id: string }>;
}) {
  // ⚠️ await params
  const p =
    typeof (params as any)?.then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });

  const note: Note = await fetchNoteById(p.id);

  return (
    <main style={{ maxWidth: 860, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>{note.title}</h1>
      <p style={{ color: "#4b5563", whiteSpace: "pre-wrap", marginTop: 8 }}>
        {note.content}
      </p>
      <div style={{ marginTop: 12 }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 10px",
            fontSize: 12,
            borderRadius: 999,
            background: "#eef2ff",
            color: "#3b82f6",
            border: "1px solid #dbeafe",
          }}
        >
          {note.tag}
        </span>
      </div>
    </main>
  );
}
