"use client";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNote } from "@/lib/api";
import type { Note } from "@/types/note";
import css from "./NoteList.module.css";

interface NoteListProps {
  notes: Note[];
  page: number;
  query: string;
}

export default function NoteList({ notes, page, query }: NoteListProps) {
  const qc = useQueryClient();

  const { mutateAsync: remove, isPending } = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: async () => {
      // інвалідовуємо поточний список нотаток
      await qc.invalidateQueries({ queryKey: ["notes", { page, query }] });
    },
  });

  return (
    <ul className={css.list}>
      {notes.map((n) => (
        <li key={n.id} className={css.listItem}>
          <div>
            <h3 className={css.title}>{n.title}</h3>
            <p className={css.content}>{n.content}</p>
          </div>

          <div className={css.footer}>
            <span className={css.tag}>{n.tag}</span>

            <div style={{ display: "flex", gap: 8 }}>
              <Link className={css.link} href={`/notes/${n.id}`}>
                View details
              </Link>
              <button
                className={css.button}
                onClick={() => remove(n.id)}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
