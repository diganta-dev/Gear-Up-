"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ShieldCheck, CreditCard, Loader2, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { IRental } from "@/types/rental";
import { initiatePayment } from "@/service/payments";
import { getValidImageUrl } from "@/lib/utils";

interface PaymentFormProps {
  rental: IRental;
}

export default function PaymentForm({ rental }: PaymentFormProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const gear = rental.gearItem;
  const isAlreadyPaid = rental.status === "PAID" || rental.paymentStatus === "PAID";

  const handlePayNow = async () => {
    if (isProcessing) return; // Duplicate payment prevention
    setIsProcessing(true);

    try {
      const response = await initiatePayment({ rentalId: rental.id });

      const paymentUrl = response.data?.paymentUrl || response.data?.url || response.data?.payment_url || response.data?.gatewayUrl;

      if (response.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`gearup_paid_${rental.id}`, "true");
          if (response.data?.id) {
            localStorage.setItem(`gearup_paid_tx_${response.data.id}`, "true");
          }
        }
        if (paymentUrl) {
          toast.success("Redirecting to secure payment gateway...");
          window.location.href = paymentUrl;
        } else {
          toast.success("Payment processed successfully!");
          router.push(`/payment/success?rentalId=${rental.id}`);
        }
      } else {
        toast.error(response.message || "Payment initiation failed. Please try again.");
        setIsProcessing(false);
      }
    } catch (_error) {
      toast.error("An unexpected error occurred during payment processing.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column: Order Summary */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <Card>
            <CardContent className="p-4 flex gap-4 items-center">
              {gear && (
                <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={getValidImageUrl(gear.images?.[0])}
                    alt={gear.name || "Gear Item"}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base line-clamp-1">{gear?.name || "Gear Item"}</h3>
                <p className="text-xs text-muted-foreground mb-2">{gear?.brand || "Brand"}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-normal">
                    Order #{rental.id.substring(0, 8)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Rental Details
          </h3>
          <Card>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium">
                  {new Date(rental.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date</span>
                <span className="font-medium">
                  {new Date(rental.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rental Status</span>
                <span className="font-medium capitalize">{rental.status.toLowerCase()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column: Payment Gateway CTA */}
      <div>
        <Card className="shadow-md border-primary/20">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Payment Details</CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Rental Total</span>
              <span className="font-medium">${rental.totalAmount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Processing Fee</span>
              <span className="font-medium text-emerald-600">Free</span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Amount Payable</span>
              <span className="font-bold text-2xl text-primary">${rental.totalAmount}</span>
            </div>

            {/* Provider indicators */}
            <div className="rounded-lg border bg-muted/20 p-3 mt-4 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground block">
                Supported Payment Gateways
              </span>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="px-2 py-1 bg-background border rounded text-slate-700 dark:text-slate-200">
                  💳 Credit / Debit Card
                </span>
                <span className="px-2 py-1 bg-background border rounded text-slate-700 dark:text-slate-200">
                  🔒 SSLCommerz / Stripe
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3 bg-muted/10 pt-4 rounded-b-xl border-t">
            {isAlreadyPaid ? (
              <div className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-500/10 text-emerald-600 rounded-lg font-medium text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>This order is already paid</span>
              </div>
            ) : (
              <Button
                className="w-full text-base py-6 font-semibold"
                size="lg"
                onClick={handlePayNow}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Redirecting to Gateway...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" /> Pay ${rental.totalAmount} Now
                  </>
                )}
              </Button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground text-center">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>You will be securely redirected to complete payment.</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
