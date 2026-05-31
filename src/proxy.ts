import { auth } from "@/auth";
import { getAuthRedirectPath, getLoginHref } from "@/lib/auth-navigation.mjs";
import { canApproveOrganizers, canCreateEvents } from "@/lib/permissions.mjs";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isVerificationRoute = pathname.startsWith("/verify-email");
  const isProtectedActionRoute =
    pathname.startsWith("/events/create") ||
    /^\/events\/[^/]+\/edit/.test(pathname) ||
    /^\/events\/[^/]+\/delete/.test(pathname);
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAuthRoute) {
    if (isLoggedIn) {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
      return NextResponse.redirect(new URL(getAuthRedirectPath(callbackUrl), req.nextUrl));
    }

    return NextResponse.next();
  }

  if (isVerificationRoute) {
    return NextResponse.next();
  }

  if (isProtectedActionRoute || isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(getLoginHref(`${pathname}${req.nextUrl.search}`), req.nextUrl),
      );
    }

    if (!req.auth?.user?.isEmailVerified) {
      const email = req.auth?.user?.email ?? "";
      const verifyUrl = new URL("/verify-email/sent", req.nextUrl);
      verifyUrl.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
      if (email) verifyUrl.searchParams.set("email", email);
      return NextResponse.redirect(verifyUrl);
    }

    if (isProtectedActionRoute && !canCreateEvents(role)) {
      return NextResponse.redirect(new URL("/events", req.nextUrl));
    }

    if (isAdminRoute && !canApproveOrganizers(role)) {
      return NextResponse.redirect(new URL("/events", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
