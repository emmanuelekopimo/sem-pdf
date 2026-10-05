import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { isCacheFresh, keywordOverlapPercent } from "@/lib/search-rules";
import { signSession, verifySession } from "@/server/session";

describe("isCacheFresh", () => {
  it("is fresh only when the library version matches", () => {
    expect(isCacheFresh({ libraryVersion: 4 }, 4)).toBe(true);
    expect(isCacheFresh({ libraryVersion: 3 }, 4)).toBe(false);
    expect(isCacheFresh(null, 0)).toBe(false);
  });
});

describe("keywordOverlapPercent", () => {
  it("is the share of results with a literal keyword match", () => {
    expect(keywordOverlapPercent([])).toBe(0);
    expect(keywordOverlapPercent([{ keywordMatch: true }, { keywordMatch: false }, { keywordMatch: false }])).toBe(33);
  });
});

describe("session tokens", () => {
  it("round trips a signed session", async () => {
    const token = await signSession({ userId: 7, email: "a@b.co", name: "Ada" });
    expect(await verifySession(token)).toEqual({ userId: 7, email: "a@b.co", name: "Ada" });
  });

  it("rejects missing, tampered and foreign tokens", async () => {
    expect(await verifySession(undefined)).toBeNull();
    const token = await signSession({ userId: 7, email: "a@b.co", name: "Ada" });
    expect(await verifySession(`${token.slice(0, -2)}xx`)).toBeNull();
    const foreign = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject("7").sign(new TextEncoder().encode("other-secret"));
    expect(await verifySession(foreign)).toBeNull();
  });
});
