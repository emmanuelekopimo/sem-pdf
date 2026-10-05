export type SeedDoc = {
  title: string;
  filename: string;
  collection: string;
  author: string;
  /** Days before "today" that the document was uploaded. */
  daysAgo: number;
  /** One section per PDF page: [heading, body]. Paragraphs are separated by blank lines. */
  sections: [string, string][];
};
