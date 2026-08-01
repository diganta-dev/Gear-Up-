"use server";

import { cookies } from "next/headers";
import { IGear, IGearResponse } from "@/types/gear";

const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://gearupshop.vercel.app";

export interface CreateGearPayload {
  name: string;
  description: string;
  categoryId: string;
  brand: string;
  dailyRentalPrice: number;
  stock: number;
  images: string[];
  specifications?: Record<string, any> | null;
  availability?: string;
}

import { revalidatePath, revalidateTag } from "next/cache";

export const getProviderGear = async (): Promise<IGearResponse | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    // Attempt provider specific endpoint first
    const res = await fetch(`${API_BASE_URL}/api/gear/my-gear`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      next: { revalidate: 15, tags: ["provider-gear"] },
    });

    if (res.ok) {
      return await res.json();
    }

    // Fallback if my-gear endpoint doesn't exist
    const fallbackRes = await fetch(`${API_BASE_URL}/api/gear`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      next: { revalidate: 15, tags: ["provider-gear"] },
    });

    if (fallbackRes.ok) {
      return await fallbackRes.json();
    }
    return null;
  } catch (error) {
    console.error("GET PROVIDER GEAR ERROR:", error);
    return null;
  }
};

export const createProviderGear = async (payload: CreateGearPayload) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "You must be logged in as a provider to add gear.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/gear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (res.ok) {
      try { revalidatePath("/provider-dashboard"); } catch {}
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return {
        success: res.ok,
        message: text || "Gear created successfully.",
      };
    }
  } catch (error) {
    console.error("CREATE GEAR ERROR:", error);
    return {
      success: false,
      message: "Failed to create gear item. Please try again.",
    };
  }
};

export const updateProviderGear = async (id: string, payload: Partial<CreateGearPayload>) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "You must be logged in to update gear.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/gear/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (res.ok) {
      try { revalidatePath("/provider-dashboard"); } catch {}
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return {
        success: res.ok,
        message: text || "Gear updated successfully.",
      };
    }
  } catch (error) {
    console.error("UPDATE GEAR ERROR:", error);
    return {
      success: false,
      message: "Failed to update gear item. Please try again.",
    };
  }
};

export const deleteProviderGear = async (id: string) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "You must be logged in to delete gear.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/gear/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      try { revalidatePath("/provider-dashboard"); } catch {}
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return {
        success: res.ok,
        message: text || "Gear deleted successfully.",
      };
    }
  } catch (error) {
    console.error("DELETE GEAR ERROR:", error);
    return {
      success: false,
      message: "Failed to delete gear item. Please try again.",
    };
  }
};
