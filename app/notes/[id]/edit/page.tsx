import Modal from "@/components/Modal/Modal";
import EditNoteForm from "@/components/NoteForm/EditNoteForm";
import { fetchNoteById } from "@/lib/api";

export default async function EditNoteModalPage({
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
    <Modal title="Edit note" closeHref={from}>
      <EditNoteForm
        id={note.id}
        initial={{ title: note.title, content: note.content, tag: note.tag }}
        backTo={from}
      />
    </Modal>
  );
}
