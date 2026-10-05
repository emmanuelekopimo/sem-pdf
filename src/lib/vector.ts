export type Vector = ArrayLike<number>;

export function dot(a: Vector, b: Vector): number {
  if (a.length !== b.length) throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function norm(a: Vector): number {
  return Math.sqrt(dot(a, a));
}

/** Cosine similarity in [-1, 1]. Returns 0 if either vector is all zeros. */
export function cosineSimilarity(a: Vector, b: Vector): number {
  const n = norm(a) * norm(b);
  return n === 0 ? 0 : dot(a, b) / n;
}

export type Candidate<T> = { item: T; embedding: Vector };
export type Ranked<T> = { item: T; score: number; rank: number };

export type RankOptions<T> = {
  /** Maximum results to return. */
  limit?: number;
  /** Results scoring below this are dropped. */
  minScore?: number;
  /** Maximum results from the same group (for example the same document). */
  perGroup?: number;
  groupOf?: (item: T) => string | number;
};

/**
 * Ranks candidates by cosine similarity to the query. Embeddings from the
 * model are already unit length, so cosine is used to be safe with any input.
 */
export function rankBySimilarity<T>(query: Vector, candidates: Candidate<T>[], options: RankOptions<T> = {}): Ranked<T>[] {
  const limit = options.limit ?? 20;
  const minScore = options.minScore ?? 0.2;
  const perGroup = options.perGroup ?? Infinity;
  const scored = candidates
    .map((c) => ({ item: c.item, score: cosineSimilarity(query, c.embedding) }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score);

  const perGroupCount = new Map<string | number, number>();
  const out: Ranked<T>[] = [];
  for (const r of scored) {
    if (out.length >= limit) break;
    if (options.groupOf) {
      const g = options.groupOf(r.item);
      const n = perGroupCount.get(g) ?? 0;
      if (n >= perGroup) continue;
      perGroupCount.set(g, n + 1);
    }
    out.push({ ...r, rank: out.length + 1 });
  }
  return out;
}

export type MatchStrength = "strong" | "good" | "weak";

/** Plain-language label for a similarity score from all-MiniLM-L6-v2. */
export function matchStrength(score: number): MatchStrength {
  if (score >= 0.55) return "strong";
  if (score >= 0.4) return "good";
  return "weak";
}

/** Score as a 0-100 percentage for display. */
export function scorePercent(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}
