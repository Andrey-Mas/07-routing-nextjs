// app/notes/filter/[...slug]/page.tsx
import NotesClient from "./Notes.client";
import type { UITag } from "@/types/note";

type Params = { slug?: string[] };
type Search = { page?: string; query?: string };

const VALID_TAGS: ReadonlyArray<UITag> = [
  "All",
  "Todo",
  "Work",
  "Personal",
  "Meeting",
  "Shopping",
];

export default async function NotesPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams?: Promise<Search>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};

  // тег беремо з першого сегмента catch-all
  const rawTag =
    Array.isArray(slug) && slug.length > 0
      ? decodeURIComponent(slug[0])
      : "All";
  const tag: UITag = (VALID_TAGS as readonly string[]).includes(rawTag)
    ? (rawTag as UITag)
    : "All";

  // page/query з рядка запиту
  const page =
    typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;
  const query = typeof sp.query === "string" ? sp.query : "";

  return (
    <NotesClient initialPage={page} initialQuery={query} initialTag={tag} />
  );
}
