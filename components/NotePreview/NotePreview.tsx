import type { Note } from "@/types/note";

export default function NotePreview({ note }: { note: Note }) {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{note.title}</h2>
      <p style={{ color: "#4b5563", whiteSpace: "pre-wrap" }}>{note.content}</p>
      <span
        style={{
          display: "inline-block",
          marginTop: 10,
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
  );
}
