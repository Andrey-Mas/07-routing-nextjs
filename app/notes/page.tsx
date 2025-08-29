import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { fetchNotes } from "../../lib/api"; // ✅ правильний імпорт
import NotesClient from "./Notes.client";

export const dynamic = "force-dynamic";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: { page?: string; query?: string };
}) {
  const page = Number(searchParams?.page ?? 1);
  const query = searchParams?.query ?? "";

  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ["notes", { page, query }],
    queryFn: () => fetchNotes({ page, query }),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotesClient initialPage={page} initialQuery={query} />
    </HydrationBoundary>
  );
}
