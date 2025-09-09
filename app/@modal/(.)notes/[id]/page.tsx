// app/@modal/(.)notes/[id]/page.tsx
import Modal from "@/components/Modal/Modal";
import NoteModal from "@/components/NoteModal/NoteModal";

export default async function NoteDetailsModal({
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

  return (
    <Modal title="Note details" closeHref={from}>
      <NoteModal id={id} />
    </Modal>
  );
}
