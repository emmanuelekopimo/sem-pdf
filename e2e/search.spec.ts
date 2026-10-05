import { expect, test } from "@playwright/test";
import { search, signInAsDemo } from "./helpers";

test.beforeEach(async ({ page }) => {
  await signInAsDemo(page);
});

test("semantic search finds passages that share no keywords with the question", async ({ page }) => {
  await search(page, "how do I keep my birds healthy");
  const results = page.getByTestId("result");
  await expect(results.first()).toContainText("Poultry Management Basics");
  await expect(page.getByTestId("fresh-search")).toContainText("Searched");
  await expect(page.getByTestId("keyword-callout")).toBeVisible();
  await expect(page.getByTestId("meaning-only").first()).toBeVisible();

  await results.first().click();
  await expect(page).toHaveURL(/\/documents\/\d+\?chunk=\d+/);
  await expect(page.getByTestId("doc-title")).toHaveText("Poultry Management Basics");
  await expect(page.locator(".passage-active")).toBeVisible();
});

test("repeating a search loads the saved results", async ({ page }) => {
  await search(page, "Paying for hospital care");
  await expect(page.getByTestId("fresh-search")).toBeVisible();
  await search(page, "paying for hospital   care");
  await expect(page.getByTestId("cache-hit")).toContainText("Loaded saved results");
});

test("collection chips filter the results", async ({ page }) => {
  await search(page, "why is food so expensive in the market");
  const total = await page.getByTestId("result").count();
  await page.getByRole("link", { name: /^Agriculture \d+$/ }).click();
  await expect(page).toHaveURL(/c=Agriculture/);
  const filtered = await page.getByTestId("result").count();
  expect(filtered).toBeLessThan(total);
  for (const r of await page.getByTestId("result").all()) await expect(r).toContainText("Agriculture");
});

test("off-topic and too short searches are handled", async ({ page }) => {
  await search(page, "premier league transfer news");
  await expect(page.getByTestId("no-results")).toBeVisible();
  await page.goto("/search?q=a");
  await expect(page.getByTestId("search-error")).toHaveText("Type at least 2 characters");
});

test("history lists saved searches and can remove one", async ({ page }) => {
  await search(page, "groundwater in shallow wells");
  await page.getByRole("link", { name: "History" }).first().click();
  const item = page.getByTestId("history-item").filter({ hasText: "groundwater in shallow wells" });
  await expect(item).toBeVisible();
  await expect(item).toContainText("Today");
  await expect(page.getByTestId("stale-badge").first()).toBeVisible();
  await item.getByRole("button", { name: /Remove/ }).click();
  await expect(page.getByTestId("history-item").filter({ hasText: "groundwater in shallow wells" })).toHaveCount(0);
});
