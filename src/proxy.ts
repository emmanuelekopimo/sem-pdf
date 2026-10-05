import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/server/session";

const PUBLIC_PATHS = ["/signin", "/signup"];

/** Sends signed-out visitors to the sign-in page and signed-in users away from it. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!session && !isPublic) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  if (session && isPublic) {
    return NextResponse.redirect(new URL("/search", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/health|_next/static|_next/image|favicon.ico|icon.svg|logo.svg|illustrations/).*)"],
};
