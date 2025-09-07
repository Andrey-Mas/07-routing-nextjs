// app/notes/[id]/edit/page.tsx
import EditNoteForm from "@/components/NoteForm/EditNoteForm";
import { fetchNoteById } from "@/lib/api";
import type { Note } from "@/types/note";

// у Next 14.2+ params може бути Promise
type MaybePromise<T> = T | Promise<T>;

export default async function EditNotePage({
  params,
}: {
  params: MaybePromise<{ id: string }>;
}) {
  const { id } =
    typeof (params as any)?.then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });

  const note: Note = await fetchNoteById(id);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Edit note</h1>
      <EditNoteForm
        id={id}
        initial={{
          title: note.title,
          content: note.content,
          // приведемо до бекенд-тега; якщо у типах уже BackendTag — просто note.tag
          tag: note.tag as
            | "Todo"
            | "Work"
            | "Personal"
            | "Meeting"
            | "Shopping",
        }}
      />
    </main>
  );
}
