"use client";

import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./Modal.module.css";

export default function Modal({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  // Куди повертатись, якщо history порожня
  const fallbackHref = useMemo(() => {
    // якщо ми в дереві /notes/filter/..., збережемо активний tag/query/page
    // приклад: /notes/filter/Work?page=2&query=abc
    const m = pathname.match(/^\/notes\/filter\/([^/?#]+)/);
    const activeTag = m?.[1] ?? "All";
    const qs = new URLSearchParams();

    const page = search.get("page");
    const query = search.get("query");
    if (page) qs.set("page", page);
    if (query) qs.set("query", query);

    const base =
      activeTag && activeTag !== "All"
        ? `/notes/filter/${encodeURIComponent(activeTag)}`
        : `/notes/filter/All`;

    return qs.toString() ? `${base}?${qs}` : base;
  }, [pathname, search]);

  const close = () => {
    // спробуємо піти назад
    if (window.history.length > 1) {
      router.back();
    } else {
      // або fallback на список
      router.push(fallbackHref);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, []); // eslint-disable-line

  const node = (
    <div className={styles.backdrop} onClick={close} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Modal window"}
      >
        <button
          type="button"
          className={styles.close}
          onClick={close}
          aria-label="Close"
        >
          ×
        </button>
        {title && <h2 className={styles.title}>{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
