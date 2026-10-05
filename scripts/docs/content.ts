/** Written content for the documentation PDF. {{shot:id}} placeholders become annotated screenshots. */

export const TEST_COUNTS = { unit: 59, integration: 15, e2eDesktop: 12, e2eMobile: 1 };
export const PUBLIC_URL = "https://sem-pdf-production.up.railway.app";

type Counts = typeof TEST_COUNTS;

export function sections(c: Counts) {
  const e2e = c.e2eDesktop + c.e2eMobile;
  return [
    {
      id: "overview",
      title: "Overview",
      html: `
<p><strong>SemPDF</strong> lets a student upload a pile of PDFs (lecture notes, handbooks, research briefs) and search them by meaning instead of by exact words. A search for <em>best time to plant corn</em> finds the Maize Farming Guide even though the word corn never appears in it, because the model knows that corn and maize, and plant and sow, mean nearly the same thing.</p>
<h4>Core features</h4>
<ul>
<li>Upload up to 10 PDFs at a time. Text is extracted page by page, split into passages and embedded on the server.</li>
<li>Semantic search with a local embedding model (all-MiniLM-L6-v2, quantized, 23 MB). No external AI service and no API key.</li>
<li>Fast: a search over the full demo library takes about 10 to 50 ms. Repeat searches are served from saved results in a few milliseconds.</li>
<li>Every search is saved to PostgreSQL with its ranked results, and shown in a history page grouped by day.</li>
<li>Each result shows the document, page number, match strength and the passage itself, and links to the exact passage.</li>
<li>Email and password accounts. Every query is scoped to the signed-in user.</li>
<li>YouTube colour theme with light and dark modes, built mobile first with a bottom tab bar on phones.</li>
</ul>
<h4>Sample data</h4>
<p>The seed creates a demo student, <strong>Adaeze Okafor</strong>, with <strong>42 PDFs</strong> (40 text documents and 2 scanned ones) across 8 collections: Computer Science, Agriculture, Economics, Health, Law, Engineering, Environment and General. The content is written for a Nigerian university: cassava farming in Ogun State, the Lagos Tenancy Law, CBN monetary policy, malaria prevention, solar sizing for a shop in Enugu, and more. It also creates <strong>73 saved searches</strong> spread over the last 60 days, some run several times. A second user, Tunde Bakare, owns 2 engineering PDFs so you can show that libraries are private.</p>
<div class="box"><strong>Problem cases seeded on purpose:</strong> two scanned PDFs with no text layer (flagged "No text found"), three searches that match nothing or only weakly (for example "premier league transfer news"), and older searches marked "Will refresh" because PDFs were added after they ran.</div>
<p>All dates are relative to "today". Set <code>SEMPDF_TODAY=YYYY-MM-DD</code> to pin today for demos and tests.</p>`,
    },
    {
      id: "logic",
      title: "How the core logic works",
      html: `
<h4>1. Indexing a PDF</h4>
<div class="flow"><span>PDF bytes</span><b>&gt;</b><span>unpdf: text per page</span><b>&gt;</b><span>strip headers and page numbers</span><b>&gt;</b><span>mark headings</span><b>&gt;</b><span>split into ~70 word passages</span><b>&gt;</b><span>embed (384 numbers)</span><b>&gt;</b><span>store in Postgres</span></div>
<ul>
<li><strong>Extract.</strong> <code>unpdf</code> (a server build of Mozilla pdf.js) returns the text of each page. If no page has text, the document is saved with status <code>no_text</code> so the user knows it needs OCR.</li>
<li><strong>Clean.</strong> <code>stripRunningLines</code> removes a page's first or last line when it repeats on at least 60% of pages (running titles, "Page 3 of 9"). <code>markHeadings</code> ends short title lines with a full stop so a heading does not run into the paragraph.</li>
<li><strong>Chunk.</strong> <code>chunkPages</code> groups whole sentences into passages of up to 70 words, never across a page boundary, and repeats the last sentence of one passage at the start of the next so context is not lost at the cut.</li>
<li><strong>Embed.</strong> Each passage goes through all-MiniLM-L6-v2 with mean pooling and normalisation, giving a unit length vector of 384 floats. They are stored as raw bytes (1,536 bytes each) in a <code>bytea</code> column.</li>
<li>The user's <code>library_version</code> goes up by one, which tells saved searches they are out of date.</li>
</ul>
<h4>2. Searching</h4>
<div class="flow"><span>question</span><b>&gt;</b><span>normalise</span><b>&gt;</b><span>saved and library unchanged?</span><b>&gt;</b><span>yes: load saved results</span></div>
<div class="flow"><span>no: embed question</span><b>&gt;</b><span>cosine similarity with every passage</span><b>&gt;</b><span>drop below 0.22</span><b>&gt;</b><span>max 3 per document, top 20</span><b>&gt;</b><span>save search and results</span></div>
<ul>
<li><strong>Normalise.</strong> Lowercase and collapse spaces, so "Best  time" and "best time" are the same saved search.</li>
<li><strong>Cache.</strong> <code>isCacheFresh</code> compares the search's saved library version with the user's current one. If they match, the saved ranked results are returned without running the model.</li>
<li><strong>Rank.</strong> <code>rankBySimilarity</code> scores every passage with cosine similarity, which measures the angle between two vectors: 1 means the same direction (same meaning), 0 means unrelated. At most 3 passages per document are kept so one long PDF cannot fill the page.</li>
<li><strong>Explain.</strong> <code>matchStrength</code> turns the score into Strong (0.55 and up), Good (0.40 and up) or Weak. <code>hasKeywordMatch</code> checks whether a passage shares any real word with the question, which powers the "keyword search would have found only X" message and the "Found by meaning" badge.</li>
<li><strong>Speed.</strong> The model loads once per server process (about 0.2 s). Each user's vectors are kept in memory keyed by library version, so a fresh search is one model call (about 10 ms) plus a few thousand multiply-adds.</li>
</ul>
<p>All of these rules are pure functions in <code>src/lib/</code> (text, vector, format, today, search-rules, validation) and are covered by unit tests.</p>`,
    },
    {
      id: "architecture",
      title: "Architecture and data model",
      html: `
<table>
<tr><th>Layer</th><th>What it does</th><th>Where</th></tr>
<tr><td>Next.js 16 App Router</td><td>Server Components render every page. Server Actions handle sign in, upload, delete and history. Turbopack build.</td><td><code>src/app</code></td></tr>
<tr><td>Proxy</td><td>Redirects signed-out visitors to /signin (Next 16 renamed middleware to proxy).</td><td><code>src/proxy.ts</code></td></tr>
<tr><td>Auth</td><td>bcryptjs hashes, jose HS256 JWT in an HTTP-only, SameSite=Lax cookie. Every page and action re-checks the user in the database.</td><td><code>src/server/auth*.ts</code>, <code>session.ts</code></td></tr>
<tr><td>Embedding</td><td>@huggingface/transformers on onnxruntime-node, model files committed in <code>models/</code>, remote downloads disabled.</td><td><code>src/server/embedder.ts</code></td></tr>
<tr><td>Ingest and search</td><td>PDF parsing, chunking, embedding, ranking and the saved results cache.</td><td><code>src/server/ingest.ts</code>, <code>search.ts</code></td></tr>
<tr><td>Business rules</td><td>Pure functions that take "today" as an argument.</td><td><code>src/lib</code></td></tr>
<tr><td>Database</td><td>PostgreSQL through Drizzle ORM. drizzle-kit writes versioned SQL migrations.</td><td><code>src/db</code>, <code>drizzle/</code></td></tr>
</table>
<h4>Tables</h4>
<table>
<tr><th>Table</th><th>Key columns</th><th>Notes</th></tr>
<tr><td>users</td><td>id, email (unique), name, password_hash, library_version</td><td>library_version goes up on every upload and delete.</td></tr>
<tr><td>documents</td><td>id, user_id, title, filename, collection, page_count, word_count, chunk_count, status, file (bytea), uploaded_at</td><td>The original PDF is stored in the row, so no disk volume is needed.</td></tr>
<tr><td>chunks</td><td>id, document_id, user_id, page, position, content, embedding (bytea)</td><td>One row per passage. user_id is copied in so search never needs a join to scope by user.</td></tr>
<tr><td>searches</td><td>id, user_id, query, normalized_query, embedding, result_count, top_score, duration_ms, run_count, library_version, last_run_at</td><td>Unique on (user_id, normalized_query): repeating a search updates the same row.</td></tr>
<tr><td>search_results</td><td>search_id, chunk_id, rank, score</td><td>The saved ranking, replaced when a stale search runs again.</td></tr>
</table>
<p>All foreign keys cascade on delete: deleting a document removes its passages and any saved results that pointed at them. Every query in <code>src/server/library.ts</code> and <code>search.ts</code> filters on <code>user_id</code>.</p>
<h4>Why no pgvector?</h4>
<p>Vectors are compared in Node instead of with a Postgres extension. For a student library (thousands of passages) this is a few milliseconds, it works on any Postgres including the shared server used in deployment, and it keeps the ranking logic in a pure, testable function.</p>`,
    },
    {
      id: "screens",
      title: "Walkthrough of every screen",
      html: `{{shot:01-signin}}{{shot:02-home}}{{shot:03-results}}{{shot:04-document}}{{shot:05-library}}{{shot:06-upload}}{{shot:07-history}}{{shot:08-dark}}`,
    },
    {
      id: "mobile",
      title: "Mobile view",
      html: `<p>Below 640 px wide the header search moves into the page, the top navigation becomes a bottom tab bar, and result thumbnails shrink to 120 px. A Playwright test on a Pixel 7 profile checks every tab for sideways overflow.</p>{{shot:09-mobile-home}}{{shot:10-mobile-results}}{{shot:11-mobile-library}}`,
    },
    {
      id: "local",
      title: "Running locally",
      html: `
<p>Requirements: Node.js 20.9 or newer and PostgreSQL 14 or newer. The embedding model is already in the repository, so no download is needed.</p>
<pre>git clone https://github.com/emmanuelekopimo/sem-pdf.git
cd sem-pdf
npm install

# Postgres (in the dev container)
service postgresql start
sudo -u postgres createdb sempdf
sudo -u postgres createdb sempdf_test

npm run db:migrate        # apply SQL migrations in drizzle/
npm run db:seed           # 2 users, 44 PDFs, 75 saved searches (about 5 s)
npm run dev               # http://localhost:3000</pre>
<table>
<tr><th>Variable</th><th>Default</th><th>Purpose</th></tr>
<tr><td>DATABASE_URL</td><td>postgres://postgres:postgres@localhost:5432/sempdf</td><td>Main database</td></tr>
<tr><td>SESSION_SECRET</td><td>development value</td><td>Signs session cookies. Required in production.</td></tr>
<tr><td>SEMPDF_TODAY</td><td>real date</td><td>Pin "today" (YYYY-MM-DD) for demos and tests</td></tr>
<tr><td>TEST_DATABASE_URL</td><td>.../sempdf_test</td><td>Used by Vitest and Playwright</td></tr>
</table>
<p>The file <code>.npmrc</code> sets <code>onnxruntime-node-install=skip</code>: the CPU binaries already ship inside the npm package, and this stops the install script from trying to download optional CUDA files.</p>
<h4>Scripts</h4>
<table>
<tr><td><code>npm run dev</code> / <code>build</code> / <code>start</code></td><td>Develop, build, and production start (migrate, seed if empty, serve)</td></tr>
<tr><td><code>npm run db:generate</code></td><td>Write a new SQL migration after editing the schema</td></tr>
<tr><td><code>npm run db:reset</code></td><td>Wipe and re-seed the database</td></tr>
<tr><td><code>npm test</code></td><td>Unit and integration tests (Vitest)</td></tr>
<tr><td><code>npm run test:e2e</code></td><td>Playwright, desktop and mobile</td></tr>
<tr><td><code>npm run docs:pdf</code></td><td>Rebuild this PDF (run <code>npm run build</code> first)</td></tr>
</table>`,
    },
    {
      id: "testing",
      title: "Testing",
      html: `
<table>
<tr><th>Suite</th><th>Tests</th><th>What it covers</th></tr>
<tr><td>Unit (Vitest)</td><td>${c.unit}</td><td>Chunking, header stripping, keyword matching, cosine ranking and per-document caps, match labels, relative dates and history groups, SEMPDF_TODAY parsing, Zod schemas, cache freshness, JWT signing and tamper checks.</td></tr>
<tr><td>Integration (Vitest + real Postgres + real model)</td><td>${c.integration}</td><td>Account creation and bcrypt login, PDF ingest with 384 dimension vectors, scanned and fake PDFs, semantic search for paraphrased questions, saved results cache and refresh after upload or delete, empty results, user scoping for documents, files and history, the full demo seed, and the health check.</td></tr>
<tr><td>End to end (Playwright)</td><td>${e2e} (${c.e2eDesktop} desktop, ${c.e2eMobile} mobile)</td><td>Redirects when signed out, inline form errors, demo login, sign up, semantic search and opening the matched passage, cached repeat, collection filter, no results, history delete, library filters, upload validation and indexing, delete, PDF download, and a Pixel 7 mobile run with an overflow check on every tab.</td></tr>
</table>
<p><strong>Total: ${c.unit + c.integration + e2e} tests, all passing.</strong> Integration tests and Playwright use the <code>sempdf_test</code> database, which is migrated automatically and reset before each run. Playwright builds the app and runs it with <code>next start</code> in production mode, with <code>SEMPDF_TODAY=2026-10-05</code>.</p>
<pre>pg_isready            # the container can restart Postgres
npm test              # unit + integration
npm run test:e2e      # builds, seeds sempdf_test, runs desktop and mobile</pre>`,
    },
    {
      id: "deploy",
      title: "Deployment",
      html: `
<p>SemPDF runs on Railway in the <strong>school-projects</strong> project as the service <strong>sem-pdf</strong>, deployed from the GitHub repository. Public URL: <strong>${PUBLIC_URL}</strong></p>
<h4>railway.json</h4>
<pre>build:  npm run build
start:  npm run db:migrate && npm run db:seed:if-empty
        && npx next start -H 0.0.0.0 -p $PORT
health: /api/health (runs "select 1" against Postgres)</pre>
<h4>Variables</h4>
<table>
<tr><td>DATABASE_URL</td><td>Built from reference variables of the project's <code>Postgres</code> service, pointing at a separate <code>sempdf</code> database on that server</td></tr>
<tr><td>SESSION_SECRET</td><td>Random 64 character hex string</td></tr>
<tr><td>NODE_ENV</td><td>production</td></tr>
<tr><td>ONNXRUNTIME_NODE_INSTALL</td><td>skip (same reason as .npmrc)</td></tr>
</table>
<div class="box"><strong>Note on the database.</strong> The project has reached Railway's limit of 10 volumes, so a new Postgres service could not be added. Instead of deleting another app's database, SemPDF uses its own database named <code>sempdf</code> on the existing <code>Postgres</code> server. <code>scripts/migrate.ts</code> creates it on first boot if it is missing. Nothing in the other app's database is touched. To move to a dedicated server later, add a Postgres service once a volume is free and point DATABASE_URL at it; the app will migrate and seed itself.</div>
<p>On first boot the start command applies migrations, sees an empty database and seeds the demo data (about 10 seconds), then starts Next.js. Later restarts skip the seed and keep uploaded PDFs and history.</p>`,
    },
    {
      id: "script",
      title: "5 minute presentation script",
      html: `
<table class="script">
<tr><th>Time</th><th>What to do and say</th></tr>
<tr><td>0:00 to 0:30</td><td><strong>The problem.</strong> "Students collect dozens of PDFs. Ctrl+F only finds exact words. If my notes say maize and I search corn, I find nothing." Show the sign in page.</td></tr>
<tr><td>0:30 to 1:00</td><td><strong>Sign in.</strong> "The demo account is filled in." Click Sign in. Point at the stats: 42 PDFs, 157 pages, 216 passages, 73 saved searches.</td></tr>
<tr><td>1:00 to 2:00</td><td><strong>The key demo.</strong> Search <em>best time to plant corn</em>. "The Maize Farming Guide is first. The word corn is not in any document." Point at the blue box: a keyword search would find only a few of these. Point at a "Found by meaning" badge and the match bar. Open the top result and show the highlighted passage on its page.</td></tr>
<tr><td>2:00 to 2:40</td><td><strong>More questions.</strong> Click the chip <em>can my landlord throw me out</em> (Tenancy Law), then type <em>what should I do if someone is choking</em> (First Aid). Use the collection chips to filter.</td></tr>
<tr><td>2:40 to 3:10</td><td><strong>Fast and saved.</strong> Run the corn search again. "Loaded saved results in a few ms." Open History: grouped by day, run counts, "Will refresh" badges, and a search with nothing found.</td></tr>
<tr><td>3:10 to 3:50</td><td><strong>Upload.</strong> Go to Upload, choose a PDF, pick a collection, click Upload and index. Show pages and passages indexed. Search for something in it. Show the scanned PDF with "No text found" in the Library.</td></tr>
<tr><td>3:50 to 4:30</td><td><strong>How it works.</strong> "Each passage becomes 384 numbers from a small local model, all-MiniLM-L6-v2. The question becomes 384 numbers too. Cosine similarity finds the closest passages. No data leaves the server and there is no API bill."</td></tr>
<tr><td>4:30 to 5:00</td><td><strong>Wrap up.</strong> Switch to dark mode, resize to phone width to show the tab bar. "${c.unit + c.integration + e2e} automated tests, deployed on Railway." Take questions.</td></tr>
</table>
<p><strong>Backup plan:</strong> if the network fails, open this PDF and walk through the screenshots in section 4.</p>`,
    },
    {
      id: "decisions",
      title: "Decisions made",
      html: `
<ul>
<li><strong>Model:</strong> all-MiniLM-L6-v2, 8-bit quantized ONNX (23 MB), committed to the repository so it works offline and on Railway without downloading anything at runtime.</li>
<li><strong>Vectors in bytea, ranking in Node:</strong> no pgvector needed; fast enough for this scale and testable as a pure function.</li>
<li><strong>PDFs stored in Postgres:</strong> avoids a file volume (the Railway project is at its volume limit).</li>
<li><strong>Passages of about 70 words with one sentence of overlap:</strong> short enough for precise snippets, long enough for context. Max 3 results per document, top 20 overall, minimum score 0.22.</li>
<li><strong>Saved search cache keyed on library version:</strong> repeat searches are instant, and any upload or delete makes them refresh automatically.</li>
<li><strong>Collections:</strong> 8 fixed collections chosen at upload time, used for chips and colours.</li>
<li><strong>Theme:</strong> YouTube colours, Roboto, pill search bar and chips, but our own layout: top tabs on desktop and a bottom tab bar on mobile, no sidebar.</li>
<li><strong>Accounts:</strong> sign up is open so anyone can try their own private library. Demo: demo@sempdf.app / demo1234. Second demo user: tunde@sempdf.app / tunde1234.</li>
<li><strong>Deployment database:</strong> a separate <code>sempdf</code> database on the project's existing Postgres server, because the project has no free volumes.</li>
</ul>`,
    },
  ];
}
