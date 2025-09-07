"use client";

import Link from "next/link";
import { TAGS_UI, UITag } from "@/types/note";
import css from "./SidebarNotes.module.css";

export default function SidebarNotes() {
  return (
    <nav className={css.container} aria-label="Filter notes by tag">
      <ul className={css.menuList}>
        {TAGS_UI.map((tag: UITag) => {
          const href =
            tag === "All" ? "/notes/filter/All" : `/notes/filter/${tag}`;
          return (
            <li key={tag} className={css.menuItem}>
              <Link href={href} className={css.menuLink}>
                {tag}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
