"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IRental, RentalStatus } from "@/types/rental";
import RentalStatusBadge from "@/components/shered/rental-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getValidImageUrl } from "@/lib/utils";
import Image from "next/image";

interface OrderHistoryTableProps {
  rentals: IRental[];
}

/**
 * Compute the effective rental status:
 * 1. Checks backend `status`
 * 2. Checks backend `payment` object status
 * 3. Checks `localPaid` state (essential for local dev where SSLCommerz IPN can't reach localhost)
 */
function getEffectiveStatus(rental: IRental, localPaid: Record<string, boolean>): RentalStatus {
  const backendStatus = rental.status;

  // 1. If backend already updated to PAID or beyond, trust it
  if (["PAID", "PICKED_UP", "RETURNED", "CANCELLED"].includes(backendStatus)) {
    return backendStatus;
  }

  // 2. Check local tracking (via rental ID or payment ID)
  if (localPaid[rental.id] || (rental.payment?.id && localPaid[rental.payment.id])) {
    return "PAID";
  }

  // 3. Check payment object status from backend
  if (rental.payment) {
    const paymentStatus = (rental.payment.status || "").toUpperCase();
    if (["PAID", "COMPLETED", "SUCCESS", "VALID", "VALIDATED"].includes(paymentStatus)) {
      return "PAID";
    }
  }

  // 4. Check paymentStatus field if present
  const rentalPaymentStatus = (rental.paymentStatus || "").toUpperCase();
  if (["PAID", "COMPLETED", "SUCCESS"].includes(rentalPaymentStatus)) {
    return "PAID";
  }

  return backendStatus;
}

/** Get the first gear item — backend returns items[] array, not direct gearItem */
function getGearFromRental(rental: IRental) {
  if (rental.gearItem) return rental.gearItem;
  if (rental.items && rental.items.length > 0) {
    return rental.items[0]?.gearItem || null;
  }
  return null;
}

export default function OrderHistoryTable({ rentals }: OrderHistoryTableProps) {
  const [localPaid, setLocalPaid] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const paidMap: Record<string, boolean> = {};
    if (typeof window !== "undefined") {
      rentals.forEach((r) => {
        // Check by rental ID
        if (localStorage.getItem(`gearup_paid_${r.id}`) === "true") {
          paidMap[r.id] = true;
        }
        // Check by payment transaction ID
        if (r.payment?.id && localStorage.getItem(`gearup_paid_tx_${r.payment.id}`) === "true") {
          paidMap[r.payment.id] = true;
          paidMap[r.id] = true;
        }
      });
      // Check latest transaction URL fallback
      const latestTx = localStorage.getItem("gearup_latest_paid_tx");
      if (latestTx) {
        rentals.forEach((r) => {
          if (r.payment?.id === latestTx) {
            paidMap[r.id] = true;
          }
        });
      }
    }
    setLocalPaid(paidMap);
  }, [rentals]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateString));
  };
  
  const formatShortDate = (dateString: string) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(dateString));
  };

  if (!rentals || rentals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">📦</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground mb-6">
            You haven&apos;t placed any rental orders yet.
          </p>
          <Button nativeButton={false} render={<Link href="/gear">Browse Gear</Link>} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4">
          {rentals.map((rental) => {
            const effectiveStatus = getEffectiveStatus(rental, localPaid);
            const gear = getGearFromRental(rental);
            const isPaidOrBeyond = ["PAID", "PICKED_UP", "RETURNED"].includes(effectiveStatus);
            const canPay = !isPaidOrBeyond && ["PLACED", "CONFIRMED"].includes(effectiveStatus);

            return (
              <div key={rental.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                      <Image 
                        src={getValidImageUrl(gear?.images?.[0])}
                        alt={gear?.name || "Gear"}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium line-clamp-1">{gear?.name || "Unknown Gear"}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatShortDate(rental.startDate)} - {formatDate(rental.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <RentalStatusBadge status={effectiveStatus} />
                  </div>
                  <div className="flex flex-col items-end text-sm">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="font-semibold">${rental.totalAmount}</span>
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  {isPaidOrBeyond ? (
                    <Button size="sm" disabled variant="secondary" className="opacity-60 cursor-not-allowed">
                      Paid ✓
                    </Button>
                  ) : canPay ? (
                    <Button nativeButton={false} size="sm" render={<Link href={`/dashboard/customer/orders/${rental.id}/pay`}>Pay Now</Link>} />
                  ) : null}
                  {effectiveStatus === "RETURNED" && (
                    <Button nativeButton={false} size="sm" variant="outline" render={<Link href={`/dashboard/customer/orders/${rental.id}/review`}>Leave Review</Link>} />
                  )}
                  <Button nativeButton={false} size="sm" variant="secondary" render={<Link href={`/dashboard/customer/orders/${rental.id}`}>Details</Link>} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gear</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((rental) => {
                const effectiveStatus = getEffectiveStatus(rental, localPaid);
                const gear = getGearFromRental(rental);
                const isPaidOrBeyond = ["PAID", "PICKED_UP", "RETURNED"].includes(effectiveStatus);
                const canPay = !isPaidOrBeyond && ["PLACED", "CONFIRMED"].includes(effectiveStatus);

                return (
                  <TableRow key={rental.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted">
                          <Image 
                            src={getValidImageUrl(gear?.images?.[0])}
                            alt={gear?.name || "Gear"}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <span className="font-medium">{gear?.name || "Unknown Gear"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{formatDate(rental.startDate)}</span>
                        <span className="text-muted-foreground text-xs">to {formatDate(rental.endDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RentalStatusBadge status={effectiveStatus} />
                    </TableCell>
                    <TableCell className="font-medium">
                      ${rental.totalAmount}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {isPaidOrBeyond ? (
                          <Button size="sm" disabled variant="secondary" className="opacity-60 cursor-not-allowed">
                            Paid ✓
                          </Button>
                        ) : canPay ? (
                          <Button nativeButton={false} size="sm" render={<Link href={`/dashboard/customer/orders/${rental.id}/pay`}>Pay Now</Link>} />
                        ) : null}
                        {effectiveStatus === "RETURNED" && (
                          <Button nativeButton={false} size="sm" variant="outline" render={<Link href={`/dashboard/customer/orders/${rental.id}/review`}>Review</Link>} />
                        )}
                        <Button nativeButton={false} size="sm" variant="ghost" render={<Link href={`/dashboard/customer/orders/${rental.id}`}>View</Link>} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
