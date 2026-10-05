import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sempdf_session";
export const SESSION_DAYS = 7;

export type SessionPayload = { userId: number; email: string; name: string };

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return new TextEncoder().encode(secret ?? "sempdf-development-secret-change-me");
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId)) return null;
    return { userId, email: String(payload.email ?? ""), name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
