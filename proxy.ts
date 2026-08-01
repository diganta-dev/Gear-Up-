import { NextRequest, NextResponse } from "next/server";
import { isTokenExpired } from "@/utils/jwt";

const authRoutes = ["/login", "/register"];
const protectedRoutes = ["/dashboard", "/admin-dashboard", "/author-dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // If user is logged in and tries to access auth routes, redirect to dashboard
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (accessToken && !isTokenExpired(accessToken)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // If user is not logged in and tries to access protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!accessToken || isTokenExpired(accessToken)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*", "/admin-dashboard/:path*", "/author-dashboard/:path*"],
};
