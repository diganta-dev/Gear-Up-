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
      // Pass rentalId in successUrl so the gateway redirects with it — lets us update DB on return
      successUrl: `${frontendBaseUrl}/payment/success?rentalId=${payload.rentalId}`,
      cancelUrl: `${frontendBaseUrl}/payment/cancel?rentalId=${payload.rentalId}`,
      failUrl: `${frontendBaseUrl}/payment/cancel?rentalId=${payload.rentalId}`,
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

// Called from the /payment/success page after the gateway redirects back.
// Notifies the backend that payment succeeded so it can update the order status.
export const confirmPayment = async (payload: {
  rentalId?: string;
  transactionId?: string;
  status?: string;
}) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(accessToken ? { Cookie: `accessToken=${accessToken}`, Authorization: `Bearer ${accessToken}` } : {}),
  };

  const status = payload.status || "PAID";

  // Try multiple possible backend endpoints to confirm payment
  const endpoints = [
    // Dedicated payment confirm endpoint
    ...(payload.transactionId ? [{
      url: `${API_BASE_URL}/api/payments/confirm`,
      method: "POST",
      body: { transactionId: payload.transactionId, status, rentalId: payload.rentalId },
    }] : []),
    ...(payload.rentalId ? [
      // Update payment status on the rental
      {
        url: `${API_BASE_URL}/api/payments/${payload.rentalId}/status`,
        method: "PATCH",
        body: { status, paymentStatus: status },
      },
      // Update rental order status
      {
        url: `${API_BASE_URL}/api/rentals/${payload.rentalId}`,
        method: "PATCH",
        body: { status, paymentStatus: status },
      },
      {
        url: `${API_BASE_URL}/api/rentals/${payload.rentalId}/status`,
        method: "PATCH",
        body: { status, paymentStatus: status },
      },
    ] : []),
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: authHeaders,
        body: JSON.stringify(endpoint.body),
        cache: "no-store",
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await res.json();
          return { success: json.success ?? true, message: json.message ?? "Payment confirmed." };
        }
        return { success: true, message: "Payment confirmed." };
      }
    } catch (_err) {
      // Try next endpoint
    }
  }

  // All endpoints failed — return partial success so UI still shows success page
  // (Backend webhook may already have handled the confirmation)
  return { success: false, message: "Could not confirm payment via API — gateway webhook may handle this." };
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
