import { Upload } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/db";
import { DocumentCard } from "@/components/DocumentCard";
import { formatCount } from "@/lib/format";
import { getToday } from "@/lib/today";
import { requireUser } from "@/server/auth";
import { libraryStats, listDocuments } from "@/server/library";

export const metadata: Metadata = { title: "Library" };

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const user = await requireUser();
  const { c } = await searchParams;
  const db = getDb();
  const [stats, docs] = await Promise.all([libraryStats(db, user.id), listDocuments(db, user.id, c)]);
  const today = getToday();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Your library</h1>
          <p className="muted" data-testid="library-summary">
            {formatCount(stats.documents, "PDF")} &middot; {formatCount(stats.pages, "page")} &middot; {formatCount(stats.passages, "passage")} indexed
          </p>
        </div>
        <Link href="/library/upload" className="btn btn-red">
          <Upload size={18} />
          Upload PDFs
        </Link>
      </div>

      {stats.collections.length > 0 && (
        <div className="chips" aria-label="Filter by collection" style={{ marginBottom: 16 }}>
          <Link href="/library" className="chip" aria-current={!c ? "true" : undefined}>
            All <span className="count">{stats.documents}</span>
          </Link>
          {stats.collections.map((col) => (
            <Link key={col.name} href={`/library?c=${encodeURIComponent(col.name)}`} className="chip" aria-current={c === col.name ? "true" : undefined}>
              {col.name} <span className="count">{col.count}</span>
            </Link>
          ))}
        </div>
      )}

      {docs.length === 0 ? (
        <div className="empty">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/empty-library.svg" alt="" width={240} height={160} />
          <h2>{c ? `No PDFs in ${c}` : "No PDFs yet"}</h2>
          <p className="muted">Upload lecture notes, handbooks or reports. They are indexed on this server with a local model.</p>
          <Link href="/library/upload" className="btn btn-red">
            <Upload size={18} />
            Upload PDFs
          </Link>
        </div>
      ) : (
        <div className="grid" data-testid="library-grid">
          {docs.map((d) => (
            <DocumentCard key={d.id} doc={d} today={today} />
          ))}
        </div>
      )}
    </>
  );
}
