import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { collectionColor } from "@/lib/collections";
import { initials, timeAgo } from "@/lib/format";
import type { DocumentSummary } from "@/server/library";
import { Thumb } from "./Thumb";

export function DocumentCard({ doc, today }: { doc: DocumentSummary; today: Date }) {
  const noText = doc.status === "no_text";
  return (
    <Link href={`/documents/${doc.id}`} className="card" data-testid="doc-card">
      <Thumb title={doc.title} collection={doc.collection} badge={`${doc.pageCount} ${doc.pageCount === 1 ? "page" : "pages"}`} muted={noText} />
      <div className="card-row">
        <span className="card-icon" style={{ background: collectionColor(doc.collection) }} aria-hidden="true">
          {initials(doc.collection)}
        </span>
        <div>
          <h3 className="card-title">{doc.title}</h3>
          <p className="card-meta">{doc.collection}</p>
          <p className="card-meta">
            {noText ? "Not searchable" : `${doc.chunkCount} passages`} &middot; {timeAgo(doc.uploadedAt, today)}
          </p>
          {noText && (
            <span className="badge badge-warn" style={{ marginTop: 6 }} data-testid="no-text-badge">
              <TriangleAlert size={12} /> No text found
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
