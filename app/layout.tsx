// app/layout.tsx
import type { ReactNode } from "react";
import Providers from "./providers";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export const metadata = {
  title: "NoteHub",
  description: "Notes app with filters & modals",
};

export default function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Providers>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
          {modal}{" "}
          {/* важливо: модалки теж всередині провайдера, бо в них useQuery */}
        </Providers>
      </body>
    </html>
  );
}
