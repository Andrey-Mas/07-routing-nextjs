"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import Modal from "@/components/Modal/Modal";
import NoteModal from "@/components/NoteModal/NoteModal";
import NoteForm from "@/components/NoteForm/NoteForm";

type Params = { id: string };

export default function NoteOverlayPage({
  params,
}: {
  params: Promise<Params> | Params;
}) {
  const { id } =
    typeof (params as any)?.then === "function"
      ? use(params as Promise<Params>)
      : (params as Params);

  const sp = useSearchParams();
  const from = sp?.get("from") ?? "/notes/filter/All";

  if (id === "new") {
    return (
      <Modal title="Create note" closeHref={from}>
        <NoteForm backTo={from} />
      </Modal>
    );
  }

  return (
    <Modal title="Note details" closeHref={from}>
      <NoteModal id={id} />
    </Modal>
  );
}
