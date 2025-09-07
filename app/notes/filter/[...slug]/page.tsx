// app/notes/filter/[...slug]/page.tsx
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import NotesClient from "./Notes.client";
import { fetchNotes } from "@/lib/api";
import type { UITag } from "@/types/note";

export const dynamic = "force-dynamic";

// підтримка і sync, і async варіантів
type MaybePromise<T> = T | Promise<T>;

export default async function NotesFilteredPage({
  params,
  searchParams,
}: {
  params: MaybePromise<{ slug?: string[] }>;
  searchParams: MaybePromise<Record<string, string | string[] | undefined>>;
}) {
  // ⚠️ у Next 14.2+ params / searchParams можуть бути Promise — треба await
  const p =
    typeof (params as any)?.then === "function"
      ? await (params as Promise<{ slug?: string[] }>)
      : (params as { slug?: string[] });
  const sp =
    typeof (searchParams as any)?.then === "function"
      ? await (searchParams as Promise<
          Record<string, string | string[] | undefined>
        >)
      : (searchParams as Record<string, string | string[] | undefined>);

  const rawTag = p.slug?.[0] ?? "All";
  const tag = decodeURIComponent(rawTag) as UITag;

  const page = Number(sp.page ?? 1) || 1;
  const query =
    typeof sp.query === "string"
      ? sp.query.trim().replace(/[^\p{L}\p{N}\s-]/gu, "")
      : "";

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
