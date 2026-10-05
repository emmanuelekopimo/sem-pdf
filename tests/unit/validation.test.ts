import { describe, expect, it } from "vitest";
import { MAX_FILE_BYTES, fieldErrors, searchQuerySchema, signInSchema, signUpSchema, uploadSchema } from "@/lib/validation";

const pdf = (name = "notes.pdf", size = 1000, type = "application/pdf") => ({ name, size, type });

describe("signInSchema", () => {
  it("normalises the email", () => {
    expect(signInSchema.parse({ email: "  Demo@SemPDF.app ", password: "x" }).email).toBe("demo@sempdf.app");
  });

  it("reports field errors", () => {
    const r = signInSchema.safeParse({ email: "nope", password: "" });
    expect(r.success).toBe(false);
    const errors = fieldErrors(r.error!);
    expect(errors.email?.[0]).toMatch(/valid email/);
    expect(errors.password?.[0]).toMatch(/Enter your password/);
  });
});

describe("signUpSchema", () => {
  it("requires a name and an 8 character password", () => {
    const r = signUpSchema.safeParse({ name: "A", email: "a@b.co", password: "short" });
    const errors = fieldErrors(r.error!);
    expect(errors.name).toBeDefined();
    expect(errors.password?.[0]).toMatch(/8 characters/);
  });
});

describe("searchQuerySchema", () => {
  it("trims and enforces length", () => {
    expect(searchQuerySchema.parse("  corn  ")).toBe("corn");
    expect(searchQuerySchema.safeParse("a").success).toBe(false);
    expect(searchQuerySchema.safeParse("x".repeat(201)).success).toBe(false);
  });
});

describe("uploadSchema", () => {
  it("accepts PDFs in a known collection", () => {
    expect(uploadSchema.safeParse({ collection: "Agriculture", files: [pdf()] }).success).toBe(true);
  });

  it("rejects missing files, wrong types, large files and unknown collections", () => {
    const errs = (input: unknown) => fieldErrors(uploadSchema.safeParse(input).error!);
    expect(errs({ collection: "Agriculture", files: [] }).files?.[0]).toMatch(/at least one PDF/);
    expect(errs({ collection: "Agriculture", files: [pdf("photo.jpg", 10, "image/jpeg")] }).files?.[0]).toMatch(/not a PDF/);
    expect(errs({ collection: "Agriculture", files: [pdf("big.pdf", MAX_FILE_BYTES + 1)] }).files?.[0]).toMatch(/larger than 10 MB/);
    expect(errs({ collection: "Astrology", files: [pdf()] }).collection?.[0]).toMatch(/Pick a collection/);
    expect(errs({ collection: "General", files: Array.from({ length: 11 }, () => pdf()) }).files?.[0]).toMatch(/at most 10/);
  });
});
