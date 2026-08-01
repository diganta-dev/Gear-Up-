"use server";

import { cookies } from "next/headers";

const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://gearupshop.vercel.app";

export interface CreateReviewPayload {
  gearItemId: string;
  rating: number;
  comment: string;
  rentalOrderId?: string;
}

export const createReview = async (payload: CreateReviewPayload) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "You must be logged in to submit a review.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await res.text();
    try {
      const result = JSON.parse(text);
      return result;
    } catch {
      return {
        success: res.ok,
        message: text || "Review submitted successfully.",
      };
    }
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);
    return {
      success: false,
      message: "Failed to submit review. Please try again.",
    };
  }
};
