// app/notes/filter/[...slug]/page.tsx
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import NotesClient from "./Notes.client";
import { fetchNotes } from "@/lib/api";
import type { UITag } from "@/types/note";

export const dynamic = "force-dynamic";

type Params = { slug?: string[] };
type Search = { page?: string; query?: string };

export default async function NotesFilteredPage({
  params,
  searchParams,
}: {
  params: Params | Promise<Params>;
  searchParams: Search | Promise<Search>;
}) {
  const p = typeof (params as any)?.then === "function" ? await (params as Promise<Params>) : (params as Params);
  const sp = typeof (searchParams as any)?.then === "function" ? await (searchParams as Promise<Search>) : (searchParams as Search);

  const tagFromSlug = p?.slug && p.slug.length > 0 ? decodeURIComponent(p.slug[0]) : "All";
  const tag = (tagFromSlug as UITag) ?? "All";
  const page = Number(sp?.page) > 0 ? Number(sp.page) : 1;
  const query = (sp?.query ?? "").trim();

  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ["notes", { page, query, tag }],
    queryFn: () => fetchNotes({ page, query, tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotesClient initialPage={page} initialQuery={query} initialTag={tag} />
    </HydrationBoundary>
  );
}
