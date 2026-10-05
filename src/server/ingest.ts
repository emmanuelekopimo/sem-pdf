import { eq, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { chunks, documents, users } from "@/db/schema";
import { chunkPages, countWords, stripRunningLines, titleFromFilename } from "@/lib/text";
import { embedTexts } from "./embedder";
import { looksLikePdf, parsePdf } from "./pdf";

export type IngestInput = {
  userId: number;
  filename: string;
  bytes: Uint8Array;
  collection: string;
  title?: string;
  uploadedAt?: Date;
};

export type IngestResult = {
  documentId: number;
  title: string;
  status: "ready" | "no_text";
  pageCount: number;
  chunkCount: number;
};

export class IngestError extends Error {}

/**
 * Reads a PDF, splits it into passages, embeds every passage with the local
 * model and stores the document and its passages for one user.
 */
export async function ingestPdf(db: Db, input: IngestInput): Promise<IngestResult> {
  if (!looksLikePdf(input.bytes)) throw new IngestError(`${input.filename} is not a valid PDF file`);
  let parsed;
  try {
    parsed = await parsePdf(input.bytes);
  } catch {
    throw new IngestError(`${input.filename} could not be read. It may be damaged or password protected.`);
  }

  const passages = chunkPages(stripRunningLines(parsed.pages));
  const embeddings = passages.length ? await embedTexts(passages.map((p) => p.content)) : [];
  const wordCount = parsed.pages.reduce((n, p) => n + countWords(p.text), 0);
  const title = input.title ?? parsed.title ?? titleFromFilename(input.filename);
  const status = passages.length ? "ready" : "no_text";

  return db.transaction(async (tx) => {
    const [doc] = await tx
      .insert(documents)
      .values({
        userId: input.userId,
        title,
        filename: input.filename,
        collection: input.collection,
        sizeBytes: input.bytes.byteLength,
        pageCount: parsed.pageCount,
        wordCount,
        chunkCount: passages.length,
        status,
        file: Buffer.from(input.bytes),
        ...(input.uploadedAt ? { uploadedAt: input.uploadedAt } : {}),
      })
      .returning({ id: documents.id });

    const rows = passages.map((p, i) => ({
      documentId: doc!.id,
      userId: input.userId,
      page: p.page,
      position: p.position,
      content: p.content,
      embedding: embeddings[i]!,
    }));
    for (let i = 0; i < rows.length; i += 200) {
      await tx.insert(chunks).values(rows.slice(i, i + 200));
    }
    await tx
      .update(users)
      .set({ libraryVersion: sql`${users.libraryVersion} + 1` })
      .where(eq(users.id, input.userId));

    return { documentId: doc!.id, title, status, pageCount: parsed.pageCount, chunkCount: passages.length };
  });
}
