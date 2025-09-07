"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNote } from "@/lib/api";

type BackendTag = "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";

interface EditNoteFormProps {
  id: string;
  initial: {
    title: string;
    content: string;
    tag: BackendTag;
  };
}

export default function EditNoteForm({ id, initial }: EditNoteFormProps) {
  const router = useRouter();
  const qc = useQueryClient();

  const [title, setTitle] = useState(initial.title ?? "");
  const [content, setContent] = useState(initial.content ?? "");
  const [tag, setTag] = useState<BackendTag>(initial.tag ?? "Todo");

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (patch: { title: string; content: string; tag: BackendTag }) =>
      updateNote(id, patch),
    onSuccess: async () => {
      // оновлюємо кеш списку і конкретної нотатки
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["notes"] }),
        qc.invalidateQueries({ queryKey: ["note", id] }),
      ]);
      // повертаємось на список (або використай router.back(), якщо відкрито з модалки)
      router.push("/notes/filter/All");
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateAsync({ title, content, tag });
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <label>
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      <label>
        Content
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
        />
      </label>

      <label>
        Tag
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value as BackendTag)}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </label>

      {error && <p style={{ color: "crimson" }}>{(error as Error).message}</p>}

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
