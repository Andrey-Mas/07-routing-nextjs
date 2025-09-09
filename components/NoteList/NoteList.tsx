"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNote } from "@/lib/api";
import type { Note } from "@/types/note";
import css from "./NoteList.module.css";

export default function NoteList({
  notes,
  page,
  query,
  from,
}: {
  notes: Note[];
  page: number;
  query: string;
  from: string; // поточний URL, щоб модалки знали куди закриватись
}) {
  const qc = useQueryClient();
  const { mutateAsync: remove, isPending } = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  if (!notes?.length) return null;

  return (
    <ul className={css.list}>
      {notes.map((n) => (
        <li key={n.id} className={css.listItem}>
          <h3 className={css.title}>{n.title}</h3>
          <p className={css.content}>{n.content}</p>

          <div className={css.footer}>
            <span className={css.tag}>{n.tag}</span>
            <div style={{ display: "flex", gap: 8 }}>
              {/* VIEW у модалці з поверненням на from */}
              <Link
                href={{ pathname: `/notes/${n.id}`, query: { from } }}
                scroll={false}
                className={css.link}
              >
                View
              </Link>

              {/* якщо редагування теж у модалці — додай аналогічно */}
              <Link href={`/notes/${n.id}/edit`} className={css.link}>
                Edit
              </Link>

              <button
                className={css.button}
                onClick={() => remove(n.id)}
                disabled={isPending}
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
