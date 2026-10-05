import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type Browser, type Page } from "@playwright/test";

export type Callout = { n: number; selector: string; text: string };
export type Shot = { id: string; title: string; caption: string; file: string; callouts: Callout[]; mobile: boolean };

const OUT = path.join(process.cwd(), "docs", "screenshots");

/**
 * Draws numbered red circles next to each target element, then takes the
 * screenshot, so the callouts are baked into the image.
 */
async function annotate(page: Page, callouts: Callout[]) {
  await page.evaluate((items) => {
    document.querySelectorAll(".doc-callout").forEach((el) => el.remove());
    for (const { n, selector } of items) {
      const el = document.querySelector(selector);
      if (!el) throw new Error(`Callout target not found: ${selector}`);
      const r = el.getBoundingClientRect();
      const ring = document.createElement("div");
      ring.className = "doc-callout";
      Object.assign(ring.style, {
        position: "fixed",
        left: `${r.left - 4}px`,
        top: `${r.top - 4}px`,
        width: `${r.width + 8}px`,
        height: `${r.height + 8}px`,
        border: "2.5px solid #ff0000",
        borderRadius: "10px",
        zIndex: "9998",
        pointerEvents: "none",
      });
      const dot = document.createElement("div");
      dot.className = "doc-callout";
      dot.textContent = String(n);
      const size = 26;
      Object.assign(dot.style, {
        position: "fixed",
        left: `${Math.max(2, Math.min(window.innerWidth - size - 2, r.left - size / 2 - 4))}px`,
        top: `${Math.max(2, r.top - size / 2 - 4)}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "#ff0000",
        color: "#fff",
        font: "700 14px Roboto, Arial, sans-serif",
        display: "grid",
        placeItems: "center",
        zIndex: "9999",
        boxShadow: "0 1px 4px rgba(0,0,0,.4)",
        pointerEvents: "none",
      });
      document.body.append(ring, dot);
    }
  }, callouts);
}

async function shot(page: Page, s: Omit<Shot, "file" | "mobile">, mobile: boolean, shots: Shot[]) {
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await annotate(page, s.callouts);
  const file = path.join(OUT, `${s.id}.png`);
  await page.screenshot({ path: file, animations: "disabled", caret: "initial" });
  await page.evaluate(() => document.querySelectorAll(".doc-callout").forEach((el) => el.remove()));
  shots.push({ ...s, file, mobile });
}

async function signIn(page: Page, base: string) {
  await page.goto(`${base}/signin`);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/search");
}

export async function captureAll(base: string, executablePath?: string): Promise<Shot[]> {
  await mkdir(OUT, { recursive: true });
  const browser: Browser = await chromium.launch({ executablePath });
  const shots: Shot[] = [];

  // ---------- Desktop ----------
  const desk = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 });
  await desk.goto(`${base}/signin`);
  await shot(
    desk,
    {
      id: "01-signin",
      title: "Sign in",
      caption: "The first screen. The demo account is already filled in so the presenter only clicks one button.",
      callouts: [
        { n: 1, selector: "[data-testid=demo-note]", text: "Demo credentials are shown and pre-filled: demo@sempdf.app / demo1234." },
        { n: 2, selector: "#email", text: "Email field. Zod validates it on the server and shows the error under the field." },
        { n: 3, selector: "button[type=submit]", text: "Sign in sets a signed JWT in an HTTP-only cookie (jose, 7 days)." },
        { n: 4, selector: "a[href='/signup']", text: "New users can create their own account with an empty, private library." },
      ],
    },
    false,
    shots,
  );

  await signIn(desk, base);
  await shot(
    desk,
    {
      id: "02-home",
      title: "Search home",
      caption: "After sign in. A large YouTube style search bar, suggestion chips and a summary of the library.",
      callouts: [
        { n: 1, selector: ".hero .searchbar", text: "Main search bar. Type a question in plain words and press Enter." },
        { n: 2, selector: "[data-testid=suggestions]", text: "Chips: recent searches (clock icon) and example questions (sparkle icon). One click runs them." },
        { n: 3, selector: "[data-testid=stats]", text: "Library totals: PDFs, pages read, passages indexed and saved searches." },
        { n: 4, selector: "[data-testid=header-upload]", text: "Upload button, always in the header on desktop." },
        { n: 5, selector: ".topnav", text: "Main sections: Search, Library and History." },
      ],
    },
    false,
    shots,
  );

  await desk.goto(`${base}/search?q=${encodeURIComponent("best time to plant corn")}`);
  await shot(
    desk,
    {
      id: "03-results",
      title: "Search results",
      caption: 'Results for "best time to plant corn". The word corn does not appear in any document, yet the Maize guide ranks first.',
      callouts: [
        { n: 1, selector: "[data-testid=results-meta]", text: "How many passages matched, how long it took, and whether the result came from the saved cache." },
        { n: 2, selector: "[data-testid=keyword-callout]", text: "Comparison with plain keyword search: how many of these results a keyword search would have missed." },
        { n: 3, selector: ".results-head .chips", text: "Filter the results by collection." },
        { n: 4, selector: "[data-testid=result] .thumb", text: "Thumbnail with the page number badge. The red bar shows where the page sits in the document." },
        { n: 5, selector: "[data-testid=result] .score", text: "Match strength from cosine similarity: strong, good or weak, with a percentage." },
        { n: 6, selector: "[data-testid=result] .snippet", text: "The matching passage. Words shared literally with the question are highlighted." },
      ],
    },
    false,
    shots,
  );

  await desk.getByTestId("result").first().click();
  await desk.waitForURL("**/documents/**");
  await shot(
    desk,
    {
      id: "04-document",
      title: "Document view",
      caption: "Opening a result shows the full text of the document, page by page, with the matched passage highlighted.",
      callouts: [
        { n: 1, selector: "[data-testid=doc-title]", text: "Document title and collection." },
        { n: 2, selector: ".passage-active", text: "The passage that matched the search, highlighted in blue and scrolled into view." },
        { n: 3, selector: ".doc-facts", text: "Facts about the file: pages, passages, words and size." },
        { n: 4, selector: ".doc-actions", text: "Open the original PDF, find similar documents, or delete it (which also refreshes saved searches)." },
      ],
    },
    false,
    shots,
  );

  await desk.goto(`${base}/library`);
  await shot(
    desk,
    {
      id: "05-library",
      title: "Library",
      caption: "Every uploaded PDF as a card, like a video grid. 42 sample PDFs across 8 collections are seeded.",
      callouts: [
        { n: 1, selector: "[data-testid=library-summary]", text: "Totals for the signed-in user only." },
        { n: 2, selector: ".main > .chips", text: "Collection filter chips with counts." },
        { n: 3, selector: "[data-testid=no-text-badge]", text: "Problem case: a scanned PDF with no text layer is flagged as not searchable." },
        { n: 4, selector: "[data-testid=doc-card] .thumb-badge", text: "Page count badge, like the duration badge on a video." },
      ],
    },
    false,
    shots,
  );

  await desk.goto(`${base}/library/upload`);
  await desk.locator("#files").setInputFiles(path.join(process.cwd(), "docs", ".fixtures", "beekeeping-notes.pdf"));
  await desk.getByLabel("Collection").selectOption("Agriculture");
  await desk.getByRole("button", { name: "Upload and index" }).click();
  await desk.getByTestId("upload-results").waitFor();
  await shot(
    desk,
    {
      id: "06-upload",
      title: "Upload",
      caption: "Choose one or more PDFs and a collection. Each file is read, split and embedded on the server, then reported here.",
      callouts: [
        { n: 1, selector: ".dropzone", text: "Pick up to 10 PDFs (10 MB each). Non-PDF files are rejected with an inline error." },
        { n: 2, selector: "#collection", text: "Collection select. It stays uncontrolled so it keeps a valid value after the form resets." },
        { n: 3, selector: "[data-testid=upload-results]", text: "Per-file outcome: pages read, passages indexed, or the reason it failed." },
      ],
    },
    false,
    shots,
  );

  await desk.goto(`${base}/history`);
  await shot(
    desk,
    {
      id: "07-history",
      title: "Search history",
      caption: "Every search is saved to Postgres with its ranked results, grouped by day like YouTube watch history.",
      callouts: [
        { n: 1, selector: ".history-group h2", text: "Groups: Today, Yesterday, This week, This month, Older." },
        { n: 2, selector: "[data-testid=history-item] .history-meta", text: "Result count, best score, how many times it ran, and how long the search took." },
        { n: 3, selector: "[data-testid=stale-badge]", text: "Will refresh: PDFs were added or removed since, so the next open re-runs the search." },
        { n: 4, selector: "[data-testid=clear-history]", text: "Clear all history, or remove one search with the bin icon." },
      ],
    },
    false,
    shots,
  );

  await desk.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  await desk.goto(`${base}/search?q=${encodeURIComponent("can my landlord throw me out without notice")}`);
  await desk.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  await shot(
    desk,
    {
      id: "08-dark",
      title: "Dark theme",
      caption: "The moon icon switches to the YouTube dark palette. The choice is saved in a cookie.",
      callouts: [
        { n: 1, selector: "button[title='Toggle theme']", text: "Theme toggle." },
        { n: 2, selector: "[data-testid=meaning-only]", text: "Found by meaning: this passage shares no keywords with the question." },
      ],
    },
    false,
    shots,
  );
  await desk.close();

  // ---------- Mobile ----------
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await signIn(mob, base);
  await shot(
    mob,
    {
      id: "09-mobile-home",
      title: "Mobile home",
      caption: "On phones the header shrinks and navigation moves to a bottom tab bar.",
      callouts: [
        { n: 1, selector: ".hero .searchbar", text: "Search bar sized for thumbs." },
        { n: 2, selector: ".tabbar", text: "Bottom tab bar: Search, Library, Upload, History." },
      ],
    },
    true,
    shots,
  );
  await mob.goto(`${base}/search?q=${encodeURIComponent("what should I do if someone is choking")}`);
  await shot(
    mob,
    {
      id: "10-mobile-results",
      title: "Mobile results",
      caption: "Results stack with a smaller thumbnail. Snippets are clamped to four lines.",
      callouts: [
        { n: 1, selector: ".main .mobile-only .searchbar", text: "The search bar moves into the page on small screens." },
        { n: 2, selector: "[data-testid=result]", text: "Top result: First Aid Quick Reference, page 3." },
      ],
    },
    true,
    shots,
  );
  await mob.goto(`${base}/library`);
  await shot(
    mob,
    {
      id: "11-mobile-library",
      title: "Mobile library",
      caption: "Cards become a single column. Grids use minmax(0, 1fr) so nothing overflows sideways.",
      callouts: [{ n: 1, selector: "[data-testid=doc-card]", text: "Document card at phone width." }],
    },
    true,
    shots,
  );
  await mob.close();
  await browser.close();
  return shots;
}
