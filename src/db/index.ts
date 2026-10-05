import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { sempdfPool?: Pool; sempdfDb?: Db };

export function databaseUrl(): string {
  return process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/sempdf";
}

export function createDb(url = databaseUrl()): { db: Db; pool: Pool } {
  const pool = new Pool({ connectionString: url, max: 10 });
  return { db: drizzle(pool, { schema }), pool };
}

/** Shared connection pool for the app (reused across hot reloads). */
export function getDb(): Db {
  if (!globalForDb.sempdfDb) {
    const { db, pool } = createDb();
    globalForDb.sempdfPool = pool;
    globalForDb.sempdfDb = db;
  }
  return globalForDb.sempdfDb;
}

export { schema };
