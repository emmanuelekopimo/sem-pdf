import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { chunks, documents, searchResults, searches, users } from "@/db/schema";
import { MAX_PER_DOCUMENT, MIN_SCORE, SEARCH_LIMIT, isCacheFresh } from "@/lib/search-rules";
import { hasKeywordMatch, normalizeQuery } from "@/lib/text";
import { rankBySimilarity } from "@/lib/vector";
import { embedText } from "./embedder";

export type SearchHit = {
  rank: number;
  score: number;
  chunkId: number;
  page: number;
  content: string;
  keywordMatch: boolean;
  document: { id: number; title: string; collection: string; pageCount: number; filename: string };
};

export type SearchOutcome = {
  searchId: number;
  query: string;
  fromCache: boolean;
  durationMs: number;
  passagesSearched: number;
  hits: SearchHit[];
};

type IndexEntry = { id: number; documentId: number; embedding: Float32Array };

// In-memory copy of each user's passage embeddings, keyed by library version,
// so repeated searches skip reloading vectors from Postgres.
const globalForIndex = globalThis as unknown as { sempdfIndex?: Map<number, { version: number; entries: IndexEntry[] }> };
const indexCache = (globalForIndex.sempdfIndex ??= new Map());

async function loadIndex(db: Db, userId: number, version: number): Promise<IndexEntry[]> {
  const cached = indexCache.get(userId);
  if (cached && cached.version === version) return cached.entries;
  const entries = await db
    .select({ id: chunks.id, documentId: chunks.documentId, embedding: chunks.embedding })
    .from(chunks)
    .where(eq(chunks.userId, userId));
  indexCache.set(userId, { version, entries });
  return entries;
}

async function loadHits(db: Db, userId: number, query: string, searchId: number): Promise<SearchHit[]> {
  const rows = await db
    .select({
      rank: searchResults.rank,
      score: searchResults.score,
      chunkId: chunks.id,
      page: chunks.page,
      content: chunks.content,
      documentId: documents.id,
      title: documents.title,
      collection: documents.collection,
      pageCount: documents.pageCount,
      filename: documents.filename,
    })
    .from(searchResults)
    .innerJoin(chunks, eq(chunks.id, searchResults.chunkId))
    .innerJoin(documents, eq(documents.id, chunks.documentId))
    .where(and(eq(searchResults.searchId, searchId), eq(documents.userId, userId)))
    .orderBy(asc(searchResults.rank));
  return rows.map((r) => ({
    rank: r.rank,
    score: r.score,
    chunkId: r.chunkId,
    page: r.page,
    content: r.content,
    keywordMatch: hasKeywordMatch(query, r.content),
    document: { id: r.documentId, title: r.title, collection: r.collection, pageCount: r.pageCount, filename: r.filename },
  }));
}

/**
 * Semantic search over one user's documents. Every search is saved. If the
 * same query ran before and the library has not changed, the saved results
 * are returned without touching the model.
 */
export async function runSearch(db: Db, userId: number, rawQuery: string, now: Date = new Date()): Promise<SearchOutcome> {
  const started = performance.now();
  const query = rawQuery.replace(/\s+/g, " ").trim();
  const normalized = normalizeQuery(query);

  const user = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { libraryVersion: true } });
  if (!user) throw new Error("User not found");
  const saved = await db.query.searches.findFirst({
    where: and(eq(searches.userId, userId), eq(searches.normalizedQuery, normalized)),
  });

  if (saved && isCacheFresh(saved, user.libraryVersion)) {
    await db
      .update(searches)
      .set({ runCount: sql`${searches.runCount} + 1`, lastRunAt: now, query })
      .where(eq(searches.id, saved.id));
    const hits = await loadHits(db, userId, query, saved.id);
    const [{ count } = { count: 0 }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(chunks)
      .where(eq(chunks.userId, userId));
    return {
      searchId: saved.id,
      query,
      fromCache: true,
      durationMs: Math.round(performance.now() - started),
      passagesSearched: count,
      hits,
    };
  }

  const embedding = saved?.embedding ?? (await embedText(query));
  const index = await loadIndex(db, userId, user.libraryVersion);
  const ranked = rankBySimilarity(
    embedding,
    index.map((e) => ({ item: e, embedding: e.embedding })),
    { limit: SEARCH_LIMIT, minScore: MIN_SCORE, perGroup: MAX_PER_DOCUMENT, groupOf: (e) => e.documentId },
  );
  const durationMs = Math.round(performance.now() - started);

  const searchId = await db.transaction(async (tx) => {
    const values = {
      query,
      embedding,
      resultCount: ranked.length,
      topScore: ranked[0]?.score ?? 0,
      durationMs,
      libraryVersion: user.libraryVersion,
      lastRunAt: now,
    };
    let id: number;
    if (saved) {
      await tx
        .update(searches)
        .set({ ...values, runCount: sql`${searches.runCount} + 1` })
        .where(eq(searches.id, saved.id));
      await tx.delete(searchResults).where(eq(searchResults.searchId, saved.id));
      id = saved.id;
    } else {
      const [row] = await tx
        .insert(searches)
        .values({ ...values, userId, normalizedQuery: normalized, createdAt: now })
        .returning({ id: searches.id });
      id = row!.id;
    }
    if (ranked.length) {
      await tx.insert(searchResults).values(ranked.map((r) => ({ searchId: id, chunkId: r.item.id, rank: r.rank, score: r.score })));
    }
    return id;
  });

  return {
    searchId,
    query,
    fromCache: false,
    durationMs,
    passagesSearched: index.length,
    hits: await loadHits(db, userId, query, searchId),
  };
}

/** Removes saved searches; only the given user's rows can be touched. */
export async function deleteSearches(db: Db, userId: number, ids?: number[]): Promise<number> {
  const where = ids ? and(eq(searches.userId, userId), inArray(searches.id, ids.length ? ids : [-1])) : eq(searches.userId, userId);
  const rows = await db.delete(searches).where(where).returning({ id: searches.id });
  return rows.length;
}
