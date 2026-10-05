/**
 * Builds docs/SemPDF-Documentation.pdf.
 *
 *   npm run build && npm run docs:pdf
 *
 * Resets the local database to the demo seed, starts the production server,
 * takes annotated screenshots with Playwright, renders an HTML document and
 * prints it to PDF with Chromium. Fonts are embedded from @fontsource.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { makeTextPdf } from "../lib/make-pdf";
import { captureAll, type Shot } from "./capture";
import { TEST_COUNTS, sections } from "./content";

const PORT = 3200;
const BASE = process.env.DOCS_BASE_URL ?? `http://localhost:${PORT}`;
const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/sempdf";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH ?? (process.env.PLAYWRIGHT_BROWSERS_PATH === "/opt/pw-browsers" ? "/opt/pw-browsers/chromium" : undefined);
const env = { ...process.env, DATABASE_URL, SEMPDF_TODAY: process.env.SEMPDF_TODAY ?? "2026-10-05", SESSION_SECRET: process.env.SESSION_SECRET ?? "docs-build-secret" };

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", env });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`))));
  });
}

async function waitForHealth(url: string, ms = 60_000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not become healthy at ${url}`);
}

async function fontFaces(): Promise<string> {
  const dir = path.join(process.cwd(), "node_modules", "@fontsource", "roboto", "files");
  const faces = [];
  for (const weight of [400, 500, 700]) {
    const data = await readFile(path.join(dir, `roboto-latin-${weight}-normal.woff2`));
    faces.push(`@font-face{font-family:Roboto;font-weight:${weight};font-style:normal;src:url(data:font/woff2;base64,${data.toString("base64")}) format("woff2");}`);
  }
  return faces.join("\n");
}

async function img(file: string): Promise<string> {
  return `data:image/png;base64,${(await readFile(file)).toString("base64")}`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function shotHtml(s: Shot): Promise<string> {
  return `<figure class="shot ${s.mobile ? "mobile" : ""}">
  <figcaption><h3>${esc(s.title)}</h3><p>${esc(s.caption)}</p></figcaption>
  <img src="${await img(s.file)}" alt="${esc(s.title)} screenshot">
  <ol class="callouts">${s.callouts.map((c) => `<li><span class="num">${c.n}</span><span>${esc(c.text)}</span></li>`).join("")}</ol>
</figure>`;
}

async function buildHtml(shots: Shot[]): Promise<string> {
  const byId = new Map(shots.map((s) => [s.id, s]));
  const logo = (await readFile(path.join(process.cwd(), "public", "logo.svg"))).toString("base64");
  const body: string[] = [];
  for (const sec of sections(TEST_COUNTS)) {
    let html = sec.html;
    const matches = [...html.matchAll(/\{\{shot:([\w-]+)\}\}/g)];
    for (const m of matches) {
      const s = byId.get(m[1]!);
      if (!s) throw new Error(`Unknown screenshot ${m[1]}`);
      html = html.replace(m[0], await shotHtml(s));
    }
    body.push(`<section class="section" id="${sec.id}"><h2>${esc(sec.title)}</h2>${html}</section>`);
  }
  const toc = sections(TEST_COUNTS)
    .map((s, i) => `<li><span>${i + 1}. ${esc(s.title)}</span></li>`)
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><title>SemPDF Documentation</title><style>
${await fontFaces()}
@page{size:A4;margin:18mm 16mm 18mm 16mm}
*{box-sizing:border-box}
body{font-family:Roboto,Arial,sans-serif;color:#0f0f0f;font-size:10.5pt;line-height:1.5;margin:0}
h1{font-size:30pt;margin:0 0 6pt}
h2{font-size:17pt;margin:0 0 10pt;padding-bottom:6pt;border-bottom:3px solid #ff0000}
h3{font-size:12.5pt;margin:0 0 4pt}
h4{font-size:11pt;margin:12pt 0 4pt}
p{margin:0 0 8pt}
code,pre{font-family:"DejaVu Sans Mono",monospace;font-size:9pt;background:#f2f2f2;border-radius:4px}
code{padding:1px 4px}
pre{padding:8pt 10pt;white-space:pre-wrap;margin:0 0 10pt}
table{border-collapse:collapse;width:100%;margin:0 0 10pt;font-size:9.5pt}
th,td{border:1px solid #e5e5e5;padding:5pt 7pt;text-align:left;vertical-align:top}
th{background:#f2f2f2;font-weight:500}
ul,ol{margin:0 0 8pt;padding-left:16pt}
li{margin:0 0 3pt}
.cover{height:257mm;display:flex;flex-direction:column;justify-content:center;page-break-after:always}
.cover .brand{display:flex;align-items:center;gap:12pt;margin-bottom:18pt}
.cover .brand img{width:72pt}
.cover .sub{font-size:14pt;color:#606060;max-width:420pt}
.cover .meta{margin-top:30pt;color:#606060}
.cover .toc{margin-top:28pt;columns:2;list-style:none;padding:0}
.cover .toc li{margin:0 0 5pt}
.section{page-break-before:always}
.shot{margin:0 0 16pt;page-break-inside:avoid}
.shot img{display:block;width:100%;border:1px solid #e5e5e5;border-radius:8px;margin:6pt 0}
.shot.mobile img{width:46%;}
.shot figcaption p{color:#606060;margin:0}
.callouts{list-style:none;padding:0;margin:4pt 0 0}
.callouts li{display:flex;gap:8pt;align-items:flex-start;margin:0 0 4pt}
.num{flex:none;display:inline-grid;place-items:center;width:17pt;height:17pt;border-radius:50%;background:#ff0000;color:#fff;font-weight:700;font-size:9pt}
.pill{display:inline-block;padding:1pt 7pt;border-radius:10pt;background:#f2f2f2;font-weight:500}
.box{background:#f2f2f2;border-radius:8px;padding:9pt 11pt;margin:0 0 10pt}
.flow{display:flex;flex-wrap:wrap;gap:6pt;align-items:center;margin:4pt 0 12pt}
.flow span{background:#fff;border:1.5px solid #0f0f0f;border-radius:6px;padding:4pt 8pt;font-weight:500;font-size:9.5pt}
.flow b{color:#ff0000}
.script td:first-child{white-space:nowrap;font-weight:500;width:70pt}
.avoid{page-break-inside:avoid}
</style></head><body>
<div class="cover">
  <div class="brand"><img src="data:image/svg+xml;base64,${logo}" alt=""><h1>SemPDF</h1></div>
  <p class="sub">Semantic search across a library of PDFs, using a small embedding model that runs locally on the server.</p>
  <p class="meta">300 level project documentation. Built with Next.js 16, Drizzle ORM and PostgreSQL. Demo login: demo@sempdf.app / demo1234.</p>
  <ol class="toc">${toc}</ol>
</div>
${body.join("\n")}
</body></html>`;
}

async function main() {
  let server: ChildProcess | undefined;
  try {
    if (!process.env.DOCS_BASE_URL) {
      console.log("Resetting local database to the demo seed...");
      await run("npx", ["tsx", "scripts/migrate.ts"]);
      await run("npx", ["tsx", "scripts/seed.ts", "--reset"]);
      console.log("Starting production server...");
      server = spawn("npx", ["next", "start", "-p", String(PORT)], { env: { ...env, NODE_ENV: "production" }, stdio: "ignore", detached: true });
      await waitForHealth(`${BASE}/api/health`);
    }
    await mkdir("docs/.fixtures", { recursive: true });
    await writeFile(
      "docs/.fixtures/beekeeping-notes.pdf",
      await makeTextPdf({
        title: "Beekeeping Field Notes",
        author: "Apiculture Unit, Federal University Dutse",
        sections: [
          ["Hives", "Kenyan top bar hives are cheap to build from local timber and suit beginners. Place hives in shade near clean water."],
          ["Harvest", "Honey is harvested when most of the comb cells are capped with wax. Use smoke gently and wear a veil and gloves."],
        ],
      }),
    );
    console.log("Capturing screenshots...");
    const shots = await captureAll(BASE, executablePath);
    const html = await buildHtml(shots);
    await writeFile("docs/SemPDF-Documentation.html", html);

    console.log("Printing PDF...");
    const browser = await chromium.launch({ executablePath });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({
      path: "docs/SemPDF-Documentation.pdf",
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="font-family:Arial,sans-serif;font-size:8px;color:#888;width:100%;text-align:center">SemPDF documentation, page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
      margin: { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" },
    });
    await browser.close();
    console.log("Wrote docs/SemPDF-Documentation.pdf");
  } finally {
    // npx starts next-server as a child, so stop the whole process group.
    if (server?.pid) process.kill(-server.pid, "SIGTERM");
  }
  // Leave the local database in its clean demo state.
  if (!process.env.DOCS_BASE_URL) await run("npx", ["tsx", "scripts/seed.ts", "--reset"]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
