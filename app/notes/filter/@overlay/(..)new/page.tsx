import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";

export default function NewNoteOverlayPage() {
  return (
    <Modal title="Create note">
      <NoteForm />
    </Modal>
  );
}
