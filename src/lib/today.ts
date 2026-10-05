const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses YYYY-MM-DD into a Date at UTC midnight, or null if invalid. */
export function parseIsoDate(value: string | undefined | null): Date | null {
  if (!value || !ISO_DATE.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value ? null : d;
}

/**
 * "Today" for the app. Set SEMPDF_TODAY=YYYY-MM-DD to pin it for demos and
 * tests. Returns UTC midnight of that day.
 */
export function getToday(env: Record<string, string | undefined> = process.env, clock: Date = new Date()): Date {
  const pinned = parseIsoDate(env.SEMPDF_TODAY);
  if (pinned) return pinned;
  return new Date(Date.UTC(clock.getUTCFullYear(), clock.getUTCMonth(), clock.getUTCDate()));
}

/** Formats a Date as YYYY-MM-DD (UTC). */
export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Returns a timestamp `days` before `today`, at the given UTC hour and minute. */
export function daysBefore(today: Date, days: number, hour = 10, minute = 0): Date {
  const d = new Date(today.getTime());
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

/** Whole calendar days between `date` and `today` (UTC). 0 means same day. */
export function daysBetween(date: Date, today: Date): number {
  const a = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const b = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((b - a) / 86_400_000);
}
