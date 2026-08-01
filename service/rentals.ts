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
      next: { revalidate: 15, tags: ["my-rentals"] },
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

// Fetches all rental orders placed on the provider's gear items
export const getProviderRentals = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "You must be logged in.", data: [] };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/provider/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      next: { revalidate: 15, tags: ["provider-rentals"] },
    });

    if (res.ok) {
      return await res.json();
    }

    return { success: false, message: "Could not load provider orders.", data: [] };
  } catch (_error) {
    return { success: false, message: "Failed to connect to the server.", data: [] };
  }
};

// Updates the status of a provider's incoming order
export const updateProviderOrderStatus = async (id: string, status: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "You must be logged in to update order status." };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/provider/orders/${id}`, {
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
      return { success: res.ok, message: text || `Status updated to ${status}` };
    }
  } catch (error) {
    console.error("UPDATE PROVIDER ORDER STATUS ERROR:", error);
    return { success: false, message: "Failed to update order status. Please try again." };
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

