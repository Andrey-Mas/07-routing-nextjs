import Link from "next/link";
import { fetchNoteById } from "@/lib/api";
import css from "./NotePreview.module.css"; // ⬅️ локальний css поруч

export default async function NotePage({
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
    <main className={css.container}>
      <Link href={from} className={css.backBtn}>
        ← Back
      </Link>

      <div className={css.item}>
        <div className={css.header}>
          <h2>{note.title}</h2>
          <span className={css.tag}>{note.tag}</span>
        </div>

        <div className={css.content}>{note.content}</div>

        <div className={css.date}>
          {note.updatedAt
            ? new Date(note.updatedAt).toLocaleString()
            : note.createdAt
              ? new Date(note.createdAt).toLocaleString()
              : ""}
        </div>
      </div>
    </main>
  );
}
