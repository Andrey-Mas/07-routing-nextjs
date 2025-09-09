"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import css from "./Modal.module.css";

export default function Modal({
  title,
  closeHref,
  children,
}: {
  title?: string;
  closeHref: string; // URL куди повертатись
  children: React.ReactNode;
}) {
  const router = useRouter();

  const close = useCallback(() => {
    // якщо є куди вертатись у History — йдемо back (кращий UX),
    // інакше — replace на closeHref (fallback для прямого входу по URL)
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace(closeHref, { scroll: false });
    }
  }, [router, closeHref]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);

    // блокування скролу фону
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close]);

  // Клік по бекдропу закриває, всередині — ні
  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <div
      className={css.backdrop}
      role="dialog"
      aria-modal="true"
      onClick={onBackdropClick}
    >
      <div className={css.modal} onClick={(e) => e.stopPropagation()}>
        {title && <h3 style={{ margin: 0 }}>{title}</h3>}

        <button
          type="button"
          aria-label="Close"
          onClick={close}
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            background: "transparent",
            border: 0,
            fontSize: 22,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}
