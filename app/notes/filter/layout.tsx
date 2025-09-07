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
    <div className={css.layout}>
      <aside className={css.sidebar}>{sidebar}</aside>
      <section className={css.content}>{children}</section>
      {overlay} {/* ← тут зʼявляється модалка */}
    </div>
  );
}
