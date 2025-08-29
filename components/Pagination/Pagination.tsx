"use client";
import ReactPaginate from "react-paginate";
import css from "./Pagination.module.css";

export interface PaginationProps {
  currentPage: number; // 1-based
  totalPages: number;
  onPageChange: (page: number) => void; // 1-based
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <ReactPaginate
      forcePage={currentPage - 1} // 0-based для lib
      pageCount={totalPages}
      onPageChange={(e) => onPageChange(e.selected + 1)} // назад у 1-based
      // підключаємо твої класи
      containerClassName={css.pagination}
      pageClassName={css.page}
      pageLinkClassName={css.link}
      activeClassName={css.active}
      activeLinkClassName={css.activeLink}
      previousClassName={css.page}
      nextClassName={css.page}
      previousLinkClassName={css.link}
      nextLinkClassName={css.link}
      disabledClassName={css.disabled}
      breakClassName={css.page}
      breakLinkClassName={css.link}
      // вміст
      previousLabel="‹"
      nextLabel="›"
      breakLabel="…"
      marginPagesDisplayed={1}
      pageRangeDisplayed={3}
    />
  );
}
