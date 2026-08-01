"use server";

import { cookies } from "next/headers";

const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://gearupshop.vercel.app";

export const getMyRentals = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "You must be logged in to view rentals.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/rentals`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      cache: "no-store",
    });

    const result = await res.json();
    return result;
  } catch (_error) {
    return {
      success: false,
      message: "Failed to connect to the server. Please try again.",
    };
  }
};
