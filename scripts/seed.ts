import { createDb } from "../src/db";
import { getToday, toIsoDate } from "../src/lib/today";
import { isDatabaseEmpty, resetDatabase, seedDatabase } from "./lib/seed-lib";

async function main() {
  const args = new Set(process.argv.slice(2));
  const { db, pool } = createDb();
  try {
    if (args.has("--if-empty") && !(await isDatabaseEmpty(db))) {
      console.log("Database already has data, skipping seed");
      return;
    }
    if (args.has("--reset") || !args.has("--if-empty")) {
      await resetDatabase(db);
    }
    const today = getToday();
    const started = Date.now();
    console.log(`Seeding demo data for ${toIsoDate(today)}...`);
    const result = await seedDatabase(db, today, console.log);
    console.log(`Seeded ${result.documents} documents and ${result.searches} saved searches in ${((Date.now() - started) / 1000).toFixed(1)} s`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
