import { getDb } from "@/db";
import { getCurrentUser } from "@/server/auth";
import { getDocumentFile } from "@/server/library";

/** Streams the original PDF, only to the user who uploaded it. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not signed in", { status: 401 });
  const { id } = await ctx.params;
  const docId = Number(id);
  if (!Number.isInteger(docId)) return new Response("Not found", { status: 404 });
  const doc = await getDocumentFile(getDb(), user.id, docId);
  if (!doc) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(doc.file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${doc.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
