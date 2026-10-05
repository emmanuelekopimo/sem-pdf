import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { users, type User } from "@/db/schema";
export { DEMO_EMAIL, DEMO_PASSWORD, checkCredentials, createUser, EmailTakenError } from "./auth-core";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from "./session";

export async function startSession(user: Pick<User, "id" | "email" | "name">): Promise<void> {
  const token = await signSession({ userId: user.id, email: user.email, name: user.name });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in user, or null. Checks the database so deleted accounts are signed out. */
export async function getCurrentUser(): Promise<User | null> {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await getDb().query.users.findFirst({ where: eq(users.id, session.userId) });
  return user ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
}
