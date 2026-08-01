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

export const getRentalById = async (id: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "You must be logged in to view rental details.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/rentals/${id}`, {
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

export const updateRentalStatus = async (id: string, status: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "You must be logged in to update rental status.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/rentals/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return {
        success: res.ok,
        message: text || `Status updated to ${status}`,
      };
    }
  } catch (error) {
    console.error("UPDATE RENTAL STATUS ERROR:", error);
    return {
      success: false,
      message: "Failed to update rental status. Please try again.",
    };
  }
};

export const cancelRentalOrder = async (id: string) => {
  return updateRentalStatus(id, "CANCELLED");
};

