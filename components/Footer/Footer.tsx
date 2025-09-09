import css from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={css.footer}>
      <div className={css.wrap}>
        <a href="https://github.com" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="https://vercel.com" target="_blank" rel="noreferrer">
          Vercel
        </a>
      </div>
    </footer>
  );
}
