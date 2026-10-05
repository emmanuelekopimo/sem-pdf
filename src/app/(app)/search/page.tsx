import { Clock, Database, FileText, History, Sparkles, TriangleAlert, Upload, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/db";
import { DocumentCard } from "@/components/DocumentCard";
import { Highlight } from "@/components/Highlight";
import { MatchBadge } from "@/components/MatchBadge";
import { SearchBar } from "@/components/SearchBar";
import { Thumb } from "@/components/Thumb";
import { formatCount, formatDuration } from "@/lib/format";
import { keywordOverlapPercent } from "@/lib/search-rules";
import { truncate } from "@/lib/text";
import { getToday } from "@/lib/today";
import { searchQuerySchema } from "@/lib/validation";
import { requireUser } from "@/server/auth";
import { libraryStats, listDocuments, listSearches } from "@/server/library";
import { runSearch, type SearchOutcome } from "@/server/search";

type Props = { searchParams: Promise<{ q?: string; c?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `${q} - Search` : "Search" };
}

const EXAMPLES = [
  "best time to plant corn",
  "can my landlord throw me out",
  "why is food so expensive",
  "what to do if someone is choking",
  "how does a neural network learn",
  "protecting myself from internet fraud",
];

export default async function SearchPage({ searchParams }: Props) {
  const user = await requireUser();
  const { q = "", c } = await searchParams;
  const db = getDb();

  if (!q.trim()) return <SearchHome userId={user.id} firstName={user.name.split(" ")[0] ?? user.name} />;

  const parsed = searchQuerySchema.safeParse(q);
  if (!parsed.success) {
    return (
      <>
        <div className="mobile-only" style={{ marginBottom: 12 }}>
          <SearchBar defaultValue={q} />
        </div>
        <p className="field-error" role="alert" data-testid="search-error">
          {parsed.error.issues[0]?.message}
        </p>
      </>
    );
  }

  const outcome = await runSearch(db, user.id, parsed.data);
  return <Results outcome={outcome} collection={c} />;
}

async function SearchHome({ userId, firstName }: { userId: number; firstName: string }) {
  const db = getDb();
  const today = getToday();
  const [stats, recentSearches, recentDocs] = await Promise.all([libraryStats(db, userId), listSearches(db, userId, 8), listDocuments(db, userId)]);
  const suggestions = [...new Set([...recentSearches.map((s) => s.query), ...EXAMPLES])].slice(0, 10);

  return (
    <>
      <section className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-art" src="/illustrations/search-hero.svg" alt="" width={360} height={170} />
        <h1>What are you looking for, {firstName}?</h1>
        <p className="muted">Ask in your own words. Results are matched by meaning across every PDF in your library.</p>
        <SearchBar large autoFocus />
        {stats.documents > 0 && (
          <div className="chips" aria-label="Suggested searches" data-testid="suggestions">
            {suggestions.map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} prefetch={false} className="chip">
                {recentSearches.some((r) => r.query === s) ? <History size={14} /> : <Sparkles size={14} />}
                {s}
              </Link>
            ))}
          </div>
        )}
      </section>

      {stats.documents === 0 ? (
        <EmptyLibrary />
      ) : (
        <>
          <div className="stats" data-testid="stats">
            <div className="stat">
              <strong>{stats.documents}</strong>
              <span className="muted">PDFs in library</span>
            </div>
            <div className="stat">
              <strong>{stats.pages}</strong>
              <span className="muted">Pages read</span>
            </div>
            <div className="stat">
              <strong>{stats.passages}</strong>
              <span className="muted">Passages indexed</span>
            </div>
            <div className="stat">
              <strong>{stats.searches}</strong>
              <span className="muted">Saved searches</span>
            </div>
          </div>
          <div className="section-title">
            <h2>Recently added</h2>
            <Link href="/library" className="btn btn-outline btn-sm">
              View library
            </Link>
          </div>
          <div className="grid">
            {recentDocs.slice(0, 8).map((d) => (
              <DocumentCard key={d.id} doc={d} today={today} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function EmptyLibrary() {
  return (
    <div className="empty" data-testid="empty-library">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/illustrations/empty-library.svg" alt="" width={240} height={160} />
      <h2>Your library is empty</h2>
      <p className="muted">Upload a few PDFs first. Each one is split into passages and indexed on this server, so nothing leaves your machine.</p>
      <Link href="/library/upload" className="btn btn-red">
        <Upload size={18} />
        Upload PDFs
      </Link>
    </div>
  );
}

function Results({ outcome, collection }: { outcome: SearchOutcome; collection?: string }) {
  const { hits, query } = outcome;
  const counts = new Map<string, number>();
  for (const h of hits) counts.set(h.document.collection, (counts.get(h.document.collection) ?? 0) + 1);
  const shown = collection ? hits.filter((h) => h.document.collection === collection) : hits;
  const docCount = new Set(hits.map((h) => h.document.id)).size;
  const keywordPct = keywordOverlapPercent(hits);
  const keywordHits = hits.filter((h) => h.keywordMatch).length;
  const allWeak = hits.length > 0 && hits[0]!.score < 0.4;
  const base = `/search?q=${encodeURIComponent(query)}`;

  return (
    <>
      <div className="mobile-only" style={{ marginBottom: 12 }}>
        <SearchBar defaultValue={query} />
      </div>
      <div className="results-head">
        <div className="results-meta" data-testid="results-meta">
          <span>
            <FileText size={16} />
            {formatCount(hits.length, "passage")} from {formatCount(docCount, "document")}
          </span>
          {outcome.fromCache ? (
            <span data-testid="cache-hit">
              <Zap size={16} />
              Loaded saved results in {formatDuration(outcome.durationMs)}
            </span>
          ) : (
            <span data-testid="fresh-search">
              <Clock size={16} />
              Searched {formatCount(outcome.passagesSearched, "passage")} in {formatDuration(outcome.durationMs)}
            </span>
          )}
          <span>
            <Database size={16} />
            Saved to history
          </span>
        </div>
        {hits.length > 0 && (
          <div className="callout" data-testid="keyword-callout">
            <Sparkles size={18} />
            <p>
              A plain keyword search would have found only <strong>{keywordHits}</strong> of these {hits.length} passages ({keywordPct}%). The rest share the
              meaning of your question but not its words.
            </p>
          </div>
        )}
        {allWeak && (
          <div className="callout callout-warn">
            <TriangleAlert size={18} />
            <p>Every match is weak. Your library may not cover this topic yet.</p>
          </div>
        )}
        {counts.size > 1 && (
          <div className="chips" aria-label="Filter by collection">
            <Link href={base} prefetch={false} className="chip" aria-current={!collection ? "true" : undefined}>
              All <span className="count">{hits.length}</span>
            </Link>
            {[...counts.entries()].map(([name, n]) => (
              <Link
                key={name}
                href={`${base}&c=${encodeURIComponent(name)}`}
                prefetch={false}
                className="chip"
                aria-current={collection === name ? "true" : undefined}
              >
                {name} <span className="count">{n}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {hits.length === 0 ? (
        <div className="empty" data-testid="no-results">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/no-results.svg" alt="" width={240} height={160} />
          <h2>No passages matched &quot;{query}&quot;</h2>
          <p className="muted">Nothing in your library is close in meaning. Try describing the topic differently, or upload PDFs that cover it.</p>
          <Link href="/library/upload" className="btn">
            <Upload size={18} />
            Upload PDFs
          </Link>
        </div>
      ) : (
        <ol className="result-list" data-testid="results" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {shown.map((h) => (
            <li key={h.chunkId}>
              <Link href={`/documents/${h.document.id}?chunk=${h.chunkId}#c${h.chunkId}`} className="result" data-testid="result">
                <Thumb
                  title={h.document.title}
                  collection={h.document.collection}
                  badge={`p. ${h.page}`}
                  progress={h.page / Math.max(1, h.document.pageCount)}
                />
                <div className="result-body">
                  <h3 className="result-title">{h.document.title}</h3>
                  <div className="result-meta">
                    <MatchBadge score={h.score} />
                    <span>{h.document.collection}</span>
                    <span>
                      Page {h.page} of {h.document.pageCount}
                    </span>
                    {!h.keywordMatch && (
                      <span className="badge badge-plain" data-testid="meaning-only">
                        <Sparkles size={12} /> Found by meaning
                      </span>
                    )}
                  </div>
                  <p className="snippet">
                    <Highlight query={query} text={truncate(h.content, 320)} />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
