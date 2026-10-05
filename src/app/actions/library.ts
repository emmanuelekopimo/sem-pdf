"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { fieldErrors, uploadSchema, type FieldErrors } from "@/lib/validation";
import { requireUser } from "@/server/auth";
import { IngestError, ingestPdf } from "@/server/ingest";
import { deleteDocument } from "@/server/library";

export type UploadItem = {
  filename: string;
  ok: boolean;
  documentId?: number;
  title?: string;
  status?: "ready" | "no_text";
  pageCount?: number;
  chunkCount?: number;
  error?: string;
};

export type UploadState = { errors?: FieldErrors; items?: UploadItem[]; durationMs?: number };

export async function uploadAction(_prev: UploadState, formData: FormData): Promise<UploadState> {
  const user = await requireUser();
  const files = formData.getAll("files").filter((f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f && f.size > 0);
  const parsed = uploadSchema.safeParse({ collection: formData.get("collection"), files });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const started = Date.now();
  const items: UploadItem[] = [];
  for (const file of files) {
    try {
      const result = await ingestPdf(getDb(), {
        userId: user.id,
        filename: file.name,
        collection: parsed.data.collection,
        bytes: new Uint8Array(await file.arrayBuffer()),
      });
      items.push({ filename: file.name, ok: true, ...result });
    } catch (err) {
      items.push({ filename: file.name, ok: false, error: err instanceof IngestError ? err.message : "Something went wrong while reading this file" });
      if (!(err instanceof IngestError)) console.error(err);
    }
  }
  return { items, durationMs: Date.now() - started };
}

export async function deleteDocumentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await deleteDocument(getDb(), user.id, id);
  redirect("/library");
}
