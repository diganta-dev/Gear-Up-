import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gearupshop.vercel.app";

// ─── Stripe requires the raw body — disable Next.js body parsing ───
export const config = {
  api: { bodyParser: false },
};

async function updateOrderInBackend(rentalId: string, transactionId: string) {
  const endpoints = [
    {
      url: `${BACKEND_API_URL}/api/payments/confirm`,
      method: "POST",
      body: { rentalId, transactionId, status: "PAID", paymentStatus: "PAID" },
    },
    {
      url: `${BACKEND_API_URL}/api/provider/orders/${rentalId}`,
      method: "PATCH",
      body: { status: "CONFIRMED", paymentStatus: "PAID" },
    },
    {
      url: `${BACKEND_API_URL}/api/provider/orders/${rentalId}`,
      method: "PATCH",
      body: { status: "PAID", paymentStatus: "PAID" },
    },
    {
      url: `${BACKEND_API_URL}/api/rentals/${rentalId}`,
      method: "PATCH",
      body: { status: "CONFIRMED", paymentStatus: "PAID" },
    },
    {
      url: `${BACKEND_API_URL}/api/rentals/${rentalId}`,
      method: "PATCH",
      body: { status: "PAID", paymentStatus: "PAID" },
    },
    {
      url: `${BACKEND_API_URL}/api/rentals/${rentalId}/status`,
      method: "PATCH",
      body: { status: "PAID", paymentStatus: "PAID" },
    },
    {
      url: `${BACKEND_API_URL}/api/rentals/${rentalId}/status`,
      method: "PATCH",
      body: { status: "CONFIRMED", paymentStatus: "PAID" },
    },
    {
      url: `${BACKEND_API_URL}/api/payments/${rentalId}/status`,
      method: "PATCH",
      body: { status: "PAID", paymentStatus: "PAID" },
    },
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(endpoint.body),
        cache: "no-store",
      });

      if (res.ok) {
        console.log(`[Stripe Webhook] Order updated via: ${endpoint.url}`);
        return true;
      } else {
        console.warn(`[Stripe Webhook] ${endpoint.url} returned status ${res.status}`);
      }
    } catch (err) {
      // Try next endpoint
    }
  }

  console.error(`[Stripe Webhook] Failed to update order: ${rentalId}`);
  return false;
}

export async function POST(request: NextRequest) {
  // Stripe requires raw body to verify signature
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set!");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // ─── Handle payment events ───
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const rentalId =
        paymentIntent.metadata?.rentalId ||
        paymentIntent.metadata?.rental_id ||
        paymentIntent.metadata?.rentalOrder;

      console.log(
        `[Stripe Webhook] payment_intent.succeeded | rentalId: ${rentalId} | txn: ${paymentIntent.id}`
      );

      if (rentalId) {
        await updateOrderInBackend(rentalId, paymentIntent.id);
      } else {
        console.warn(
          "[Stripe Webhook] No rentalId in metadata — cannot update order."
        );
      }
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const rentalId =
        session.metadata?.rentalId ||
        session.metadata?.rental_id ||
        session.metadata?.rentalOrder ||
        session.client_reference_id;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || session.id;

      console.log(
        `[Stripe Webhook] checkout.session.completed | rentalId: ${rentalId} | session: ${session.id}`
      );

      if (rentalId) {
        await updateOrderInBackend(rentalId, paymentIntentId);
      } else {
        console.warn(
          "[Stripe Webhook] No rentalId in session metadata — cannot update order."
        );
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const rentalId =
        paymentIntent.metadata?.rentalId || paymentIntent.metadata?.rental_id;
      console.warn(
        `[Stripe Webhook] Payment failed | rentalId: ${rentalId} | reason: ${paymentIntent.last_payment_error?.message}`
      );
      break;
    }

    default:
      // Ignore other events
      break;
  }

  // Always return 200 so Stripe knows we received the event
  return NextResponse.json({ received: true }, { status: 200 });
}
