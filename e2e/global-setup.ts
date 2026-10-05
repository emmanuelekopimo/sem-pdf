import { mkdir, writeFile } from "node:fs/promises";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb } from "../src/db";
import { parseIsoDate } from "../src/lib/today";
import { makeTextPdf } from "../scripts/lib/make-pdf";
import { resetDatabase, seedDatabase } from "../scripts/lib/seed-lib";

/** Resets the test database to the demo seed and writes upload fixtures. */
export default async function globalSetup() {
  const { db, pool } = createDb(process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/sempdf_test");
  await migrate(db, { migrationsFolder: "./drizzle" });
  await resetDatabase(db);
  await seedDatabase(db, parseIsoDate("2026-10-05")!);
  await pool.end();

  await mkdir("e2e/.fixtures", { recursive: true });
  await writeFile(
    "e2e/.fixtures/beekeeping-notes.pdf",
    await makeTextPdf({
      title: "Beekeeping Field Notes",
      author: "Apiculture Unit, Federal University Dutse",
      sections: [
        ["Hives", "Kenyan top bar hives are cheap to build from local timber and suit beginners. Place hives in shade near clean water and away from footpaths."],
        ["Harvest", "Honey is harvested when most of the comb cells are capped with wax. Use smoke gently and wear a veil and gloves to avoid stings."],
      ],
    }),
  );
  await writeFile("e2e/.fixtures/not-a-pdf.txt", "This is a plain text file.");
}
