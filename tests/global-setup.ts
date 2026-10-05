import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb } from "../src/db";

/** Applies migrations to the test database once before any test file runs. */
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/sempdf_test";
  const { db, pool } = createDb(url);
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
  } catch (err) {
    throw new Error(`Could not prepare the test database at ${url}. Is Postgres running (service postgresql start)?\n${String(err)}`);
  } finally {
    await pool.end();
  }
}
