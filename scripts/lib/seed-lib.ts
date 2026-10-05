import { sql } from "drizzle-orm";
import type { Db } from "../../src/db";
import { users } from "../../src/db/schema";
import { daysBefore } from "../../src/lib/today";
import { hashPassword } from "../../src/server/auth-core";
import { ingestPdf } from "../../src/server/ingest";
import { runSearch } from "../../src/server/search";
import {
  DEMO_DOCUMENTS,
  DEMO_SEARCHES,
  DEMO_USER,
  SCANNED_DOCUMENTS,
  SECOND_USER,
  SECOND_USER_DOCUMENTS,
  SECOND_USER_SEARCHES,
} from "../seed-data";
import { makeScannedPdf, makeTextPdf } from "./make-pdf";

type Event = { at: Date; run: () => Promise<unknown> };

export async function resetDatabase(db: Db): Promise<void> {
  await db.execute(sql`TRUNCATE search_results, searches, chunks, documents, users RESTART IDENTITY CASCADE`);
}

export async function isDatabaseEmpty(db: Db): Promise<boolean> {
  const rows = await db.select({ n: sql<number>`count(*)::int` }).from(users);
  return (rows[0]?.n ?? 0) === 0;
}

/**
 * Seeds two users, 42 PDFs and about 90 saved searches, all dated relative to
 * `today`. Uploads and searches are replayed in date order, so searches made
 * before a later upload correctly show as out of date.
 */
export async function seedDatabase(db: Db, today: Date, log: (msg: string) => void = () => {}): Promise<{ documents: number; searches: number }> {
  const [demo] = await db
    .insert(users)
    .values({ name: DEMO_USER.name, email: DEMO_USER.email, passwordHash: await hashPassword(DEMO_USER.password), createdAt: daysBefore(today, 62) })
    .returning();
  const [second] = await db
    .insert(users)
    .values({ name: SECOND_USER.name, email: SECOND_USER.email, passwordHash: await hashPassword(SECOND_USER.password), createdAt: daysBefore(today, 45) })
    .returning();

  const events: Event[] = [];
  let i = 0;
  const at = (daysAgo: number) => {
    i++;
    return daysBefore(today, daysAgo, 7 + ((i * 5) % 9), (i * 17) % 60);
  };

  for (const doc of DEMO_DOCUMENTS) {
    const when = at(doc.daysAgo);
    events.push({
      at: when,
      run: async () =>
        ingestPdf(db, {
          userId: demo!.id,
          filename: doc.filename,
          collection: doc.collection,
          title: doc.title,
          uploadedAt: when,
          bytes: await makeTextPdf({ title: doc.title, author: doc.author, sections: doc.sections }),
        }),
    });
  }
  for (const scan of SCANNED_DOCUMENTS) {
    const when = at(scan.daysAgo);
    events.push({
      at: when,
      run: async () =>
        ingestPdf(db, {
          userId: demo!.id,
          filename: scan.filename,
          collection: scan.collection,
          title: scan.title,
          uploadedAt: when,
          bytes: await makeScannedPdf(scan.pages, scan.title),
        }),
    });
  }
  for (const doc of SECOND_USER_DOCUMENTS) {
    const when = at(doc.daysAgo);
    events.push({
      at: when,
      run: async () =>
        ingestPdf(db, {
          userId: second!.id,
          filename: doc.filename,
          collection: doc.collection,
          title: doc.title,
          uploadedAt: when,
          bytes: await makeTextPdf({ title: doc.title, author: doc.author, sections: doc.sections }),
        }),
    });
  }
  const addSearches = (userId: number, list: [string, number, number[]][]) => {
    for (const [query, first, repeats] of list) {
      for (const d of [first, ...repeats]) {
        const when = at(d);
        // Searches run a little after uploads made on the same day.
        when.setUTCHours(Math.min(when.getUTCHours() + 6, 21));
        events.push({ at: when, run: () => runSearch(db, userId, query, when) });
      }
    }
  };
  addSearches(demo!.id, DEMO_SEARCHES);
  addSearches(second!.id, SECOND_USER_SEARCHES);

  events.sort((a, b) => a.at.getTime() - b.at.getTime());
  let done = 0;
  for (const e of events) {
    await e.run();
    done++;
    if (done % 25 === 0) log(`  ${done}/${events.length} seed events`);
  }
  const docCount = DEMO_DOCUMENTS.length + SCANNED_DOCUMENTS.length + SECOND_USER_DOCUMENTS.length;
  return { documents: docCount, searches: DEMO_SEARCHES.length + SECOND_USER_SEARCHES.length };
}
