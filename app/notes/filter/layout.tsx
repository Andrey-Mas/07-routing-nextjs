import css from "./Layout.module.css";

export default function NotesLayout({
  children,
  sidebar,
  overlay,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  overlay: React.ReactNode;
}) {
  return (
    <div className={css.container}>
      <aside className={css.sidebar}>{sidebar}</aside>
      <div className={css.notesWrapper}>{children}</div>
      {overlay}
    </div>
  );
}
