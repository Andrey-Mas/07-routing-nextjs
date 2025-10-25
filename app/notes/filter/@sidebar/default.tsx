import css from "./SidebarNotes.module.css";
import { TAGS_UI, UITag } from "@/types/note";

export default function SidebarDefault() {
  return (
    <ul className={css.menuList}>
      {TAGS_UI.map((tag: UITag) => {
        const href = tag === "All" ? "/notes/filter/All" : `/notes/filter/${encodeURIComponent(tag)}`;
        return (
          <li className={css.menuItem} key={tag}>
            <a href={href} className={css.menuLink}>{tag}</a>
          </li>
        );
      })}
    </ul>
  );
}
