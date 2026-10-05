import { sql } from "drizzle-orm";
import { afterAll, beforeEach } from "vitest";
import { createDb } from "@/db";
import { createUser } from "@/server/auth-core";
import { ingestPdf } from "@/server/ingest";
import { makeTextPdf } from "../../scripts/lib/make-pdf";

/** One pool per test file against the test database (DATABASE_URL is set in vitest.config.ts). */
export function useTestDb() {
  const { db, pool } = createDb(process.env.DATABASE_URL);
  beforeEach(async () => {
    await db.execute(sql`TRUNCATE search_results, searches, chunks, documents, users RESTART IDENTITY CASCADE`);
  });
  afterAll(async () => {
    await pool.end();
  });
  return db;
}

export async function makeUser(db: ReturnType<typeof useTestDb>, name = "Chioma Nwankwo", email = "chioma@example.com") {
  return createUser(db, { name, email, password: "password123" });
}

export const MAIZE = {
  title: "Maize Guide",
  author: "Kaduna ADP",
  sections: [
    ["Planting", "Maize planting starts in late May or June once the rains are steady. Plant two seeds per hole at a depth of five centimetres."],
    ["Pests", "The fall armyworm eats young leaves. Scout the field twice a week and remove caterpillars by hand when damage is light."],
    ["Storage", "Dry the grain to thirteen percent moisture before storage so that moulds do not produce aflatoxin."],
  ] as [string, string][],
};

export const TENANCY = {
  title: "Tenancy Law",
  author: "Lagos Ministry of Justice",
  sections: [
    ["Notice", "A landlord must serve a valid notice to quit before recovering possession of the property from a tenant."],
    ["Self help", "Locking out a tenant or removing the roof without a court order is unlawful in Lagos State."],
  ] as [string, string][],
};

export async function addPdf(db: ReturnType<typeof useTestDb>, userId: number, doc: typeof MAIZE, collection = "Agriculture") {
  return ingestPdf(db, { userId, filename: `${doc.title.toLowerCase().replace(/\s+/g, "-")}.pdf`, collection, bytes: await makeTextPdf(doc) });
}
