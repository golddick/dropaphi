





import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "da_access";
const REFRESH_COOKIE = "da_refresh";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/privacy",
  "/terms",
  "/pricing",
  "/contact",

  "/auth/login",
  "/auth/signup",
  "/auth/2fa",
  "/auth/recovery-codes", 
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",

  "/invite",
  "/invite/:path*",

  "/api/auth/:path*", 
  "/api/public/:path*",
  "/api/invite/:path*",
  "/api/health",

  "/blog/:path*",
  "/docs/:path*",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => {
    if (path.endsWith("/:path*")) {
      const base = path.replace("/:path*", "");
      return pathname.startsWith(base);
    }
    return pathname === path;
  });
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // allow static
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/)
  ) {
    return NextResponse.next();
  }

  // allow public
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // cookie check (FIXED)
  const cookies = request.cookies;
  const hasAccessToken = !!cookies.get(ACCESS_COOKIE);
  const hasRefreshToken = !!cookies.get(REFRESH_COOKIE);

  if (hasAccessToken || hasRefreshToken) {
    return NextResponse.next();
  }

  // redirect to login
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("redirect", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
};
