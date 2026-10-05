import { expect, test } from "@playwright/test";
import { search, signInAsDemo } from "./helpers";

test.beforeEach(async ({ page }) => {
  await signInAsDemo(page);
});

test("library shows documents, collection filters and the scanned problem case", async ({ page }) => {
  await page.goto("/library");
  await expect(page.getByTestId("library-summary")).toContainText("42 PDFs");
  await expect(page.getByTestId("no-text-badge").first()).toBeVisible();
  await page.getByRole("link", { name: /^Law \d+$/ }).click();
  await expect(page.getByTestId("doc-card")).toHaveCount(4);

  await page.goto("/library");
  await page.getByTestId("doc-card").filter({ hasText: "Photographed Past Questions" }).click();
  await expect(page.getByTestId("no-text-callout")).toBeVisible();
});

test("uploading rejects non PDFs, indexes a PDF and makes it searchable, then delete removes it", async ({ page }) => {
  await page.goto("/library/upload");
  await page.getByRole("button", { name: "Upload and index" }).click();
  await expect(page.locator("#files-error")).toHaveText("Choose at least one PDF");

  await page.locator("#files").setInputFiles("e2e/.fixtures/not-a-pdf.txt");
  await page.getByRole("button", { name: "Upload and index" }).click();
  await expect(page.locator("#files-error")).toHaveText("not-a-pdf.txt is not a PDF");

  await page.locator("#files").setInputFiles("e2e/.fixtures/beekeeping-notes.pdf");
  await page.getByLabel("Collection").selectOption("Agriculture");
  await page.getByRole("button", { name: "Upload and index" }).click();
  const results = page.getByTestId("upload-results");
  await expect(results).toContainText("Beekeeping Field Notes");
  await expect(results).toContainText("2 pages");
  // The select keeps a valid value after React resets the form.
  await expect(page.getByLabel("Collection")).toHaveValue("General");

  await search(page, "producing honey without getting stung");
  await expect(page.getByTestId("result").first()).toContainText("Beekeeping Field Notes");

  await page.getByTestId("result").first().click();
  await page.getByTestId("delete-doc").click();
  await page.waitForURL("**/library");
  await expect(page.getByTestId("doc-card").filter({ hasText: "Beekeeping Field Notes" })).toHaveCount(0);
});

test("the original PDF can be opened", async ({ page }) => {
  await page.goto("/library");
  await page.getByTestId("doc-card").filter({ hasText: "Cassava Production Handbook" }).click();
  const href = await page.getByRole("link", { name: "Open PDF" }).getAttribute("href");
  const res = await page.request.get(href!);
  expect(res.headers()["content-type"]).toBe("application/pdf");
  expect((await res.body()).subarray(0, 4).toString()).toBe("%PDF");
});
