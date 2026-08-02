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
      revalidateTag("admin-users");
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
      revalidateTag("admin-users");
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

// Deletes a gear listing by Admin
export const deleteGearAdmin = async (gearId: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { success: false, message: "You must be logged in as an Admin." };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/gear/${gearId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      cache: "no-store",
    });

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: res.ok, message: text || "Gear listing removed successfully." };
    }
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

