import { highlightKeywords } from "@/lib/text";

/** Marks words the passage shares literally with the query. */
export function Highlight({ query, text }: { query: string; text: string }) {
  return (
    <>
      {highlightKeywords(query, text).map((s, i) => (s.hit ? <mark key={i}>{s.text}</mark> : <span key={i}>{s.text}</span>))}
    </>
  );
}
