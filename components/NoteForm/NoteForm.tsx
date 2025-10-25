"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api";
import type { BackendTag } from "@/types/note";
import css from "./NoteForm.module.css";

type Props = {
  backTo?: string;

  // керовані пропси (необов’язкові)
  title?: string;
  content?: string;
  tag?: BackendTag;
  onChange?: (
    p: Partial<{ title: string; content: string; tag: BackendTag }>,
  ) => void;

  // колбеки
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function NoteForm({
  backTo,
  title: titleProp,
  content: contentProp,
  tag: tagProp,
  onChange,
  onSuccess,
  onCancel,
}: Props) {
  const router = useRouter();
  const qc = useQueryClient();

  // якщо передані керовані пропси/колбек — працюємо у controlled-режимі
  const isControlled = useMemo(
    () =>
      onChange != null ||
      titleProp != null ||
      contentProp != null ||
      tagProp != null,
    [onChange, titleProp, contentProp, tagProp],
  );

  // локальний стан — тільки для некерованого режиму
  const [titleLocal, setTitleLocal] = useState("");
  const [contentLocal, setContentLocal] = useState("");
  const [tagLocal, setTagLocal] = useState<BackendTag>("Todo");

  const title = isControlled ? (titleProp ?? "") : titleLocal;
  const content = isControlled ? (contentProp ?? "") : contentLocal;
  const tag = isControlled ? (tagProp ?? "Todo") : tagLocal;

  const setTitle = (v: string) =>
    isControlled ? onChange?.({ title: v }) : setTitleLocal(v);
  const setContent = (v: string) =>
    isControlled ? onChange?.({ content: v }) : setContentLocal(v);
  const setTag = (v: BackendTag) =>
    isControlled ? onChange?.({ tag: v }) : setTagLocal(v);

  const {
    mutateAsync: save,
    isPending,
    error,
    isError,
  } = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["notes"] });

      // очищаємо лише локальний стан; у керованому режимі — батько сам чистить
      if (!isControlled) {
        setTitleLocal("");
        setContentLocal("");
        setTagLocal("Todo");
      }

      if (onSuccess) onSuccess();
      else if (backTo) router.push(backTo);
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save({ title, content, tag });
  };

  return (
    <form onSubmit={onSubmit} className={css.form}>
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

      {isError && <p className={css.error}>{error?.message}</p>}

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={() =>
            onCancel ? onCancel() : backTo ? router.push(backTo) : null
          }
        >
          Cancel
        </button>

        <button type="submit" disabled={isPending} className={css.submitButton}>
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
