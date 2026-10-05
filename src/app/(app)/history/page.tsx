import { History as HistoryIcon, RefreshCw, Search, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { clearHistoryAction, deleteSearchAction } from "@/app/actions/history";
import { getDb } from "@/db";
import { formatCount, formatDuration, groupByHistory, timeAgo } from "@/lib/format";
import { isCacheFresh } from "@/lib/search-rules";
import { getToday } from "@/lib/today";
import { scorePercent } from "@/lib/vector";
import { requireUser } from "@/server/auth";
import { listSearches } from "@/server/library";

export const metadata: Metadata = { title: "History" };

export default async function HistoryPage() {
  const user = await requireUser();
  const items = await listSearches(getDb(), user.id);
  const today = getToday();
  const groups = groupByHistory(items, (s) => s.lastRunAt, today);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Search history</h1>
          <p className="muted">
            {formatCount(items.length, "saved search")}. Opening one shows its saved results instantly unless your library has changed.
          </p>
        </div>
        {items.length > 0 && (
          <form action={clearHistoryAction}>
            <button type="submit" className="btn btn-danger" data-testid="clear-history">
              <Trash2 size={16} />
              Clear all history
            </button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty" data-testid="empty-history">
          <HistoryIcon size={48} strokeWidth={1.2} />
          <h2>No searches yet</h2>
          <p className="muted">Every search you run is saved here with its results.</p>
          <Link href="/search" className="btn btn-primary">
            <Search size={16} /> Start searching
          </Link>
        </div>
      ) : (
        <div className="history" data-testid="history">
          {groups.map(({ group, items: list }) => (
            <section key={group} className="history-group">
              <h2>{group}</h2>
              {list.map((s) => {
                const stale = !isCacheFresh(s, user.libraryVersion);
                return (
                  <div className="history-item" key={s.id} data-testid="history-item">
                    <span className="history-icon" aria-hidden="true">
                      <HistoryIcon size={18} />
                    </span>
                    <Link href={`/search?q=${encodeURIComponent(s.query)}`} prefetch={false} style={{ minWidth: 0 }}>
                      <div className="history-query">{s.query}</div>
                      <div className="history-meta">
                        <span>{s.resultCount === 0 ? "No matches" : formatCount(s.resultCount, "result")}</span>
                        {s.resultCount > 0 && <span>best {scorePercent(s.topScore)}%</span>}
                        <span>{s.runCount === 1 ? "searched once" : `searched ${s.runCount} times`}</span>
                        <span>{formatDuration(s.durationMs)}</span>
                        <span>{timeAgo(s.lastRunAt, today)}</span>
                        {stale && (
                          <span className="badge badge-warn" title="Documents were added or removed since this search ran" data-testid="stale-badge">
                            <RefreshCw size={11} /> Will refresh
                          </span>
                        )}
                        {s.resultCount === 0 && <span className="badge badge-red">Nothing found</span>}
                      </div>
                    </Link>
                    <form action={deleteSearchAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="icon-btn" aria-label={`Remove "${s.query}" from history`} title="Remove from history">
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
