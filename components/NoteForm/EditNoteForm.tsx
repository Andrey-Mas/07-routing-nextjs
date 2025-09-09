"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNote } from "@/lib/api";
import css from "./NoteForm.module.css";

type BackendTag = "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";

export default function EditNoteForm({
  id,
  initial,
  backTo,
}: {
  id: string;
  initial: { title: string; content: string; tag: BackendTag };
  backTo?: string;
}) {
  const router = useRouter();
  const qc = useQueryClient();

  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [tag, setTag] = useState<BackendTag>(initial.tag);

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: {
      title: string;
      content: string;
      tag: BackendTag;
    }) => updateNote(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["notes"] });
      await qc.refetchQueries({ queryKey: ["notes"], type: "active" });
      router.replace(backTo ?? "/notes/filter/All");
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateAsync({ title, content, tag });
  };

  return (
    <form className={css.form} onSubmit={onSubmit}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          className={css.input}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          className={css.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          className={css.select}
          value={tag}
          onChange={(e) => setTag(e.target.value as BackendTag)}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </div>

      {error && <p className={css.error}>{(error as Error).message}</p>}

      <div className={css.actions}>
        {backTo && (
          <Link href={backTo} scroll={false} className={css.cancelButton}>
            Cancel
          </Link>
        )}
        <button type="submit" disabled={isPending} className={css.submitButton}>
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
