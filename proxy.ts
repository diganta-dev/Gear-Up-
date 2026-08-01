import { NextRequest, NextResponse } from "next/server";
import { jwtUtils } from "./utils/jwt";

const authRoutes = ["/login", "/register"];
const publicRoutes = ["/", "/gear"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // Verify token if it exists
  let decodedToken = accessToken
    ? (await jwtUtils.verifyToken(
        accessToken,
        process.env.JWT_SECRET as string
      ) as { success?: boolean; role?: string })
    : null;

  // If token is invalid/expired, clear the cookie and treat as unauthenticated
  if (accessToken && !decodedToken?.success) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("accessToken");
    // Only redirect to login if current route is protected
    const isPublic = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    const isAuth = authRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    if (isPublic || isAuth) {
      // Let them stay on public/auth pages, just clear the bad cookie
      const next = NextResponse.next();
      next.cookies.delete("accessToken");
      return next;
    }
    return response;
  }

  // Get user role
  const userRole = decodedToken?.success ? decodedToken.role : null;

  // If logged in user tries to access auth routes (login/register), redirect to their dashboard
  if (accessToken && decodedToken?.success && authRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    }
    if (userRole === "PROVIDER") {
      return NextResponse.redirect(new URL("/provider-dashboard", request.url));
    }
    // Default: CUSTOMER or any other role
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If not logged in and trying to access protected routes, redirect to login
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!accessToken && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control (check more specific routes first!)
  if (pathname.startsWith("/admin-dashboard") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/provider-dashboard") && userRole !== "PROVIDER") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/dashboard") && userRole !== "CUSTOMER") {
    // Make sure /dashboard doesn't catch /dashboard-admin etc.
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|favicon.ico|_next/image|.*\\.png$).*)",
  ],
};
