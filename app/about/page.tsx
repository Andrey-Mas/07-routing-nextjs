import css from "./About.module.css";

export default function AboutPage() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>About NoteHub</h1>
        <p className={css.description}>
          NoteHub is a simple note-taking app built with Next.js.
        </p>
        <p className={css.description}>
          This project is part of the GoIT course homework, demonstrating
          routing, SSR, CSR, and API integration.
        </p>
      </div>
    </main>
  );
}
