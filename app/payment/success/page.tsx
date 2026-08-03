import Link from "next/link";
import { Metadata } from "next";
import { CheckCircle2, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { revalidatePath, revalidateTag } from "next/cache";

import PaymentSuccessTracker from "@/components/shered/payment-success-tracker";
import { Suspense } from "react";
import { confirmPayment } from "@/service/payments";

export const metadata: Metadata = {
  title: "Payment Successful | GearUp",
  description: "Your payment was processed successfully.",
};

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PaymentSuccessPage(props: PageProps) {
  const resolvedSearchParams = props?.searchParams ? await props.searchParams : {};

  const transactionId = typeof resolvedSearchParams.transactionId === "string" 
    ? resolvedSearchParams.transactionId 
    : typeof resolvedSearchParams.tran_id === "string" 
      ? resolvedSearchParams.tran_id 
      : undefined;

  const rentalId = typeof resolvedSearchParams.rentalId === "string" 
    ? resolvedSearchParams.rentalId 
    : typeof resolvedSearchParams.orderId === "string"
      ? resolvedSearchParams.orderId
      : undefined;

  // ── Server-side: update the order status in the database immediately ──
  // This fires as soon as the payment gateway redirects the user back here.
  if (rentalId || transactionId) {
    await confirmPayment({ rentalId, transactionId, status: "PAID" });

    // Bust Next.js cache so dashboard and orders pages show fresh status
    try { revalidateTag("my-rentals", "max"); } catch { }
    try { revalidatePath("/dashboard/orders"); } catch { }
    try { revalidatePath("/dashboard"); } catch { }
    try { revalidateTag("admin-rentals", "max"); } catch { }
    try { revalidatePath("/admin-dashboard/orders"); } catch { }
    try { revalidatePath("/provider-dashboard/orders"); } catch { }
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
      <Suspense fallback={null}>
        <PaymentSuccessTracker />
      </Suspense>
      <Card className="max-w-md w-full text-center shadow-lg border-emerald-500/20">
        <CardHeader className="pt-8 pb-4">
          <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            Payment Successful!
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Thank you! Your rental order has been confirmed.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 text-sm py-4">
          <div className="rounded-lg bg-muted p-4 space-y-2 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Payment Status</span>
              <Badge className="bg-emerald-600">PAID</Badge>
            </div>
            {transactionId && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono font-medium break-all">{transactionId}</span>
              </div>
            )}
            {rentalId && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono font-medium">#{rentalId.substring(0, 8)}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            A confirmation has been recorded. You can view your rental status in your customer dashboard anytime.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 pb-8">
          <Button nativeButton={false} className="w-full" size="lg" render={<Link href="/dashboard" />}>
            <Package className="w-4 h-4 mr-2" /> Go to Dashboard
          </Button>
          <Button nativeButton={false} variant="outline" className="w-full" render={<Link href="/gear" />}>
            Browse More Gear <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
