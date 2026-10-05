import { sql } from "drizzle-orm";
import { getDb } from "@/db";

export const dynamic = "force-dynamic";

/** Health check for Railway: confirms the app is up and the database answers. */
export async function GET() {
  const started = Date.now();
  try {
    await getDb().execute(sql`select 1`);
    return Response.json({ status: "ok", database: "ok", latencyMs: Date.now() - started });
  } catch (err) {
    console.error("Health check failed", err);
    return Response.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
