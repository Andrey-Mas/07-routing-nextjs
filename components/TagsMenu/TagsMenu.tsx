"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TAGS_UI, UITag } from "@/types/note";
import css from "./TagsMenu.module.css";

export default function TagsMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) =>
      wrapRef.current &&
      !wrapRef.current.contains(e.target as Node) &&
      setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={css.menuContainer} ref={wrapRef}>
      <button
        type="button"
        className={css.menuButton}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Notes ▾
      </button>

      <ul className={`${css.menuList} ${open ? css.open : ""}`} role="menu">
        {TAGS_UI.map((tag: UITag) => {
          const href =
            tag === "All" ? "/notes/filter/All" : `/notes/filter/${tag}`;
          return (
            <li key={tag} className={css.menuItem} role="none">
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
    </div>
  );
}
