import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOrganizer = req.auth?.user?.role === "Organizer";
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isProtectedActionRoute =
    pathname.startsWith("/events/create") ||
    /^\/events\/[^/]+\/edit/.test(pathname) ||
    /^\/events\/[^/]+\/delete/.test(pathname);

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/events", req.nextUrl));
    }

    return NextResponse.next();
  }

  if (isProtectedActionRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    if (!isOrganizer) {
      return NextResponse.redirect(new URL("/events", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
