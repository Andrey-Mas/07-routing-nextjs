import css from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={css.footer}>
      <div className={css.wrap}>
        <p>© {new Date().getFullYear()} NoteHub. All rights reserved.</p>
      </div>
      <div className={css.wrap}>
        <p>Developer: Andrii</p>
        <p>
          Contact us:{" "}
          <a href="mailto:student@notehub.app">student@notehub.app</a>
        </p>
      </div>
    </footer>
  );
}
