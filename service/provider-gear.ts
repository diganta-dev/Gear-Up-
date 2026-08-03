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
import { getMe } from "@/service/getme";

export const getProviderGear = async (): Promise<IGearResponse | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    // Get current user to find their provider ID
    const meRes = await getMe();
    const user = meRes?.data?.user || meRes?.data;
    const providerId = user?.id;

    // Fetch only this provider's gear using providerId query param
    const url = providerId
      ? `${API_BASE_URL}/api/gear?providerId=${providerId}`
      : `${API_BASE_URL}/api/gear`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      return await res.json();
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
        Authorization: accessToken,
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (res.ok) {
      try { revalidatePath("/provider-dashboard"); } catch { }
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
        Authorization: accessToken,
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (res.ok) {
      try { revalidatePath("/provider-dashboard"); } catch { }
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
        Authorization: accessToken,
        authorization: `Bearer ${accessToken}`,
      },
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
      // Try OUT_OF_STOCK first (providers usually have permission), then UNAVAILABLE (admin-level)
      const archivePayloads = [
        { availability: "OUT_OF_STOCK", stock: 0, availableStock: 0 },
        { availability: "UNAVAILABLE", stock: 0, availableStock: 0 },
      ];

      for (const payload of archivePayloads) {
        const archiveRes = await fetch(`${API_BASE_URL}/api/gear/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `accessToken=${accessToken}`,
            Authorization: accessToken,
            authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        });

        const archiveText = await archiveRes.text();

        if (archiveRes.ok) {
          try { revalidatePath("/provider-dashboard"); } catch { }
          try { revalidatePath("/provider-dashboard/inventory"); } catch { }
          try { revalidatePath("/gear"); } catch { }
          return {
            success: true,
            isArchived: true,
            archivedAs: payload.availability,
            message: `Item has rental history; marked as ${payload.availability} and archived.`,
          };
        }
      }
    }

    if (res.ok) {
      try { revalidatePath("/provider-dashboard"); } catch { }
    }

    return {
      success: res.ok,
      message: data?.message || (res.ok ? "Gear deleted successfully." : "Failed to delete gear."),
    };
  } catch (error) {
    console.error("DELETE GEAR ERROR:", error);
    return {
      success: false,
      message: "Failed to delete gear item. Please try again.",
    };
  }
};
