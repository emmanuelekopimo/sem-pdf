/** Collections a document can be filed under, each with a thumbnail colour. */
export const COLLECTIONS = [
  { name: "Computer Science", color: "#065fd4" },
  { name: "Agriculture", color: "#2ba640" },
  { name: "Economics", color: "#c00" },
  { name: "Health", color: "#d93f87" },
  { name: "Law", color: "#7b3fe4" },
  { name: "Engineering", color: "#e86a10" },
  { name: "Environment", color: "#00897b" },
  { name: "General", color: "#606060" },
] as const;

export type CollectionName = (typeof COLLECTIONS)[number]["name"];
export const COLLECTION_NAMES = COLLECTIONS.map((c) => c.name) as [CollectionName, ...CollectionName[]];

export function collectionColor(name: string): string {
  return COLLECTIONS.find((c) => c.name === name)?.color ?? "#606060";
}
