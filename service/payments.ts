"use server";

import { cookies } from "next/headers";
import { headers } from "next/headers";

const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://gearupshop.vercel.app";

interface InitiatePaymentPayload {
  rentalId: string;
}

export const initiatePayment = async (payload: InitiatePaymentPayload) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "You must be logged in to process payments.",
    };
  }

  // Dynamically resolve the frontend base URL so the payment gateway
  // redirects back to our app (not hardcoded localhost:5000)
  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") || "http";
  const frontendBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || `${protocol}://${host}`;

  try {
    const bodyData = {
      rentalOrder: payload.rentalId,
      rentalId: payload.rentalId,
      rentalOrderId: payload.rentalId,
      // Pass our frontend URLs so the gateway redirects correctly
      successUrl: `${frontendBaseUrl}/payment/success`,
      cancelUrl: `${frontendBaseUrl}/payment/cancel`,
      failUrl: `${frontendBaseUrl}/payment/cancel`,
    };

    const res = await fetch(`${API_BASE_URL}/api/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      body: JSON.stringify(bodyData),
      cache: "no-store",
    });

    const text = await res.text();

    try {
      const result = JSON.parse(text);
      return result;
    } catch (_jsonErr) {
      return {
        success: false,
        message: `Backend returned status ${res.status}: ${text.substring(0, 100)}`,
      };
    }
  } catch (error) {
    console.error("INITIATE PAYMENT ERROR:", error);
    return {
      success: false,
      message: "Failed to connect to the payment gateway. Please try again.",
    };
  }
};

export const getMyPayments = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      success: false,
      message: "You must be logged in to view payments.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/payments`, {
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
      message: "Failed to fetch payments. Please try again.",
    };
  }
};
