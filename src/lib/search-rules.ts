/** Ranking settings shared by the app, seed script and tests. */
export const SEARCH_LIMIT = 20;
export const MIN_SCORE = 0.22;
export const MAX_PER_DOCUMENT = 4;
export const MAX_QUERY_LENGTH = 200;

/**
 * Saved results can be reused when the library has not changed since the
 * search last ran. Uploading or deleting a document bumps the library version.
 */
export function isCacheFresh(saved: { libraryVersion: number } | null | undefined, currentLibraryVersion: number): boolean {
  return !!saved && saved.libraryVersion === currentLibraryVersion;
}

/** Share of results a plain keyword search would also have found, 0-100. */
export function keywordOverlapPercent(results: { keywordMatch: boolean }[]): number {
  if (results.length === 0) return 0;
  return Math.round((results.filter((r) => r.keywordMatch).length / results.length) * 100);
}
