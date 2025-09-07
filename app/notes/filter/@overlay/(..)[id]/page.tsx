import { use } from "react";
import Modal from "@/components/Modal/Modal";
import NoteModal from "@/components/NoteModal/NoteModal";

export default function NoteOverlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // ⚠️ Захист: якщо id === "new", НЕ показуємо NoteModal
  if (id === "new") return null;

  return (
    <Modal title="Note details">
      <NoteModal id={id} />
    </Modal>
  );
}
