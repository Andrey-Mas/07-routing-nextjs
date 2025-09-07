import Link from "next/link";
import css from "./Header.module.css";
import TagsMenu from "@/components/TagsMenu/TagsMenu";

export default function Header() {
  return (
    <header className={css.header}>
      <div className={css.container}>
        <Link href="/" className={css.logo}>
          NoteHub
        </Link>

        <nav>
          <ul className={css.navigation}>
            <li>
              <Link href="/" className={css.link}>
                Home
              </Link>
            </li>
            <li>
              {/* замість посилання Notes */}
              <TagsMenu />
            </li>
            <li>
              <Link href="/about" className={css.link}>
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
