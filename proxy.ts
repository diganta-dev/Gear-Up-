import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { jwtUtils } from "./utils/jwt";
import { JwtPayload } from "jsonwebtoken";


const publicRoutes = ["/login", "/register","/","/gear"];
const protectedRoutes = ["/dashboard", "/admin-dashboard", "/provider-dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  
  let decodedAccessToken = accessToken
        ? (await jwtUtils.verifyToken(accessToken, process.env.JWT_SECRET as string) as (JwtPayload & { success?: boolean; role?: string }))
        : null;
   
        

let userRole = null;

if(decodedAccessToken?.success){
 cookieStore.delete("accessToken");
}



}
export const config = {
    matcher: [
        // '/dashboard/:path*',
        // '/admin-dashboard/:path*',
        '/((?!api|_next/static|favicon.ico|_next/image|.*\\.png$).*)'
    ],
}
