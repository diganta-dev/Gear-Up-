import { jwtVerify } from "jose";

const verifyToken = async (token: string, secret: string) => {
  try {
    const encodedSecret = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, encodedSecret);
    return { success: true, ...payload };
  } catch (error: any) {
    console.log("JWT Verification Error:", error.message);
    return { success: false, error: error.message };
  }
}

export const jwtUtils = { verifyToken };