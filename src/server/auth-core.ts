import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { Db } from "@/db";
import { users, type User } from "@/db/schema";

export const DEMO_EMAIL = "demo@sempdf.app";
export const DEMO_PASSWORD = "demo1234";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** Returns the user if the email and password match, otherwise null. */
export async function checkCredentials(db: Db, email: string, password: string): Promise<User | null> {
  const user = await db.query.users.findFirst({ where: eq(users.email, email.trim().toLowerCase()) });
  if (!user) return null;
  return (await bcrypt.compare(password, user.passwordHash)) ? user : null;
}

export class EmailTakenError extends Error {}

export async function createUser(db: Db, input: { name: string; email: string; password: string }): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const existing = await db.query.users.findFirst({ where: eq(users.email, email), columns: { id: true } });
  if (existing) throw new EmailTakenError("An account with this email already exists");
  const [user] = await db
    .insert(users)
    .values({ name: input.name.trim(), email, passwordHash: await hashPassword(input.password) })
    .returning();
  return user!;
}
