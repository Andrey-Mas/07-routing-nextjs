"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api";

type BackendTag = "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";

export default function NoteForm() {
  const router = useRouter();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<BackendTag>("Todo");

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["notes"] });
      router.push("/notes/filter/All");
    },
  });

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    await mutateAsync({ title: title.trim(), content: content.trim(), tag });
  };

  return (
    <div role="form" aria-labelledby="new-note-title">
      <h2 id="new-note-title" style={{ marginBottom: 12 }}>
        Create note
      </h2>

      <label style={{ display: "block", marginBottom: 8 }}>
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ display: "block", width: "100%", marginTop: 4 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Content
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
          style={{ display: "block", width: "100%", marginTop: 4 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 12 }}>
        Tag
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value as BackendTag)}
          style={{ display: "block", marginTop: 4 }}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </label>

      {error && (
        <p style={{ color: "crimson", marginBottom: 8 }}>
          {(error as Error).message || "Create failed"}
        </p>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" disabled={isPending} onClick={handleSave}>
          {isPending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </div>
  );
}
