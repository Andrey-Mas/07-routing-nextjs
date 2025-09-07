// types/note.ts

export type BackendTag = "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";
export type UITag = BackendTag | "All";

export interface Note {
  id: string;
  title: string;
  content: string;
  tag: BackendTag;
  createdAt: string;
  updatedAt: string;
}

export interface FetchNotesResponse {
  items: Note[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const TAGS_UI: UITag[] = [
  "All",
  "Todo",
  "Work",
  "Personal",
  "Meeting",
  "Shopping",
];
