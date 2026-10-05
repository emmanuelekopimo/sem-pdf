# SemPDF

Search a library of PDFs by meaning, not just keywords. Upload lecture notes, handbooks and reports, then ask questions in your own words. A small embedding model (all-MiniLM-L6-v2) runs locally on the server, so there is no external AI service and no API key.

A search for "best time to plant corn" finds the Maize Farming Guide, even though the word corn never appears in it.

![Search results for "best time to plant corn"](docs/screenshots/03-results.png)

Live demo: https://sem-pdf-production.up.railway.app
Demo login: `demo@sempdf.app` / `demo1234` (pre-filled on the sign-in page)

Full documentation with annotated screenshots and a 5 minute presentation script: [docs/SemPDF-Documentation.pdf](docs/SemPDF-Documentation.pdf)

## Features

- Upload up to 10 PDFs at a time. Text is read page by page, split into passages of about 70 words and embedded into 384-number vectors.
- Semantic search ranked by cosine similarity, with match strength, page number and the matching passage. Words shared with the question are highlighted, and passages found purely by meaning are labelled.
- Shows how many results a plain keyword search would have missed.
- Every search is saved to PostgreSQL with its ranked results. Repeat searches load in a few milliseconds, and refresh automatically after PDFs are added or removed.
- Search history grouped by day, library with collection filters, document view with the matched passage highlighted, and the original PDF on demand.
- Scanned PDFs without a text layer are detected and flagged.
- Email and password accounts. All data is scoped to the signed-in user.
- YouTube colour theme with light and dark modes. Works on phones with a bottom tab bar.
- Lots of sample data: 42 PDFs (157 pages, 216 passages) across 8 collections written for a Nigerian university, 73 saved searches over the last 60 days, and problem cases (scanned files, off-topic searches, stale results).

## Tech stack

Next.js 16 (App Router, Server Components, Server Actions), TypeScript (strict), Drizzle ORM and PostgreSQL with drizzle-kit migrations, Zod, bcryptjs and jose, @huggingface/transformers on onnxruntime-node, unpdf, lucide-react, DiceBear, Fontsource Roboto, Vitest and Playwright.

## Quick start

Requires Node.js 20.9+ and PostgreSQL 14+.

```bash
npm install
service postgresql start            # or start Postgres your usual way
createdb sempdf && createdb sempdf_test
npm run db:migrate
npm run db:seed                     # about 5 seconds
npm run dev                         # http://localhost:3000
```

Environment variables (all optional locally):

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/sempdf` | Main database |
| `SESSION_SECRET` | development value | Signs the session cookie. Required in production. |
| `SEMPDF_TODAY` | real date | Pin "today" as `YYYY-MM-DD` for demos and tests |
| `TEST_DATABASE_URL` | `.../sempdf_test` | Database for Vitest and Playwright |

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Migrate, seed if the database is empty, then serve on `0.0.0.0` |
| `npm run db:generate` | Write a new SQL migration after changing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations (creates the database if it does not exist) |
| `npm run db:seed` / `db:reset` | Wipe and load the demo data |
| `npm test` | Unit and integration tests (Vitest, real Postgres) |
| `npm run test:e2e` | Playwright end-to-end tests, desktop and mobile |
| `npm run docs:pdf` | Rebuild `docs/SemPDF-Documentation.pdf` (run `npm run build` first) |
| `npm run lint` / `typecheck` | ESLint and TypeScript |

## Tests

- Unit: 59 tests for the pure business rules in `src/lib`.
- Integration: 15 tests against a real Postgres database and the real embedding model.
- End to end: 13 Playwright tests (12 desktop, 1 mobile on a Pixel 7 profile).

## How it works

1. **Index.** `unpdf` extracts text per page. Running headers and page numbers are removed, pages are split into overlapping passages, and each passage is embedded with all-MiniLM-L6-v2 (quantized ONNX, 23 MB, committed in `models/`).
2. **Search.** The question is embedded the same way and compared with every passage using cosine similarity. Results below 0.22 are dropped, at most 3 passages per document are kept, and the top 20 are saved with the search.
3. **Cache.** Each user has a library version that goes up on every upload or delete. A saved search whose version matches is served straight from the database.

## Project layout

```
src/app          pages, server actions, API routes (health, PDF file)
src/lib          pure business rules (text, vector, format, today, validation)
src/server       auth, embedder, PDF parsing, ingest, search, library queries
src/db           Drizzle schema and connection
drizzle/         SQL migrations
models/          local embedding model files
scripts/         migrate, seed, sample PDF generator, docs generator
tests/           Vitest unit and integration tests
e2e/             Playwright tests
```

## Deployment

Deployed on Railway (project `school-projects`, service `sem-pdf`) from this GitHub repository. `railway.json` builds with `npm run build`, runs migrations and a seed-if-empty step on start, and health checks `/api/health`, which also pings the database.
