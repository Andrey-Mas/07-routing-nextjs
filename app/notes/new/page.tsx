import NoteForm from "@/components/NoteForm/NoteForm";

export default function NewNotePage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1>Create note</h1>
      <NoteForm />
    </main>
  );
}
