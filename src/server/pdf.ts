import type { PageText } from "@/lib/text";

export type ParsedPdf = { pageCount: number; pages: PageText[]; title: string | null };

/** Extracts text page by page. Scanned PDFs come back with empty pages. */
export async function parsePdf(bytes: Uint8Array): Promise<ParsedPdf> {
  const { getDocumentProxy, extractText } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(bytes));
  const { totalPages, text } = await extractText(pdf, { mergePages: false });
  let title: string | null = null;
  try {
    const meta = await pdf.getMetadata();
    const t = (meta.info as { Title?: unknown } | undefined)?.Title;
    if (typeof t === "string" && t.trim()) title = t.trim();
  } catch {
    title = null;
  }
  await pdf.cleanup?.();
  return {
    pageCount: totalPages,
    pages: text.map((t, i) => ({ page: i + 1, text: t })),
    title,
  };
}

/** Quick check for the PDF magic bytes before handing a file to the parser. */
export function looksLikePdf(bytes: Uint8Array): boolean {
  return bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}
