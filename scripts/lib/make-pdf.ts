import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type PdfSection = [heading: string, body: string];

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 56;

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Builds a text PDF with one section per page (long sections flow onto extra pages). */
export async function makeTextPdf(opts: { title: string; author: string; sections: PdfSection[] }): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(opts.title);
  pdf.setAuthor(opts.author);
  pdf.setCreator("SemPDF seed generator");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = A4[0] - MARGIN * 2;

  const newPage = (): { page: PDFPage; y: number } => {
    const page = pdf.addPage(A4);
    page.drawRectangle({ x: 0, y: A4[1] - 8, width: A4[0], height: 8, color: rgb(0.8, 0, 0) });
    page.drawText(opts.title, { x: MARGIN, y: A4[1] - 36, size: 9, font: regular, color: rgb(0.4, 0.4, 0.4) });
    return { page, y: A4[1] - 70 };
  };

  opts.sections.forEach(([heading, body], index) => {
    let { page, y } = newPage();
    if (index === 0) {
      for (const l of wrap(opts.title, bold, 22, width)) {
        page.drawText(l, { x: MARGIN, y, size: 22, font: bold });
        y -= 28;
      }
      page.drawText(opts.author, { x: MARGIN, y, size: 10, font: regular, color: rgb(0.35, 0.35, 0.35) });
      y -= 36;
    }
    page.drawText(heading, { x: MARGIN, y, size: 15, font: bold, color: rgb(0.1, 0.1, 0.1) });
    y -= 26;
    for (const para of body.split(/\n\s*\n/)) {
      for (const l of wrap(para, regular, 11.5, width)) {
        if (y < MARGIN + 20) ({ page, y } = newPage());
        page.drawText(l, { x: MARGIN, y, size: 11.5, font: regular, lineHeight: 16 });
        y -= 16.5;
      }
      y -= 10;
    }
  });

  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawText(`Page ${i + 1} of ${pages.length}`, { x: A4[0] - MARGIN - 60, y: 30, size: 9, font: regular, color: rgb(0.5, 0.5, 0.5) });
  });
  return pdf.save();
}

/** A PDF with only drawn shapes and no text layer, like a photographed or scanned page. */
export async function makeScannedPdf(pages: number, title: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(title);
  for (let p = 0; p < pages; p++) {
    const page = pdf.addPage(A4);
    page.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: rgb(0.93, 0.91, 0.86) });
    let y = A4[1] - 80;
    for (let i = 0; y > 80; i++) {
      const w = width(i, p);
      page.drawRectangle({ x: MARGIN, y, width: w, height: 6, color: rgb(0.45, 0.43, 0.4), opacity: 0.6 });
      y -= i % 7 === 6 ? 30 : 16;
    }
  }
  return pdf.save();

  function width(i: number, p: number): number {
    return 300 + ((i * 37 + p * 11) % 180);
  }
}
