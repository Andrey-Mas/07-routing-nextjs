// app/@modal/(.)notes/[id]/page.tsx
import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import Modal from "@/components/Modal/Modal";
import NotePreviewClient from "./NotePreview.client";
import { fetchNoteById } from "@/lib/api";

export default async function NoteDetailsModal({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const from = typeof sp.from === "string" && sp.from ? sp.from : "/notes/filter/All";

  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <Modal title="Note details" closeHref={from}>
        <NotePreviewClient id={id} />
      </Modal>
    </HydrationBoundary>
  );
}
