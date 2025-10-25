"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import css from "./Modal.module.css";

export default function Modal({
  title,
  closeHref,
  children,
  onClose,
}: {
  title?: string;
  closeHref: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const router = useRouter();

  // ✅ Надійне закриття: спочатку back, інакше push(closeHref)
  const close = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    try {
      // якщо є історія — повертаємось
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push(closeHref);
      }
    } catch {
      router.push(closeHref);
    }
  }, [onClose, router, closeHref]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    },
    [close],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onKey]);

  return (
    <div className={css.backdrop} onClick={close}>
      <div className={css.modal} onClick={(e) => e.stopPropagation()}>
        {title ? <h3 className={css.title}>{title}</h3> : null}

        <button
          type="button"
          className={css.close}
          aria-label="Close"
          onClick={close}
        >
          ×
        </button>

        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}
