"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import type { IProviderOrder, IActionResult } from "@/types/rental";

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

// Helper to extract order array from any backend JSON response structure
function extractOrdersArray(json: any): IProviderOrder[] {
  if (!json) return [];
  let raw: any[] = [];
  if (Array.isArray(json)) raw = json;
  else if (Array.isArray(json.data)) raw = json.data;
  else if (Array.isArray(json.data?.result)) raw = json.data.result;
  else if (Array.isArray(json.data?.data)) raw = json.data.data;
  else if (Array.isArray(json.data?.orders)) raw = json.data.orders;
  else if (Array.isArray(json.data?.rentals)) raw = json.data.rentals;
  else if (Array.isArray(json.data?.items)) raw = json.data.items;
  else if (Array.isArray(json.orders)) raw = json.orders;
  else if (Array.isArray(json.rentals)) raw = json.rentals;
  else if (Array.isArray(json.result)) raw = json.result;
  else if (Array.isArray(json.items)) raw = json.items;

  return raw.map((item: any) => {
    const customerObj = item.user || item.customer || item.renter || {};
    const firstItem = Array.isArray(item.items) && item.items.length > 0 ? item.items[0] : null;
    const gearObj = item.gear || item.gearItem || (firstItem ? firstItem.gearItem || firstItem.gear || firstItem : {});

    return {
      ...item,
      id: String(item.id || item._id || ""),
      status: item.status || "PLACED",
      totalAmount: item.totalAmount ?? item.totalPrice ?? item.amount ?? 0,
      startDate: item.startDate || item.createdAt || new Date().toISOString(),
      endDate: item.endDate || item.createdAt || new Date().toISOString(),
      createdAt: item.createdAt || new Date().toISOString(),
      user: {
        id: String(customerObj.id || customerObj._id || ""),
        name: customerObj.name || "Customer",
        email: customerObj.email || "",
        profileImage: customerObj.profileImage || null,
      },
      customer: {
        id: String(customerObj.id || customerObj._id || ""),
        name: customerObj.name || "Customer",
        email: customerObj.email || "",
        profileImage: customerObj.profileImage || null,
      },
      gear: {
        id: String(gearObj.id || gearObj._id || ""),
        name: gearObj.name || "Equipment",
        images: gearObj.images || [],
      },
      gearItem: {
        id: String(gearObj.id || gearObj._id || ""),
        name: gearObj.name || "Equipment",
        images: gearObj.images || [],
      },
    };
  });
}

// Fetches all rental orders for the authenticated provider.
export const getProviderRentals = async (): Promise<IProviderOrder[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  console.log("[getProviderRentals] accessToken present:", !!accessToken);
  if (!accessToken) return [];

  const headers = {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}`,
    Authorization: accessToken,
    authorization: `Bearer ${accessToken}`,
  };

  try {
    const primaryUrl = `${API_BASE_URL}/api/provider/orders`;
    console.log("[getProviderRentals] Fetching primary:", primaryUrl);
    const res = await fetch(primaryUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    console.log("[getProviderRentals] Primary status:", res.status, res.statusText);
    if (res.ok) {
      const text = await res.text();
      console.log("[getProviderRentals] Primary raw response:", text.slice(0, 500));
      try {
        const json = JSON.parse(text);
        const orders = extractOrdersArray(json);
        console.log("[getProviderRentals] Primary extracted orders count:", orders.length);
        return orders;
      } catch (e) {
        console.error("[getProviderRentals] Primary JSON parse error:", e);
        return [];
      }
    } else {
      const errText = await res.text();
      console.warn("[getProviderRentals] Primary endpoint failed:", res.status, errText.slice(0, 300));
    }
  } catch (e) {
    console.error("[getProviderRentals] Primary endpoint exception:", e);
  }

  // Fallback to /api/rentals
  try {
    const fallbackUrl = `${API_BASE_URL}/api/rentals`;
    console.log("[getProviderRentals] Fetching fallback:", fallbackUrl);
    const fallbackRes = await fetch(fallbackUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    console.log("[getProviderRentals] Fallback status:", fallbackRes.status, fallbackRes.statusText);
    if (fallbackRes.ok) {
      const text = await fallbackRes.text();
      console.log("[getProviderRentals] Fallback raw response:", text.slice(0, 500));
      try {
        const json = JSON.parse(text);
        const orders = extractOrdersArray(json);
        console.log("[getProviderRentals] Fallback extracted orders count:", orders.length);
        return orders;
      } catch (e) {
        console.error("[getProviderRentals] Fallback JSON parse error:", e);
        return [];
      }
    } else {
      const errText = await fallbackRes.text();
      console.warn("[getProviderRentals] Fallback endpoint failed:", fallbackRes.status, errText.slice(0, 300));
    }
  } catch (e) {
    console.error("[getProviderRentals] Fallback endpoint exception:", e);
  }

  console.warn("[getProviderRentals] All endpoints failed — returning empty array");
  return [];
};

// Updates the status of a provider's incoming order.
// After this returns { success: true }, the client calls router.refresh()
// to re-render the server component with fresh data.
export const updateProviderOrderStatus = async (
  id: string,
  status: string
): Promise<IActionResult> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "You must be logged in to update order status." };
  }

  const headers = {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}`,
    Authorization: accessToken,
    authorization: `Bearer ${accessToken}`,
  };

  const statusUpper = status.toUpperCase();

  const endpoints = [
    { url: `${API_BASE_URL}/api/provider/orders/${id}`, method: "PATCH", body: { status: statusUpper } },
    { url: `${API_BASE_URL}/api/rentals/${id}/status`, method: "PATCH", body: { status: statusUpper } },
    { url: `${API_BASE_URL}/api/rentals/${id}`, method: "PATCH", body: { status: statusUpper } },
    { url: `${API_BASE_URL}/api/provider/orders/${id}`, method: "PUT", body: { status: statusUpper } },
    { url: `${API_BASE_URL}/api/rentals/${id}/status`, method: "PUT", body: { status: statusUpper } },
    { url: `${API_BASE_URL}/api/rentals/${id}`, method: "PUT", body: { status: statusUpper } },
    { url: `${API_BASE_URL}/api/provider/orders/${id}`, method: "PATCH", body: { rentalStatus: statusUpper } },
    { url: `${API_BASE_URL}/api/rentals/${id}/status`, method: "PATCH", body: { rentalStatus: statusUpper } },
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint.url, {
        method: endpoint.method,
        headers,
        body: JSON.stringify(endpoint.body),
        cache: "no-store",
      });

      if (res.ok) {
        try { revalidateTag("admin-rentals", "max"); } catch {}
        try { revalidateTag("my-rentals", "max"); } catch {}
        try { revalidatePath("/admin-dashboard/orders"); } catch {}
        try { revalidatePath("/provider-dashboard/orders"); } catch {}
        try { revalidatePath("/dashboard/customer/orders"); } catch {}
        try { revalidatePath("/dashboard"); } catch {}
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          return {
            success: json.success ?? true,
            message: json.message ?? `Order status updated to ${statusUpper}.`,
          };
        } catch {
          return { success: true, message: `Order status updated to ${statusUpper}.` };
        }
      }
    } catch (_err) {
      // Try next endpoint
    }
  }

  return { success: false, message: "Failed to update order status. Please try again." };
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
  return updateProviderOrderStatus(id, status);
};

export const cancelRentalOrder = async (id: string) => {
  return updateRentalStatus(id, "CANCELLED");
};

