import EditNoteForm from "@/components/NoteForm/EditNoteForm";
import { fetchNoteById } from "@/lib/api";

export default async function EditNotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const from =
    typeof sp.from === "string" && sp.from ? sp.from : "/notes/filter/All";

  const note = await fetchNoteById(id);

  return (
    <main style={{ width: "90%", maxWidth: 800, margin: "20px auto" }}>
      <h1 style={{ margin: 0, marginBottom: 16 }}>Edit note</h1>
      <EditNoteForm
        id={note.id}
        initial={{ title: note.title, content: note.content, tag: note.tag }}
        backTo={from}
      />
    </main>
  );
}
