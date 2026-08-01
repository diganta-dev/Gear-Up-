import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft, AlertCircle, Calendar, Tag, ShieldCheck } from "lucide-react";

import { getRentalById } from "@/service/rentals";
import ReviewForm from "@/components/shered/review-form";
import RentalStatusBadge from "@/components/shered/rental-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getValidImageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Leave a Review | GearUp",
  description: "Share your feedback for your recent gear rental.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReviewPage(props: PageProps) {
  const params = await props.params;
  const { id } = params;

  const response = await getRentalById(id);

  if (!response?.success || !response.data) {
    notFound();
  }

  const rental = response.data;
  const gearItem = rental.gearItem || (rental.items && rental.items[0]?.gearItem);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateString));
  };

  // Eligibility check: Only returned orders can be reviewed
  const isEligible = rental.status === "RETURNED";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Navigation Header */}
      <div className="mb-6">
        <Button nativeButton={false} variant="ghost" size="sm" render={<Link href="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Link>} />
      </div>

      {!isEligible ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Ineligible for Review</CardTitle>
            <CardDescription>
              Reviews can only be submitted for completed rentals that have been marked as <strong>RETURNED</strong> by the equipment provider.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="p-3 bg-background rounded-lg border text-sm flex items-center justify-between">
              <span className="text-muted-foreground">Current Order Status</span>
              <RentalStatusBadge status={rental.status} />
            </div>
            <Button nativeButton={false} className="w-full" render={<Link href="/dashboard">Return to Dashboard</Link>} />
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Leave a Review</CardTitle>
                <CardDescription className="mt-1">
                  Help the community by rating your rental experience.
                </CardDescription>
              </div>
              <RentalStatusBadge status={rental.status} />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Gear Information Summary */}
            <div className="p-4 rounded-xl bg-muted/50 border flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-background shrink-0 border">
                <Image
                  src={getValidImageUrl(gearItem?.images?.[0])}
                  alt={gearItem?.name || "Gear"}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-semibold text-base line-clamp-1">{gearItem?.name || "Rental Equipment"}</h3>
                {gearItem?.brand && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Brand: {gearItem.brand}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> {formatDate(rental.startDate)} – {formatDate(rental.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> ${rental.totalAmount} Total
                  </span>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <ReviewForm
              gearItemId={gearItem?.id || rental.gearItemId || ""}
              rentalOrderId={rental.id}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
