import { NextRequest, NextResponse } from "next/server";
import { jwtUtils } from "./utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { getNewAccessToken } from "./service/refreshToken";
import { cookies } from "next/headers";

const authRoutes = ["/login", "/register"];
const publicRoutes = ["/", "/gear"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // Verify token if it exists
  let decodedAccessToken = accessToken
    ? (await jwtUtils.verifyToken(
        accessToken,
        process.env.JWT_SECRET as string
      ) as { success?: boolean; role?: string })
    : null;

     const decodedRefreshToken = refreshToken
        ? (await jwtUtils.verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET as string) as (JwtPayload & { success?: boolean; role?: string }))
        : null;

     if(!decodedAccessToken?.success && decodedRefreshToken?.success){
        
        // refresh token
        const result = await getNewAccessToken()

        if(result.success){
            
          cookieStore.set("accessToken",result.data.accessToken,{httpOnly:true,maxAge:60*60*24,sameSite:'lax'});   
          accessToken =  result.data.accessToken
          decodedAccessToken = await jwtUtils.verifyToken(accessToken as string, process.env.JWT_SECRET as string) as (JwtPayload & { success?: boolean; role?: string }) ;

        }
    }
  // If token is invalid/expired, clear the cookie and treat as unauthenticated
  if (accessToken && !decodedAccessToken?.success) {
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
  const userRole = decodedAccessToken?.success ? decodedAccessToken.role : null;

  // If logged in user tries to access auth routes (login/register), redirect to their dashboard
  if (accessToken && decodedAccessToken?.success && authRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
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
