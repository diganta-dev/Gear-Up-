"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";

const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://gearupshop.vercel.app";

interface CreateRentalPayload {
  gearId: string;
  startDate: string;
  endDate: string;
}

export const createRental = async (payload: CreateRentalPayload) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "You must be logged in to place a rental.",
    };
  }

  try {
    const requestBody = {
      startDate: new Date(payload.startDate).toISOString(),
      endDate: new Date(payload.endDate).toISOString(),
      items: [{ gearItemId: payload.gearId, quantity: 1 }],
    };

    console.log("CREATE RENTAL REQUEST:", JSON.stringify(requestBody, null, 2));

    const res = await fetch(`${API_BASE_URL}/api/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    const result = await res.json();
    console.log("CREATE RENTAL RESPONSE:", JSON.stringify(result, null, 2));

    // Immediately bust cache so the new order appears in the orders table
    if (res.ok) {
      try { revalidateTag("my-rentals", "max"); } catch {}
      try { revalidatePath("/dashboard/orders"); } catch {}
      try { revalidatePath("/dashboard"); } catch {}
      try { revalidateTag("admin-rentals", "max"); } catch {}
      try { revalidatePath("/admin-dashboard/orders"); } catch {}
      try { revalidatePath("/provider-dashboard/orders"); } catch {}
    }

    return result;
  } catch (_error) {
    return {
      success: false,
      message: "Failed to connect to the server. Please try again.",
    };
  }
};
