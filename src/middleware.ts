import { NextResponse } from "next/server";

import { CookieKey } from "@/lib/cookie";
import { decodeToken } from "@/lib/jwt";

import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

const publicPaths = ["/login", "/welcome"];

export async function middleware(request: NextRequest) {
  const jwt = request.cookies.get(CookieKey.JWT)?.value;
  const currentPath = request.nextUrl.pathname;

  const isPublicPath = publicPaths.includes(currentPath);

  if (!jwt && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", `${currentPath}${request.nextUrl.search}`);

    return NextResponse.redirect(loginUrl);
  }

  if (jwt) {
    try {
      const payload = await decodeToken(jwt);

      if (!payload?.uid && !isPublicPath) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (currentPath === "/login") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("JWT decode error:", error);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(CookieKey.JWT);
      return response;
    }
  }

  return NextResponse.next();
}
