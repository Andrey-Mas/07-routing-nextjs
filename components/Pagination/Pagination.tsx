"use client";

import css from "./Pagination.module.css";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <ul className={css.pagination}>
      <li
        className={!canPrev ? `${css.disabled}` : undefined}
        onClick={() => canPrev && onPageChange(currentPage - 1)}
        role="button"
        aria-label="Previous page"
      >
        <a>‹</a>
      </li>

      {pages.map((p) => (
        <li
          key={p}
          className={p === currentPage ? `${css.active}` : undefined}
          onClick={() => onPageChange(p)}
          role="button"
          aria-current={p === currentPage ? "page" : undefined}
        >
          <a>{p}</a>
        </li>
      ))}

      <li
        className={!canNext ? `${css.disabled}` : undefined}
        onClick={() => canNext && onPageChange(currentPage + 1)}
        role="button"
        aria-label="Next page"
      >
        <a>›</a>
      </li>
    </ul>
  );
}
