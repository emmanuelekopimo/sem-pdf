import { daysBetween } from "./today";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** YouTube-style relative date: "Today", "Yesterday", "3 days ago", "2 weeks ago". */
export function timeAgo(date: Date, today: Date): string {
  const days = daysBetween(date, today);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${plural(Math.floor(days / 7), "week")} ago`;
  if (days < 365) return `${plural(Math.floor(days / 30), "month")} ago`;
  return `${plural(Math.floor(days / 365), "year")} ago`;
}

export type HistoryGroup = "Today" | "Yesterday" | "This week" | "This month" | "Older";
export const HISTORY_GROUPS: HistoryGroup[] = ["Today", "Yesterday", "This week", "This month", "Older"];

export function historyGroup(date: Date, today: Date): HistoryGroup {
  const days = daysBetween(date, today);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This week";
  if (days < 30) return "This month";
  return "Older";
}

/** Groups items by history bucket, keeping the input order inside each group and skipping empty groups. */
export function groupByHistory<T>(items: T[], dateOf: (item: T) => Date, today: Date): { group: HistoryGroup; items: T[] }[] {
  const map = new Map<HistoryGroup, T[]>();
  for (const item of items) {
    const g = historyGroup(dateOf(item), today);
    const list = map.get(g) ?? [];
    list.push(item);
    map.set(g, list);
  }
  return HISTORY_GROUPS.filter((g) => map.has(g)).map((g) => ({ group: g, items: map.get(g)! }));
}

export function formatCount(n: number, word: string): string {
  return `${n.toLocaleString("en-NG")} ${word}${n === 1 ? "" : "s"}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.max(0, Math.round(ms))} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

/** Initials for avatars and thumbnails: "Computer Science" becomes "CS". */
export function initials(text: string, max = 2): string {
  const parts = text.match(/[A-Za-z0-9]+/g) ?? [];
  return parts
    .slice(0, max)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}
