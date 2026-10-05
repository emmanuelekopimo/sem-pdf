import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { chunks, documents, users } from "@/db/schema";
import { IngestError, ingestPdf } from "@/server/ingest";
import { deleteDocument, getDocument, getDocumentFile, libraryStats, listDocuments } from "@/server/library";
import { makeScannedPdf } from "../../scripts/lib/make-pdf";
import { MAIZE, addPdf, makeUser, setupTestDb } from "./helpers";

const db = setupTestDb();

describe("ingesting PDFs", () => {
  it("extracts pages, stores 384 dimension embeddings and bumps the library version", async () => {
    const user = await makeUser(db);
    const result = await addPdf(db, user.id, MAIZE);
    expect(result).toMatchObject({ status: "ready", pageCount: 3, title: "Maize Guide" });
    expect(result.chunkCount).toBeGreaterThanOrEqual(3);

    const rows = await db.select().from(chunks).where(eq(chunks.documentId, result.documentId));
    expect(rows).toHaveLength(result.chunkCount);
    expect(rows[0]!.embedding).toBeInstanceOf(Float32Array);
    expect(rows[0]!.embedding.length).toBe(384);
    expect(new Set(rows.map((r) => r.page))).toEqual(new Set([1, 2, 3]));
    // Running header and page footer are not part of any passage.
    expect(rows.some((r) => /Page \d of \d/.test(r.content))).toBe(false);

    const [u] = await db.select().from(users).where(eq(users.id, user.id));
    expect(u!.libraryVersion).toBe(1);
  });

  it("marks scanned PDFs with no text layer as not searchable", async () => {
    const user = await makeUser(db);
    const result = await ingestPdf(db, { userId: user.id, filename: "scan.pdf", collection: "General", bytes: await makeScannedPdf(2, "Scan") });
    expect(result).toMatchObject({ status: "no_text", chunkCount: 0, pageCount: 2 });
  });

  it("rejects files that are not PDFs", async () => {
    const user = await makeUser(db);
    await expect(
      ingestPdf(db, { userId: user.id, filename: "fake.pdf", collection: "General", bytes: new TextEncoder().encode("hello, not a pdf") }),
    ).rejects.toBeInstanceOf(IngestError);
    expect(await db.select().from(documents)).toHaveLength(0);
  });
});

describe("library queries are scoped to the owner", () => {
  it("hides one user's documents from another", async () => {
    const ada = await makeUser(db, "Ada", "ada@example.com");
    const bayo = await makeUser(db, "Bayo", "bayo@example.com");
    const { documentId } = await addPdf(db, ada.id, MAIZE);

    expect(await listDocuments(db, ada.id)).toHaveLength(1);
    expect(await listDocuments(db, bayo.id)).toHaveLength(0);
    expect(await getDocument(db, bayo.id, documentId)).toBeNull();
    expect(await getDocumentFile(db, bayo.id, documentId)).toBeNull();
    expect((await getDocumentFile(db, ada.id, documentId))?.file.subarray(0, 4).toString()).toBe("%PDF");

    expect(await deleteDocument(db, bayo.id, documentId)).toBe(false);
    expect(await getDocument(db, ada.id, documentId)).not.toBeNull();
  });

  it("deletes a document with its passages and reports stats", async () => {
    const ada = await makeUser(db);
    const { documentId, chunkCount } = await addPdf(db, ada.id, MAIZE);
    expect(await libraryStats(db, ada.id)).toMatchObject({ documents: 1, pages: 3, passages: chunkCount, collections: [{ name: "Agriculture", count: 1 }] });
    expect(await deleteDocument(db, ada.id, documentId)).toBe(true);
    expect(await db.select().from(chunks)).toHaveLength(0);
    expect((await libraryStats(db, ada.id)).documents).toBe(0);
  });
});
