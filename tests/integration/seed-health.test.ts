import { eq, sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { documents, searches, users } from "@/db/schema";
import { getToday } from "@/lib/today";
import { isDatabaseEmpty, seedDatabase } from "../../scripts/lib/seed-lib";
import { DEMO_DOCUMENTS, DEMO_SEARCHES, SCANNED_DOCUMENTS } from "../../scripts/seed-data";
import { GET as health } from "@/app/api/health/route";
import { useTestDb } from "./helpers";

const db = useTestDb();

describe("demo seed", () => {
  it("fills an empty database with dated documents, problem cases and saved searches", async () => {
    expect(await isDatabaseEmpty(db)).toBe(true);
    const today = getToday();
    await seedDatabase(db, today);
    expect(await isDatabaseEmpty(db)).toBe(false);

    const demo = (await db.select().from(users).where(eq(users.email, "demo@sempdf.app")))[0]!;
    const docs = await db.select({ status: documents.status, uploadedAt: documents.uploadedAt }).from(documents).where(eq(documents.userId, demo.id));
    expect(docs).toHaveLength(DEMO_DOCUMENTS.length + SCANNED_DOCUMENTS.length);
    expect(docs.filter((d) => d.status === "no_text")).toHaveLength(SCANNED_DOCUMENTS.length);
    expect(Math.max(...docs.map((d) => d.uploadedAt.getTime()))).toBeLessThan(today.getTime() + 86_400_000);

    const saved = await db.select().from(searches).where(eq(searches.userId, demo.id));
    expect(saved).toHaveLength(DEMO_SEARCHES.length);
    expect(saved.some((s) => s.resultCount === 0)).toBe(true);
    expect(saved.some((s) => s.libraryVersion !== demo.libraryVersion)).toBe(true);
    expect(saved.some((s) => s.libraryVersion === demo.libraryVersion)).toBe(true);
    expect(saved.find((s) => s.query === "best time to plant corn")!.runCount).toBe(3);

    const [{ n }] = (await db.execute(sql`select count(*)::int as n from chunks`)).rows as [{ n: number }];
    expect(n).toBeGreaterThan(150);
  });
});

describe("health check", () => {
  it("reports ok when the database answers", async () => {
    const res = await health();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: "ok", database: "ok" });
  });
});
