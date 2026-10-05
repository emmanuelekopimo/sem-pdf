import { describe, expect, it } from "vitest";
import {
  chunkPages,
  cleanText,
  countWords,
  hasKeywordMatch,
  highlightKeywords,
  keywords,
  markHeadings,
  normalizeQuery,
  splitSentences,
  stripRunningLines,
  titleFromFilename,
  truncate,
  withoutOverlap,
} from "@/lib/text";

const sentence = (n: number, words = 10) => `Sentence ${n} ${"word ".repeat(words - 2).trim()}.`;

describe("cleanText", () => {
  it("collapses whitespace, joins hyphenated line breaks and drops control characters", () => {
    expect(cleanText("  Hello\n\n  world\u0007 fer-\ntiliser  ")).toBe("Hello world fertiliser");
  });
});

describe("countWords", () => {
  it("counts words and handles empty text", () => {
    expect(countWords("one two  three")).toBe(3);
    expect(countWords("   ")).toBe(0);
  });
});

describe("normalizeQuery", () => {
  it("lowercases and collapses spaces", () => {
    expect(normalizeQuery("  Best   Time to PLANT corn ")).toBe("best time to plant corn");
  });
});

describe("keywords and hasKeywordMatch", () => {
  it("drops stop words and single letters", () => {
    expect(keywords("What is the best time to plant a corn?")).toEqual(["best", "time", "plant", "corn"]);
  });

  it("detects literal overlap only", () => {
    expect(hasKeywordMatch("best time to plant corn", "Plant maize in June")).toBe(true);
    expect(hasKeywordMatch("best time to plant corn", "Maize is sown when rains are steady")).toBe(false);
    expect(hasKeywordMatch("the of and", "the of and")).toBe(false);
  });
});

describe("splitSentences", () => {
  it("splits on terminal punctuation and keeps a trailing fragment", () => {
    expect(splitSentences("One. Two! Three? Four")).toEqual(["One.", "Two!", "Three?", "Four"]);
  });
});

describe("chunkPages", () => {
  it("keeps every chunk on one page and numbers positions across pages", () => {
    const chunks = chunkPages([
      { page: 1, text: [1, 2, 3].map((n) => sentence(n)).join(" ") },
      { page: 2, text: sentence(4) },
    ]);
    expect(chunks.map((c) => c.page)).toEqual([1, 2]);
    expect(chunks.map((c) => c.position)).toEqual([0, 1]);
  });

  it("splits long pages near maxWords with one sentence of overlap", () => {
    const text = Array.from({ length: 12 }, (_, i) => sentence(i + 1)).join(" ");
    const chunks = chunkPages([{ page: 1, text }], { maxWords: 40, overlapSentences: 1, minWords: 5 });
    expect(chunks.length).toBeGreaterThan(2);
    for (const c of chunks) expect(countWords(c.content)).toBeLessThanOrEqual(40);
    const firstLast = splitSentences(chunks[0]!.content).at(-1);
    expect(splitSentences(chunks[1]!.content)[0]).toBe(firstLast);
  });

  it("merges a short tail into the previous chunk", () => {
    const text = [sentence(1, 30), sentence(2, 30), "Tiny tail."].join(" ");
    const chunks = chunkPages([{ page: 1, text }], { maxWords: 62, overlapSentences: 0, minWords: 12 });
    expect(chunks).toHaveLength(1);
    expect(chunks[0]!.content.endsWith("Tiny tail.")).toBe(true);
  });

  it("skips pages without text", () => {
    expect(chunkPages([{ page: 1, text: "   " }])).toEqual([]);
  });
});

describe("highlightKeywords", () => {
  it("marks words shared with the query, case insensitive", () => {
    const segs = highlightKeywords("plant corn", "Plant maize, not corn.");
    expect(segs.filter((s) => s.hit).map((s) => s.text)).toEqual(["Plant", "corn"]);
    expect(segs.map((s) => s.text).join("")).toBe("Plant maize, not corn.");
  });

  it("returns the passage untouched when the query has no keywords", () => {
    expect(highlightKeywords("the", "the text")).toEqual([{ text: "the text", hit: false }]);
  });
});

describe("truncate", () => {
  it("cuts at a word boundary and adds dots", () => {
    expect(truncate("one two three four five", 12)).toBe("one two...");
    expect(truncate("short", 12)).toBe("short");
  });
});

describe("titleFromFilename", () => {
  it("turns file names into titles", () => {
    expect(titleFromFilename("intro_to-machine_learning.PDF")).toBe("Intro To Machine Learning");
    expect(titleFromFilename(".pdf")).toBe("Untitled document");
  });
});

describe("stripRunningLines", () => {
  it("removes repeated headers and page numbers", () => {
    const pages = [1, 2, 3].map((n) => ({ page: n, text: `Course Notes\nSee table ${n} below.\nPage ${n} of 3` }));
    const out = stripRunningLines(pages);
    // "See table # below." repeats too, but it is body text, not a header or footer.
    expect(out.map((p) => p.text)).toEqual(["See table 1 below.", "See table 2 below.", "See table 3 below."]);
  });

  it("keeps everything except bare page numbers in short documents", () => {
    const out = stripRunningLines([
      { page: 1, text: "Title\nHello.\n1" },
      { page: 2, text: "Title\nWorld.\n2" },
    ]);
    expect(out.map((p) => p.text)).toEqual(["Title\nHello.", "Title\nWorld."]);
  });
});

describe("markHeadings", () => {
  it("adds a full stop to short title lines followed by a new paragraph", () => {
    expect(markHeadings("Fall armyworm\nThe fall armyworm arrived in 2016.")).toBe("Fall armyworm.\nThe fall armyworm arrived in 2016.");
  });

  it("leaves wrapped sentence lines alone", () => {
    const text = "Plant two seeds per hole at a depth of about five centimetres, with\n75 centimetres between rows.";
    expect(markHeadings(text)).toBe(text);
  });
});

describe("withoutOverlap", () => {
  it("drops sentences repeated from the previous passage on the same page", () => {
    const out = withoutOverlap([
      { page: 1, content: "A one. B two." },
      { page: 1, content: "B two. C three." },
      { page: 2, content: "C three. D four." },
    ]);
    expect(out.map((p) => p.display)).toEqual(["A one. B two.", "C three.", "C three. D four."]);
  });
});
