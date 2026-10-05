import { describe, expect, it } from "vitest";
import { deleteDocument, listSearches } from "@/server/library";
import { deleteSearches, runSearch } from "@/server/search";
import { MAIZE, TENANCY, addPdf, makeUser, useTestDb } from "./helpers";

const db = useTestDb();
const at = (iso: string) => new Date(iso);

describe("semantic search", () => {
  it("finds the right passage for a question that shares no keywords with it", async () => {
    const user = await makeUser(db);
    await addPdf(db, user.id, MAIZE);
    await addPdf(db, user.id, TENANCY, "Law");

    const result = await runSearch(db, user.id, "can my landlord kick me out", at("2026-10-05T10:00:00Z"));
    expect(result.fromCache).toBe(false);
    expect(result.hits[0]!.document.title).toBe("Tenancy Law");
    expect(result.hits[0]!.score).toBeGreaterThan(0.3);

    const corn = await runSearch(db, user.id, "when should I sow corn", at("2026-10-05T10:01:00Z"));
    expect(corn.hits[0]!.document.title).toBe("Maize Guide");
    expect(corn.hits[0]!.page).toBe(1);
  });

  it("saves every search and serves repeats from the saved results", async () => {
    const user = await makeUser(db);
    await addPdf(db, user.id, MAIZE);
    const first = await runSearch(db, user.id, "Storing grain safely", at("2026-10-04T09:00:00Z"));
    const again = await runSearch(db, user.id, "  storing   GRAIN safely ", at("2026-10-05T09:00:00Z"));

    expect(again.fromCache).toBe(true);
    expect(again.searchId).toBe(first.searchId);
    expect(again.hits.map((h) => h.chunkId)).toEqual(first.hits.map((h) => h.chunkId));

    const [saved] = await listSearches(db, user.id);
    expect(saved).toMatchObject({ runCount: 2, resultCount: first.hits.length });
    expect(saved!.lastRunAt.toISOString()).toBe("2026-10-05T09:00:00.000Z");
  });

  it("refreshes saved results after the library changes", async () => {
    const user = await makeUser(db);
    const maize = await addPdf(db, user.id, MAIZE);
    const before = await runSearch(db, user.id, "eviction without a court order");
    expect(before.hits.every((h) => h.document.title === "Maize Guide")).toBe(true);

    await addPdf(db, user.id, TENANCY, "Law");
    const after = await runSearch(db, user.id, "eviction without a court order");
    expect(after.fromCache).toBe(false);
    expect(after.hits[0]!.document.title).toBe("Tenancy Law");

    await deleteDocument(db, user.id, maize.documentId);
    const afterDelete = await runSearch(db, user.id, "eviction without a court order");
    expect(afterDelete.fromCache).toBe(false);
    expect(afterDelete.hits.every((h) => h.document.title === "Tenancy Law")).toBe(true);
  });

  it("returns no results when nothing is close in meaning", async () => {
    const user = await makeUser(db);
    await addPdf(db, user.id, TENANCY, "Law");
    const result = await runSearch(db, user.id, "premier league transfer rumours");
    expect(result.hits).toHaveLength(0);
    expect((await listSearches(db, user.id))[0]!.resultCount).toBe(0);
  });

  it("never returns another user's passages or history", async () => {
    const ada = await makeUser(db, "Ada", "ada@example.com");
    const bayo = await makeUser(db, "Bayo", "bayo@example.com");
    await addPdf(db, ada.id, MAIZE);
    await addPdf(db, bayo.id, TENANCY, "Law");

    const result = await runSearch(db, bayo.id, "fall armyworm on maize leaves");
    expect(result.hits.every((h) => h.document.title === "Tenancy Law")).toBe(true);
    await runSearch(db, ada.id, "fall armyworm on maize leaves");

    expect((await listSearches(db, ada.id)).map((s) => s.query)).toEqual(["fall armyworm on maize leaves"]);
    const adaSearch = (await listSearches(db, ada.id))[0]!;
    expect(await deleteSearches(db, bayo.id, [adaSearch.id])).toBe(0);
    expect(await listSearches(db, ada.id)).toHaveLength(1);
    expect(await deleteSearches(db, ada.id)).toBe(1);
    expect(await listSearches(db, bayo.id)).toHaveLength(1);
  });
});
