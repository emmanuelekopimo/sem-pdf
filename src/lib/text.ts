/** Words ignored when checking for literal keyword overlap. */
const STOP_WORDS = new Set(
  "a an and are as at be by can do does for from has have how i in into is it its of on or that the their them this to was we what when where which who why will with you your".split(
    " ",
  ),
);

/** Collapses whitespace and strips control characters from extracted PDF text. */
export function cleanText(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/-\n(\w)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Lowercases and collapses spaces so "  Cassava  Farming" and "cassava farming" share history. */
export function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Meaningful lowercase words in a string (stop words and 1-letter tokens removed). */
export function keywords(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/** True if the passage contains at least one meaningful word from the query, literally. */
export function hasKeywordMatch(query: string, passage: string): boolean {
  const words = new Set(keywords(passage));
  return keywords(query).some((w) => words.has(w));
}

export function splitSentences(text: string): string[] {
  return (text.match(/[^.!?]+(?:[.!?]+|$)/g) ?? []).map((s) => s.trim()).filter(Boolean);
}

export type PageText = { page: number; text: string };
export type TextChunk = { page: number; position: number; content: string };

export type ChunkOptions = {
  /** Target words per chunk. */
  maxWords?: number;
  /** Sentences repeated at the start of the next chunk for context. */
  overlapSentences?: number;
  /** Chunks shorter than this are merged into the previous one on the same page. */
  minWords?: number;
};

/**
 * Splits page text into overlapping passages of whole sentences. Each passage
 * stays on one page so a result can point to an exact page number.
 */
export function chunkPages(pages: PageText[], options: ChunkOptions = {}): TextChunk[] {
  const maxWords = options.maxWords ?? 70;
  const overlap = options.overlapSentences ?? 1;
  const minWords = options.minWords ?? 12;
  const out: TextChunk[] = [];
  let position = 0;

  for (const { page, text } of pages) {
    const sentences = splitSentences(cleanText(markHeadings(text)));
    if (sentences.length === 0) continue;
    const pageChunks: string[][] = [];
    let current: string[] = [];
    let words = 0;
    for (const sentence of sentences) {
      const w = countWords(sentence);
      if (current.length > 0 && words + w > maxWords) {
        pageChunks.push(current);
        current = overlap > 0 ? current.slice(-overlap) : [];
        words = current.reduce((n, s) => n + countWords(s), 0);
        if (words + w > maxWords) {
          current = [];
          words = 0;
        }
      }
      current.push(sentence);
      words += w;
    }
    if (current.length > 0) {
      const last = pageChunks[pageChunks.length - 1];
      const fresh = last ? current.filter((s) => !last.includes(s)) : current;
      const freshWords = fresh.reduce((n, s) => n + countWords(s), 0);
      if (last && freshWords < minWords) {
        last.push(...fresh);
      } else {
        pageChunks.push(current);
      }
    }
    for (const parts of pageChunks) {
      out.push({ page, position: position++, content: parts.join(" ") });
    }
  }
  return out;
}

export type Segment = { text: string; hit: boolean };

/** Splits a passage into segments, marking words that also appear in the query. */
export function highlightKeywords(query: string, passage: string): Segment[] {
  const terms = new Set(keywords(query));
  if (terms.size === 0) return [{ text: passage, hit: false }];
  const segments: Segment[] = [];
  const re = /[A-Za-z0-9]+/g;
  let last = 0;
  for (let m = re.exec(passage); m; m = re.exec(passage)) {
    if (!terms.has(m[0].toLowerCase())) continue;
    if (m.index > last) segments.push({ text: passage.slice(last, m.index), hit: false });
    segments.push({ text: m[0], hit: true });
    last = m.index + m[0].length;
  }
  if (last < passage.length) segments.push({ text: passage.slice(last), hit: false });
  return segments;
}

/** Shortens text to about `maxChars`, cutting at a word boundary. */
export function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > 0 ? space : maxChars).trimEnd()}...`;
}

/** Title from a filename: "intro_to-ml.pdf" becomes "Intro To Ml". */
export function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!base) return "Untitled document";
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Removes running headers and footers: a page's first or last line that
 * repeats on most pages once digits are ignored, such as "Page 3 of 9" or the
 * document title. Only applies to documents with at least 3 pages, and the
 * line must appear on at least 60% of them. Bare page numbers are always
 * dropped.
 */
export function stripRunningLines(pages: PageText[]): PageText[] {
  const withText = pages.filter((p) => p.text.trim());
  const key = (line: string) => line.trim().toLowerCase().replace(/\d+/g, "#");
  const pageLines = pages.map((p) => p.text.split(/\r?\n/));
  const remove = new Set<string>();
  if (withText.length >= 3) {
    const seen = new Map<string, number>();
    for (const lines of pageLines) {
      const edges = lines.map((l) => l.trim()).filter(Boolean);
      for (const k of new Set([edges[0], edges.at(-1)].filter((l): l is string => !!l).map(key))) seen.set(k, (seen.get(k) ?? 0) + 1);
    }
    for (const [k, n] of seen) if (n / withText.length >= 0.6) remove.add(k);
  }
  const pageNumber = /^(page\s*)?#(\s*(of|\/)\s*#)?$/;
  return pages.map((p, i) => ({
    page: p.page,
    text: pageLines[i]!
      .filter((line) => {
        const k = key(line);
        return !pageNumber.test(k) && !remove.has(k);
      })
      .join("\n"),
  }));
}

/**
 * Ends short title-like lines with a full stop so a heading becomes its own
 * sentence instead of running into the paragraph below it.
 */
export function markHeadings(text: string): string {
  const lines = text.split(/\r?\n/);
  return lines
    .map((line, i) => {
      const t = line.trim();
      const next = lines[i + 1]?.trim() ?? "";
      const words = countWords(t);
      const isHeading = words > 0 && words <= 8 && /^[A-Z0-9]/.test(t) && !/[.!?:;,]$/.test(t) && /^[A-Z0-9]/.test(next);
      return isHeading ? `${t}.` : line;
    })
    .join("\n");
}

/**
 * Removes the sentences a passage repeats from the previous passage on the
 * same page (the chunk overlap), for reading a document straight through.
 */
export function withoutOverlap<T extends { page: number; content: string }>(passages: T[]): (T & { display: string })[] {
  return passages.map((p, i) => {
    const prev = passages[i - 1];
    if (!prev || prev.page !== p.page) return { ...p, display: p.content };
    const prevSentences = new Set(splitSentences(prev.content));
    const own = splitSentences(p.content);
    let start = 0;
    while (start < own.length - 1 && prevSentences.has(own[start]!)) start++;
    return { ...p, display: own.slice(start).join(" ") };
  });
}
