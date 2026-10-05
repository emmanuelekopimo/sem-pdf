import { expect, test } from "@playwright/test";
import { search, signInAsDemo } from "./helpers";

test("mobile: sign in, search from the page bar, navigate with the tab bar, no sideways scroll", async ({ page }) => {
  await signInAsDemo(page);
  const tabbar = page.getByRole("navigation", { name: "Main mobile" });
  await expect(tabbar).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main", exact: true })).toBeHidden();

  await search(page, "what to do when a person faints");
  await expect(page.getByTestId("result").first()).toContainText("First Aid Quick Reference");

  for (const [tab, path] of [
    ["Library", "/library"],
    ["History", "/history"],
    ["Upload", "/library/upload"],
    ["Search", "/search"],
  ] as const) {
    await tabbar.getByRole("link", { name: tab }).click();
    await expect(page).toHaveURL(new RegExp(`${path.replace("/", "\\/")}$`));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
  }
});
