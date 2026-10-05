import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/sempdf_test";
// The sandbox ships Chromium at this path; elsewhere Playwright uses its own download.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH ?? (process.env.PLAYWRIGHT_BROWSERS_PATH === "/opt/pw-browsers" ? "/opt/pw-browsers/chromium" : undefined);

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  // Tests share one seeded database, so they run in order.
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    launchOptions: { executablePath },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } }, testIgnore: /mobile\.spec\.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions: { executablePath } }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    timeout: 240_000,
    reuseExistingServer: false,
    env: { DATABASE_URL, SEMPDF_TODAY: "2026-10-05", SESSION_SECRET: "e2e-secret", NODE_ENV: "production" },
  },
});
