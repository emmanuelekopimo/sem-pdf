import { expect, type Page } from "@playwright/test";

export async function signInAsDemo(page: Page) {
  await page.goto("/signin");
  await expect(page.getByLabel("Email")).toHaveValue("demo@sempdf.app");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/search");
}

export async function search(page: Page, query: string) {
  const box = page.getByRole("search").filter({ visible: true }).first().getByRole("searchbox");
  await box.fill(query);
  await box.press("Enter");
  await page.waitForURL(/\/search\?q=/);
}
