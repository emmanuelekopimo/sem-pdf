import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import { createDb, databaseUrl } from "../src/db";

/**
 * Creates the target database if the server does not have it yet. This lets
 * SemPDF use its own database on a shared Postgres server without touching
 * any other database there.
 */
async function ensureDatabase(url: string) {
  const probe = new Client({ connectionString: url });
  try {
    await probe.connect();
    await probe.end();
    return;
  } catch (err) {
    await probe.end().catch(() => {});
    if ((err as { code?: string }).code !== "3D000") throw err;
  }
  const target = new URL(url);
  const name = decodeURIComponent(target.pathname.slice(1));
  if (!/^[a-z0-9_]+$/i.test(name)) throw new Error(`Refusing to create database with unusual name: ${name}`);
  target.pathname = "/postgres";
  const admin = new Client({ connectionString: target.toString() });
  await admin.connect();
  await admin.query(`CREATE DATABASE "${name}"`);
  await admin.end();
  console.log(`Created database ${name}`);
}

async function main() {
  const url = databaseUrl();
  await ensureDatabase(url);
  const { db, pool } = createDb(url);
  await migrate(db, { migrationsFolder: "./drizzle" });
  await pool.end();
  console.log("Migrations applied");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
