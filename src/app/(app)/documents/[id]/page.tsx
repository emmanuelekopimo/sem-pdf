import { ExternalLink, Search, Trash2, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteDocumentAction } from "@/app/actions/library";
import { getDb } from "@/db";
import { Thumb } from "@/components/Thumb";
import { formatBytes, formatCount, timeAgo } from "@/lib/format";
import { withoutOverlap } from "@/lib/text";
import { getToday } from "@/lib/today";
import { requireUser } from "@/server/auth";
import { getDocument, getDocumentPassages } from "@/server/library";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ chunk?: string }> };

async function load(idParam: string) {
  const user = await requireUser();
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();
  const doc = await getDocument(getDb(), user.id, id);
  if (!doc) notFound();
  return { user, doc };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doc } = await load((await params).id);
  return { title: doc.title };
}

export default async function DocumentPage({ params, searchParams }: Props) {
  const { user, doc } = await load((await params).id);
  const activeChunk = Number((await searchParams).chunk);
  const passages = withoutOverlap(await getDocumentPassages(getDb(), user.id, doc.id));
  const pages = new Map<number, typeof passages>();
  for (const p of passages) pages.set(p.page, [...(pages.get(p.page) ?? []), p]);
  const today = getToday();

  return (
    <div className="doc-layout">
      <article>
        <div className="page-head">
          <div>
            <h1 data-testid="doc-title">{doc.title}</h1>
            <p className="muted">
              {doc.collection} &middot; uploaded {timeAgo(doc.uploadedAt, today).toLowerCase()}
            </p>
          </div>
        </div>
        {doc.status === "no_text" ? (
          <div className="callout callout-warn" data-testid="no-text-callout">
            <TriangleAlert size={18} />
            <p>
              No text could be read from this PDF. It is probably a scan or a photo of printed pages. Run it through OCR first, then upload the new copy to make it
              searchable.
            </p>
          </div>
        ) : (
          [...pages.entries()].map(([page, list]) => (
            <section className="doc-page" key={page} aria-label={`Page ${page}`}>
              <h3>Page {page}</h3>
              {list.map((p) => (
                <p key={p.id} id={`c${p.id}`} className={`passage${p.id === activeChunk ? " passage-active" : ""}`} data-active={p.id === activeChunk || undefined}>
                  {p.display}
                </p>
              ))}
            </section>
          ))
        )}
      </article>
      <aside className="doc-side">
        <Thumb title={doc.title} collection={doc.collection} badge={`${doc.pageCount} pages`} muted={doc.status === "no_text"} />
        <dl className="doc-facts">
          <div>
            <dt>Pages</dt>
            <dd>{doc.pageCount}</dd>
          </div>
          <div>
            <dt>Passages</dt>
            <dd>{doc.chunkCount}</dd>
          </div>
          <div>
            <dt>Words</dt>
            <dd>{doc.wordCount.toLocaleString("en-NG")}</dd>
          </div>
          <div>
            <dt>File size</dt>
            <dd>{formatBytes(doc.sizeBytes)}</dd>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <dt>File name</dt>
            <dd style={{ overflowWrap: "anywhere" }}>{doc.filename}</dd>
          </div>
        </dl>
        <div className="doc-actions">
          <a className="btn btn-primary" href={`/api/documents/${doc.id}/file`} target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
            Open PDF
          </a>
          <Link className="btn" href={`/search?q=${encodeURIComponent(doc.title)}`} prefetch={false}>
            <Search size={16} />
            Find similar
          </Link>
          <form action={deleteDocumentAction}>
            <input type="hidden" name="id" value={doc.id} />
            <button type="submit" className="btn btn-danger" data-testid="delete-doc">
              <Trash2 size={16} />
              Delete
            </button>
          </form>
        </div>
        <p className="muted" style={{ fontSize: 12 }}>
          {formatCount(doc.chunkCount, "passage")} from this file are searchable. Deleting it removes its passages and refreshes saved searches.
        </p>
      </aside>
    </div>
  );
}
