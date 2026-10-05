import path from "node:path";
import { defineConfig } from "vitest/config";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/sempdf_test";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    globalSetup: ["tests/global-setup.ts"],
    // Integration tests share one Postgres test database, so files run one at a time.
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 120_000,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      SEMPDF_TODAY: "2026-10-05",
      SESSION_SECRET: "test-secret",
    },
  },
});
