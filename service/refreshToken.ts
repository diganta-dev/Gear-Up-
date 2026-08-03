"use server"

import { cookies } from "next/headers";

export const getNewAccessToken = async () => {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("refreshToken")?.value || null;

    if (!refreshToken) {
        // throw new Error("User Not Logged In!");

        return {
            success: false,
            message: "Refresh Token not found!"
        }
    }



    const res = await fetch(`${process.env.BACKEND_API_URL}/api/v1/auth/refresh-token`, {
        method: "POST",
        headers: {
            Cookie: `refreshToken=${refreshToken}`,
            'Content-Type': 'application/json',
        },
        cache: "no-cache",
    });

    // If server returns non-JSON (e.g. HTML 404 page), bail out early
    if (!res.ok) {
        return {
            success: false,
            message: `Refresh token request failed: ${res.status} ${res.statusText}`,
        };
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        return {
            success: false,
            message: "Server returned non-JSON response for refresh token",
        };
    }

    const result = await res.json();
    return result;
}