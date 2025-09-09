"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import css from "./TagsMenu.module.css";
import { TAGS_UI, UITag } from "@/types/note";

export default function TagsMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className={css.menuContainer} ref={menuRef}>
      <button
        type="button"
        className={css.menuButton}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Notes ▾
      </button>

      {open && (
        <ul className={css.menuList} role="menu">
          {TAGS_UI.map((tag: UITag) => {
            const href =
              tag === "All"
                ? "/notes/filter/All"
                : `/notes/filter/${encodeURIComponent(tag)}`;
            return (
              <li className={css.menuItem} key={tag} role="none">
                <Link
                  href={href}
                  className={css.menuLink}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  {tag}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
