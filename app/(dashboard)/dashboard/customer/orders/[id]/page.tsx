import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CreditCard, Star, ShieldCheck, Calendar, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getRentalById } from "@/service/rentals";
import { getValidImageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rental Details | GearUp",
  description: "View details of your gear rental order.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailsPage(props: PageProps) {
  const params = await props.params;

  const res = await getRentalById(params.id);
  const rawData = res?.data;
  const rental = rawData?.result || rawData?.rental || rawData?.data || (rawData?.id ? rawData : null);

  if (!res?.success && res?.message?.includes("logged in")) {
    redirect("/login");
  }

  if (!rental) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center space-y-4">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto text-2xl">
          📦
        </div>
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-sm text-muted-foreground">
          We could not find the details for order <span className="font-mono">#{params.id.substring(0, 8)}</span>. It may belong to another account or have been removed.
        </p>
        <Button nativeButton={false} className="w-full" render={<Link href="/dashboard/orders"><ArrowLeft className="w-4 h-4 mr-2" /> View My Orders</Link>} />
      </div>
    );
  }

  const gear = rental.gearItem || rental.gear;
  const isPaid = rental.status === "PAID" || rental.paymentStatus === "PAID" || rental.status === "CONFIRMED";
  const isCompleted = rental.status === "RETURNED";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button nativeButton={false} variant="outline" size="sm" render={<Link href="/dashboard/orders"><ArrowLeft className="w-4 h-4 mr-1" /> Back to My Orders</Link>} />
        <Badge className={isPaid ? "bg-emerald-600" : "bg-amber-600"}>
          {rental.status || "PLACED"}
        </Badge>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order #{rental.id.substring(0, 8)}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Placed on {new Date(rental.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Rented Equipment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {gear && (
              <div className="flex gap-4 items-center p-4 bg-muted/40 rounded-xl border">
                <div className="relative h-24 w-24 shrink-0 rounded-lg overflow-hidden border bg-background">
                  <Image
                    src={getValidImageUrl(gear.images?.[0])}
                    alt={gear.name || "Gear Item"}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg line-clamp-1">{gear.name || "Equipment"}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{gear.brand || "Gear Item"}</p>
                  <Button nativeButton={false} variant="link" size="sm" className="px-0 h-auto text-xs" render={<Link href={`/gear/${gear.id}`}>View Item Specifications →</Link>} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted/20 rounded-lg border space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Start Date
                </span>
                <span className="font-semibold block">
                  {new Date(rental.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="p-3 bg-muted/20 rounded-lg border space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> End Date
                </span>
                <span className="font-semibold block">
                  {new Date(rental.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary & Actions */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rental Status</span>
                <Badge variant={isPaid ? "default" : "secondary"}>
                  {rental.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Status</span>
                <span className={`font-semibold ${isPaid ? "text-emerald-600" : "text-amber-600"}`}>
                  {rental.paymentStatus || (isPaid ? "PAID" : "UNPAID")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-base font-bold">
                <span>Total Amount</span>
                <span className="text-primary">${rental.totalAmount}</span>
              </div>
            </CardContent>
          </div>

          <CardFooter className="flex flex-col gap-2 pt-4 border-t bg-muted/10">
            {!isPaid && (
              <Button nativeButton={false} className="w-full" size="lg" render={<Link href={`/dashboard/customer/orders/${rental.id}/pay`} />}>
                <CreditCard className="w-4 h-4 mr-2" /> Pay ${rental.totalAmount} Now
              </Button>
            )}
            {isPaid && (
              <div className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-500/10 text-emerald-600 rounded-lg font-medium text-xs">
                <ShieldCheck className="w-4 h-4" /> Payment Confirmed
              </div>
            )}
            {isCompleted && (
              <Button nativeButton={false} variant="outline" className="w-full" size="sm" render={<Link href={`/dashboard/customer/orders/${rental.id}/review`} />}>
                <Star className="w-4 h-4 mr-2 text-amber-500" /> Leave a Review
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
