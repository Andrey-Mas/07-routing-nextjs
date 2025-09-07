export default function NotesRootLayout({
  children,
  overlay,
}: {
  children: React.ReactNode;
  overlay: React.ReactNode;
}) {
  // ВАЖЛИВО: overlay має бути поза основним контентом
  return (
    <>
      {children}
      {overlay}
    </>
  );
}
