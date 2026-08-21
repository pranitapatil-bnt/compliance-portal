import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/constants/auth";
import { routes } from "@/constants/routes";

const protectedPrefixes = [
  routes.reg,
  routes.txnApi,
  routes.transactions,
  routes.paymentIn,
  routes.paymentOut,
  routes.dataAnon,
  "/reports",
  routes.users,
  routes.products,
] as const;

function isProtectedPath(pathname: string) {
  if (pathname === routes.home) {
    return true;
  }

  return protectedPrefixes.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (session) {
    return NextResponse.next();
  }

  const loginUrl = new URL(routes.login, request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/",
    "/reg",
    "/reg/:path*",
    "/txn-api",
    "/txn-api/:path*",
    "/transactions",
    "/transactions/:path*",
    "/payment-in",
    "/payment-in/:path*",
    "/payment-out",
    "/payment-out/:path*",
    "/data-anon",
    "/data-anon/:path*",
    "/reports/:path*",
    "/users",
    "/users/:path*",
    "/products",
    "/products/:path*",
  ],
};
