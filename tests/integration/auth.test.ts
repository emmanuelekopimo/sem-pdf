import { describe, expect, it } from "vitest";
import { EmailTakenError, checkCredentials, createUser } from "@/server/auth-core";
import { makeUser, useTestDb } from "./helpers";

const db = useTestDb();

describe("accounts", () => {
  it("stores a bcrypt hash, never the password", async () => {
    const user = await makeUser(db);
    expect(user.passwordHash).not.toContain("password123");
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it("signs in with the right password and normalised email only", async () => {
    await makeUser(db);
    expect((await checkCredentials(db, " CHIOMA@example.com ", "password123"))?.name).toBe("Chioma Nwankwo");
    expect(await checkCredentials(db, "chioma@example.com", "wrong-password")).toBeNull();
    expect(await checkCredentials(db, "nobody@example.com", "password123")).toBeNull();
  });

  it("refuses a second account with the same email", async () => {
    await makeUser(db);
    await expect(createUser(db, { name: "Other", email: "Chioma@Example.com", password: "password123" })).rejects.toBeInstanceOf(EmailTakenError);
  });
});
