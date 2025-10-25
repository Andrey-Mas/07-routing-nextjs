"use client";

import { ChangeEvent } from "react";
import css from "./SearchBox.module.css";

export default function SearchBox({
  value,
  onChange,
  isLoading,
}: {
  value: string;
  onChange: (v: string) => void;
  isLoading?: boolean;
}) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);

  return (
    <div className={css.wrapper}>
      <input
        className={css.input}
        type="text"
        placeholder="Search notes..."
        value={value}
        onChange={handle}
      />
      {isLoading ? (
        <span className={css.loader} aria-hidden>
          …
        </span>
      ) : null}
    </div>
  );
}
