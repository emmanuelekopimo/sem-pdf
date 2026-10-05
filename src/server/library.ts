import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { chunks, documents, searches, users } from "@/db/schema";

export const documentListColumns = {
  id: documents.id,
  title: documents.title,
  filename: documents.filename,
  collection: documents.collection,
  sizeBytes: documents.sizeBytes,
  pageCount: documents.pageCount,
  wordCount: documents.wordCount,
  chunkCount: documents.chunkCount,
  status: documents.status,
  uploadedAt: documents.uploadedAt,
};

export type DocumentSummary = {
  id: number;
  title: string;
  filename: string;
  collection: string;
  sizeBytes: number;
  pageCount: number;
  wordCount: number;
  chunkCount: number;
  status: string;
  uploadedAt: Date;
};

export async function listDocuments(db: Db, userId: number, collection?: string): Promise<DocumentSummary[]> {
  return db
    .select(documentListColumns)
    .from(documents)
    .where(collection ? and(eq(documents.userId, userId), eq(documents.collection, collection)) : eq(documents.userId, userId))
    .orderBy(desc(documents.uploadedAt), desc(documents.id));
}

export async function getDocument(db: Db, userId: number, id: number): Promise<DocumentSummary | null> {
  const [row] = await db
    .select(documentListColumns)
    .from(documents)
    .where(and(eq(documents.userId, userId), eq(documents.id, id)));
  return row ?? null;
}

export async function getDocumentFile(db: Db, userId: number, id: number): Promise<{ filename: string; file: Buffer } | null> {
  const [row] = await db
    .select({ filename: documents.filename, file: documents.file })
    .from(documents)
    .where(and(eq(documents.userId, userId), eq(documents.id, id)));
  return row ?? null;
}

export async function getDocumentPassages(db: Db, userId: number, id: number) {
  return db
    .select({ id: chunks.id, page: chunks.page, position: chunks.position, content: chunks.content })
    .from(chunks)
    .where(and(eq(chunks.userId, userId), eq(chunks.documentId, id)))
    .orderBy(asc(chunks.position));
}

export async function deleteDocument(db: Db, userId: number, id: number): Promise<boolean> {
  return db.transaction(async (tx) => {
    const rows = await tx
      .delete(documents)
      .where(and(eq(documents.userId, userId), eq(documents.id, id)))
      .returning({ id: documents.id });
    if (!rows.length) return false;
    await tx
      .update(users)
      .set({ libraryVersion: sql`${users.libraryVersion} + 1` })
      .where(eq(users.id, userId));
    return true;
  });
}

export type LibraryStats = { documents: number; pages: number; passages: number; searches: number; collections: { name: string; count: number }[] };

export async function libraryStats(db: Db, userId: number): Promise<LibraryStats> {
  const [totals] = await db
    .select({
      documents: sql<number>`count(*)::int`,
      pages: sql<number>`coalesce(sum(${documents.pageCount}), 0)::int`,
      passages: sql<number>`coalesce(sum(${documents.chunkCount}), 0)::int`,
    })
    .from(documents)
    .where(eq(documents.userId, userId));
  const [s] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(searches)
    .where(eq(searches.userId, userId));
  const collections = await db
    .select({ name: documents.collection, count: sql<number>`count(*)::int` })
    .from(documents)
    .where(eq(documents.userId, userId))
    .groupBy(documents.collection)
    .orderBy(desc(sql`count(*)`), asc(documents.collection));
  return { documents: totals?.documents ?? 0, pages: totals?.pages ?? 0, passages: totals?.passages ?? 0, searches: s?.n ?? 0, collections };
}

export async function listSearches(db: Db, userId: number, limit = 200) {
  return db
    .select({
      id: searches.id,
      query: searches.query,
      resultCount: searches.resultCount,
      topScore: searches.topScore,
      durationMs: searches.durationMs,
      runCount: searches.runCount,
      lastRunAt: searches.lastRunAt,
    })
    .from(searches)
    .where(eq(searches.userId, userId))
    .orderBy(desc(searches.lastRunAt))
    .limit(limit);
}
