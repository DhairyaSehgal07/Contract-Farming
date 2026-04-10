import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getPostSignInPath } from "@/lib/post-sign-in-path";

/** Run on all routes except static assets and API routes. */
export const config = {
  matcher: [
    /*
     * Match all pathnames except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

/** Only these routes are reachable without a session (marketing + auth). */
function isPublicPath(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/sign-in");
}

export default async function proxy(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("NEXTAUTH_SECRET is not set");
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret });
  const url = request.nextUrl;
  const pathname = url.pathname;

  if (token && isPublicPath(pathname)) {
    const role =
      typeof token.role === "string" ? token.role : undefined;
    const destination = getPostSignInPath(role);
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (!token && !isPublicPath(pathname)) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname + url.search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}
