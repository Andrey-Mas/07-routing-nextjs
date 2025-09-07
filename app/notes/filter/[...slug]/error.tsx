"use client";

import { useEffect } from "react";
import css from "./NotesPage.module.css";

export default function NotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Notes page error:", error);
  }, [error]);

  return (
    <div className={css.error}>
      <h2>Something went wrong 😢</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
