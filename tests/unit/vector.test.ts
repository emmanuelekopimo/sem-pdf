import { describe, expect, it } from "vitest";
import { cosineSimilarity, dot, matchStrength, rankBySimilarity, scorePercent } from "@/lib/vector";

describe("cosineSimilarity", () => {
  it("is 1 for identical direction, 0 for orthogonal and -1 for opposite", () => {
    expect(cosineSimilarity([1, 2], [2, 4])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 3])).toBeCloseTo(0);
    expect(cosineSimilarity([1, 1], [-1, -1])).toBeCloseTo(-1);
  });

  it("returns 0 for a zero vector", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });

  it("rejects vectors of different length", () => {
    expect(() => dot([1], [1, 2])).toThrow(/mismatch/);
  });
});

describe("rankBySimilarity", () => {
  const candidates = [
    { item: { id: 1, doc: "a" }, embedding: [1, 0] },
    { item: { id: 2, doc: "a" }, embedding: [0.9, 0.1] },
    { item: { id: 3, doc: "b" }, embedding: [0.7, 0.7] },
    { item: { id: 4, doc: "c" }, embedding: [0, 1] },
  ];

  it("orders by score, drops results under minScore and numbers ranks", () => {
    const ranked = rankBySimilarity([1, 0], candidates, { minScore: 0.5 });
    expect(ranked.map((r) => r.item.id)).toEqual([1, 2, 3]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3]);
  });

  it("respects the limit", () => {
    expect(rankBySimilarity([1, 0], candidates, { limit: 1, minScore: 0 })).toHaveLength(1);
  });

  it("caps results per group", () => {
    const ranked = rankBySimilarity([1, 0], candidates, { minScore: 0, perGroup: 1, groupOf: (i) => i.doc });
    expect(ranked.map((r) => r.item.id)).toEqual([1, 3, 4]);
  });
});

describe("matchStrength and scorePercent", () => {
  it("labels scores", () => {
    expect(matchStrength(0.7)).toBe("strong");
    expect(matchStrength(0.45)).toBe("good");
    expect(matchStrength(0.3)).toBe("weak");
  });

  it("clamps percentages", () => {
    expect(scorePercent(0.567)).toBe(57);
    expect(scorePercent(-0.2)).toBe(0);
    expect(scorePercent(1.4)).toBe(100);
  });
});
