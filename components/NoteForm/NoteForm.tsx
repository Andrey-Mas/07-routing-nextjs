"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createNote } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NoteTag } from "@/types/note";
import css from "./NoteForm.module.css";

interface NoteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const initialValues = { title: "", content: "", tag: "" as NoteTag };

const schema = Yup.object({
  title: Yup.string().min(3).max(50).required("Title is required"),
  content: Yup.string().min(3).max(500).required("Content is required"),
  tag: Yup.mixed<NoteTag>()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"])
    .required("Tag is required"),
});

export default function NoteForm({ onSuccess, onCancel }: NoteFormProps) {
  const qc = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createNote,
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={async (values, { resetForm }) => {
        await mutateAsync(values);
        // ✅ інвалідовуємо всі варіації списку нотаток (будь-яка сторінка/пошук)
        await qc.invalidateQueries({ queryKey: ["notes"] });
        resetForm();
        onSuccess();
      }}
    >
      <Form className={css.form}>
        <label className={css.formGroup}>
          Title
          <Field className={css.input} name="title" placeholder="Note title" />
          <ErrorMessage className={css.error} name="title" component="span" />
        </label>

        <label className={css.formGroup}>
          Content
          <Field
            className={css.textarea}
            as="textarea"
            name="content"
            rows={5}
            placeholder="Write something..."
          />
          <ErrorMessage className={css.error} name="content" component="span" />
        </label>

        <label className={css.formGroup}>
          Tag
          <Field className={css.select} as="select" name="tag">
            <option value="" disabled>
              Select tag
            </option>
            <option value="Todo">Todo</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Meeting">Meeting</option>
            <option value="Shopping">Shopping</option>
          </Field>
          <ErrorMessage className={css.error} name="tag" component="span" />
        </label>

        <div className={css.actions}>
          <button
            className={css.cancelButton}
            type="button"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className={css.submitButton}
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </Form>
    </Formik>
  );
}
