// app/notes/filter/@overlay/(..)[id]/page.tsx
import Modal from "@/components/Modal/Modal";
import NoteModal from "@/components/NoteModal/NoteModal";
import NoteForm from "@/components/NoteForm/NoteForm";

export default async function NoteOverlayPage({
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

  if (id === "new") {
    return (
      <Modal title="Create note" closeHref={from}>
        <NoteForm backTo={from} />
      </Modal>
    );
  }

  return (
    <Modal title="Note details" closeHref={from}>
      <NoteModal id={id} />
    </Modal>
  );
}
