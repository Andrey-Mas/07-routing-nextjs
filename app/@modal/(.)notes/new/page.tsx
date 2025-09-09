// app/@modal/(.)notes/new/page.tsx
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";

export default async function NewNoteModal({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const from =
    typeof sp.from === "string" && sp.from ? sp.from : "/notes/filter/All";

  return (
    <Modal title="Create note" closeHref={from}>
      <NoteForm backTo={from} />
    </Modal>
  );
}
