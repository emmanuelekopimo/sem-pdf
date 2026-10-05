import { expect, test } from "@playwright/test";
import { signInAsDemo } from "./helpers";

test("signed out visitors are sent to sign in", async ({ page }) => {
  await page.goto("/library");
  await expect(page).toHaveURL(/\/signin$/);
  const res = await page.request.get("/api/documents/1/file");
  expect(res.status()).toBe(401);
});

test("sign in form shows inline errors", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("#email-error")).toHaveText("Enter a valid email address");

  await page.getByLabel("Email").fill("demo@sempdf.app");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator(".form-error")).toHaveText("Email or password is incorrect");
  await expect(page.locator("#email-error")).toHaveCount(0);
});

test("demo login is pre-filled and lands on the search home", async ({ page }) => {
  await signInAsDemo(page);
  await expect(page.getByRole("heading", { name: "What are you looking for, Adaeze?" })).toBeVisible();
  await expect(page.getByTestId("stats")).toContainText("42");
  await expect(page.getByTestId("suggestions").getByRole("link").first()).toBeVisible();
});

test("a new account starts with an empty library and can sign out", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("Emeka Uche");
  await page.getByLabel("Email").fill("demo@sempdf.app");
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("#password-error")).toContainText("at least 8 characters");

  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("#email-error")).toHaveText("An account with this email already exists");
  await expect(page.getByLabel("Full name")).toHaveValue("Emeka Uche");

  await page.getByLabel("Email").fill(`emeka.${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/library/upload");
  await page.goto("/search");
  await expect(page.getByTestId("empty-library")).toBeVisible();
  await page.goto("/history");
  await expect(page.getByTestId("empty-history")).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/signin$/);
});
