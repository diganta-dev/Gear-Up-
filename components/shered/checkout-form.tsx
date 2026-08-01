"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { CalendarDays, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IGear } from "@/types/gear";
import { createRental } from "@/service/rental";
import { getValidImageUrl } from "@/lib/utils";

interface CheckoutFormProps {
  gear: IGear;
  startDate: string;
  endDate: string;
  days: number;
  totalPrice: number;
}

export default function CheckoutForm({ gear, startDate, endDate, days, totalPrice }: CheckoutFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await createRental({
        gearId: gear.id,
        startDate,
        endDate,
      });

      if (response.success) {
        toast.success("Rental order placed successfully!");
        const newRentalId = response.data?.id || response.data?.rentalId;
        
        if (newRentalId) {
          router.push(`/dashboard/customer/orders/${newRentalId}/pay`);
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(response.message || "Failed to place rental order");
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column: Gear Details */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Rental Summary</h2>
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
              <div className="relative h-24 w-24 shrink-0 rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={getValidImageUrl(gear.images?.[0])}
                  alt={gear.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm text-muted-foreground mb-1">{gear.category?.name}</p>
                <h3 className="font-semibold text-lg line-clamp-1">{gear.name}</h3>
                <p className="text-sm text-muted-foreground">{gear.brand}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Rental Period</h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Pick Up</span>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="font-medium">{formatDate(startDate)}</span>
                  </div>
                </div>
                
                <div className="h-px w-full sm:w-16 sm:h-px bg-border my-2 sm:my-0 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground font-medium">
                    {days} {days === 1 ? 'day' : 'days'}
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Return</span>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="font-medium">{formatDate(endDate)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column: Price Details & Action */}
      <div>
        <Card className="sticky top-24 shadow-md border-primary/20">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-xl">Price Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">${gear.dailyRentalPrice} × {days} {days === 1 ? 'day' : 'days'}</span>
              <span className="font-medium">${totalPrice}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Service Fee</span>
              <span className="font-medium">$0.00</span>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl text-primary">${totalPrice}</span>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 bg-muted/10 pt-4 rounded-b-xl border-t mt-4">
            <Button 
              className="w-full text-base py-6 font-semibold" 
              size="lg"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Order...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" /> Confirm Rental
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground px-4">
              By clicking "Confirm Rental", you agree to the GearUp terms of service and cancellation policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
