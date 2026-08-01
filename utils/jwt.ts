import { jwtDecode } from "jwt-decode";
import { IDecodedToken } from "@/types/user";

export function decodeToken(token: string): IDecodedToken | null {
  try {
    return jwtDecode<IDecodedToken>(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}
