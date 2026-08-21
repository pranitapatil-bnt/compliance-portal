import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/constants/auth";
import { routes } from "@/constants/routes";

export function GET(request: NextRequest) {
  const loginUrl = new URL(routes.login, request.url);
  const response = NextResponse.redirect(loginUrl);

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
