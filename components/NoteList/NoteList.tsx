"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNote } from "@/lib/api";
import type { Note } from "@/types/note";
import css from "./NoteList.module.css";

export default function NoteList({ notes }: { notes: Note[] }) {
  const qc = useQueryClient();
  const pathname = usePathname();
  const search = useSearchParams();
  const fromHref = `${pathname}${search.toString() ? `?${search.toString()}` : ""}`;

  const { mutateAsync: remove, isPending } = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return (
    <ul className={css.list}>
      {notes.map((n) => (
        <li key={n.id} className={css.listItem}>
          <h3 className={css.title}>{n.title}</h3>
          <p className={css.content}>{n.content}</p>
          <div className={css.footer}>
            <span className={css.tag}>{n.tag}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href={{ pathname: `/notes/${n.id}`, query: { from: fromHref } }}
                scroll={false}
                className={css.link}
              >
                View
              </Link>
              <Link
                href={{
                  pathname: `/notes/${n.id}/edit`,
                  query: { from: fromHref },
                }}
                scroll={false}
                className={css.link}
              >
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
