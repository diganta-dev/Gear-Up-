"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";

const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://gearupshop.vercel.app";

// Fetches all users for admin management
export const getAllUsers = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "You must be logged in as an Admin.", data: [] };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
        Authorization: accessToken,
        authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 15, tags: ["admin-users"] },
    });

    if (res.ok) {
      return await res.json();
    }

    // Fallback: try /api/admin/users
    const adminRes = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
        Authorization: accessToken,
        authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 15, tags: ["admin-users"] },
    });

    if (adminRes.ok) {
      return await adminRes.json();
    }

    return { success: false, message: "Could not load users.", data: [] };
  } catch (_error) {
    return { success: false, message: "Failed to connect to the server.", data: [] };
  }
};

// Updates user account status. Backend accepts: "ACTIVE" | "SUSPENDED"
export const updateUserStatus = async (userId: string, isSuspended: boolean) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "You must be logged in as an Admin." };
  }

  const status = isSuspended ? "SUSPENDED" : "ACTIVE";
  const headers = {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}`,
    Authorization: accessToken,
    authorization: `Bearer ${accessToken}`,
  };

  try {
    let res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status, isSuspended }),
      cache: "no-store",
    });

    if (!res.ok) {
      res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, isSuspended }),
        cache: "no-store",
      });
    }

    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: res.ok, message: text || `User status updated to ${status}` };
    }

    if (res.ok && data.success !== false) {
      revalidateTag("admin-users", "max");
      revalidatePath("/admin-dashboard/users");
      revalidatePath("/admin-dashboard");
      revalidatePath("/dashboard/admin/users");
    }

    return {
      success: res.ok && data.success !== false,
      message: data?.message || (res.ok ? `User status updated to ${status}` : "Failed to update user status."),
      data: data?.data || data,
    };
  } catch (error) {
    console.error("UPDATE USER STATUS ERROR:", error);
    return { success: false, message: "Failed to update user status." };
  }
};

// Updates user role. Backend accepts: "CUSTOMER" | "PROVIDER" | "ADMIN"
export const updateUserRole = async (userId: string, role: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "You must be logged in as an Admin." };
  }

  const headers = {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}`,
    Authorization: accessToken,
    authorization: `Bearer ${accessToken}`,
  };

  try {
    // 1. Try PATCH /api/users/:id (Standard REST endpoint)
    let res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ role }),
      cache: "no-store",
    });

    // 2. Fallback: PATCH /api/admin/users/:id/role
    if (!res.ok) {
      res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ role }),
        cache: "no-store",
      });
    }

    // 3. Fallback: PATCH /api/admin/users/:id
    if (!res.ok) {
      res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ role }),
        cache: "no-store",
      });
    }

    // 4. Fallback: PUT /api/users/:id
    if (!res.ok) {
      res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ role }),
        cache: "no-store",
      });
    }

    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: res.ok, message: text || `User role updated to ${role}` };
    }

    if (res.ok && data.success !== false) {
      revalidateTag("admin-users", "max");
      revalidatePath("/admin-dashboard/users");
      revalidatePath("/admin-dashboard");
      revalidatePath("/dashboard/admin/users");
    }

    return {
      success: res.ok && data.success !== false,
      message: data?.message || (res.ok ? `User role updated to ${role}` : "Failed to update user role."),
      data: data?.data || data,
    };
  } catch (error) {
    console.error("UPDATE USER ROLE ERROR:", error);
    return { success: false, message: "Failed to update user role." };
  }
};

// Updates availability status of a gear listing by Admin
export const updateGearAvailabilityAdmin = async (gearId: string, availability: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "Unauthorized" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}`,
    Authorization: accessToken,
    authorization: `Bearer ${accessToken}`,
  };

  const body = JSON.stringify({ availability });

  // Try primary gear endpoint first, then provider endpoint and admin fallbacks
  const endpoints = [
    { method: "PATCH", url: `${API_BASE_URL}/api/gear/${gearId}` },
    { method: "PATCH", url: `${API_BASE_URL}/api/provider/gear/${gearId}` },
    { method: "PUT", url: `${API_BASE_URL}/api/gear/${gearId}` },
    { method: "PUT", url: `${API_BASE_URL}/api/provider/gear/${gearId}` },
    { method: "PATCH", url: `${API_BASE_URL}/api/admin/gear/${gearId}` },
    { method: "PUT", url: `${API_BASE_URL}/api/admin/gear/${gearId}` },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers,
        body,
        cache: "no-store",
      });
      const text = await res.text();
      if (res.ok) {
        try { revalidateTag("admin-gear", "max"); } catch { }
        try { revalidatePath("/admin-dashboard/gear"); } catch { }
        try { revalidatePath("/admin-dashboard"); } catch { }
        try { revalidatePath("/provider-dashboard"); } catch { }
        try { revalidatePath("/gear"); } catch { }
        let data: any = {};
        try { data = JSON.parse(text); } catch { }
        return { success: true, message: data?.message || `Availability updated to ${availability}` };
      }
    } catch (e) {
      console.error(`[updateGearAvailability] ${ep.method} ${ep.url} failed:`, e);
    }
  }

  return { success: false, message: "Failed to update availability. All endpoints rejected the request." };
};

// Soft-archives a gear listing by setting availability to OUT_OF_STOCK and stock to 0 in DB
export const archiveGearAdmin = async (gearId: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}`,
    Authorization: `Bearer ${accessToken}`,
    authorization: `Bearer ${accessToken}`,
  };

  const archivePayloads = [
    { availability: "OUT_OF_STOCK", stock: 0 },
    { availability: "OUT_OF_STOCK" },
  ];

  const endpoints = [
    { method: "PATCH", url: `${API_BASE_URL}/api/gear/${gearId}` },
    { method: "PATCH", url: `${API_BASE_URL}/api/provider/gear/${gearId}` },
    { method: "PUT",   url: `${API_BASE_URL}/api/gear/${gearId}` },
    { method: "PUT",   url: `${API_BASE_URL}/api/provider/gear/${gearId}` },
    { method: "PATCH", url: `${API_BASE_URL}/api/admin/gear/${gearId}` },
    { method: "PUT",   url: `${API_BASE_URL}/api/admin/gear/${gearId}` },
  ];

  for (const payload of archivePayloads) {
    const archiveBody = JSON.stringify(payload);
    for (const ep of endpoints) {
      try {
        const patchRes = await fetch(ep.url, {
          method: ep.method,
          headers,
          body: archiveBody,
          cache: "no-store",
        });
        const patchText = await patchRes.text();
        if (patchRes.ok) {
          return { success: true, body: patchText };
        }
      } catch (e) {
        console.error(`[archiveGearAdmin] ${ep.method} ${ep.url} failed:`, e);
      }
    }
  }

  return { success: false };
};

// Deletes a gear listing by Admin
export const deleteGearAdmin = async (gearId: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "You must be logged in as an Admin." };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}`,
    Authorization: `Bearer ${accessToken}`,
    authorization: `Bearer ${accessToken}`,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/gear/${gearId}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    const messageString = `${data?.message || ""} ${text || ""}`;
    const isConstraintOrError =
      !res.ok ||
      messageString.toLowerCase().includes("prisma") ||
      messageString.toLowerCase().includes("foreign key") ||
      messageString.toLowerCase().includes("rental_order_items") ||
      messageString.toLowerCase().includes("constraint") ||
      messageString.toLowerCase().includes("invocation") ||
      data?.success === false;

    if (isConstraintOrError) {
      // Soft-archive via dedicated helper that sets status to OUT_OF_STOCK and stock to 0 in DB
      const archiveResult = await archiveGearAdmin(gearId);

      if (archiveResult.success) {
        try { revalidateTag("admin-gear", "max"); } catch { }
        try { revalidatePath("/admin-dashboard/gear"); } catch { }
        try { revalidatePath("/admin-dashboard"); } catch { }
        try { revalidatePath("/gear"); } catch { }
        return {
          success: true,
          isArchived: true,
          message: "Item has customer rental history; marked as OUT_OF_STOCK and archived.",
        };
      }

      return {
        success: false,
        isRented: true,
        message: "This gear item has customer rental history and cannot be permanently deleted. Mark it as OUT_OF_STOCK manually from the edit page.",
      };
    }

    try { revalidateTag("admin-gear", "max"); } catch { }
    try { revalidatePath("/admin-dashboard/gear"); } catch { }
    try { revalidatePath("/admin-dashboard"); } catch { }
    try { revalidatePath("/gear"); } catch { }

    return { success: true, message: data?.message || "Gear listing removed successfully." };
  } catch (error) {
    console.error("DELETE GEAR ADMIN ERROR:", error);
    return { success: false, message: "Failed to remove gear listing." };
  }
};

// Fetches all rental orders for admin moderation
export const getAllRentalsAdmin = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "You must be logged in as an Admin.", data: [] };
  }

  try {
    // 1. Try primary admin rentals endpoint: /api/admin/rentals
    const adminRes = await fetch(`${API_BASE_URL}/api/admin/rentals`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      next: { revalidate: 15, tags: ["admin-rentals"] },
    });

    if (adminRes.ok) {
      return await adminRes.json();
    }

    // 2. Fallback try /api/rentals
    const res = await fetch(`${API_BASE_URL}/api/rentals`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      next: { revalidate: 15, tags: ["admin-rentals"] },
    });

    if (res.ok) {
      return await res.json();
    }

    // 3. Fallback try /api/provider/orders
    const providerRes = await fetch(`${API_BASE_URL}/api/provider/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      next: { revalidate: 15, tags: ["admin-rentals"] },
    });

    if (providerRes.ok) {
      return await providerRes.json();
    }

    return { success: false, message: "Could not load rental orders.", data: [] };
  } catch (_error) {
    return { success: false, message: "Failed to connect to the server.", data: [] };
  }
};

