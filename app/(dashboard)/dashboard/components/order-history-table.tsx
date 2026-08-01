"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const ITEMS_PER_PAGE = 6;

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
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.ceil(rentals.length / ITEMS_PER_PAGE) || 1;
  const paginatedRentals = rentals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">My Rental Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4">
          {paginatedRentals.map((rental) => {
            const effectiveStatus = getEffectiveStatus(rental, localPaid);
            const gear = getGearFromRental(rental);
            const isPaidOrBeyond = ["PAID", "PICKED_UP", "RETURNED"].includes(effectiveStatus);
            const canPay = !isPaidOrBeyond && ["PLACED", "CONFIRMED"].includes(effectiveStatus);

            return (
              <div key={rental.id} className="p-4 border rounded-lg space-y-3 bg-card">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image 
                      src={getValidImageUrl(gear?.images?.[0])}
                      alt={gear?.name || "Gear"}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{gear?.name || "Unknown Gear"}</h4>
                    <p className="text-xs text-muted-foreground font-mono">#{rental.id.slice(-6)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-y py-2">
                  <div>
                    <span className="text-muted-foreground block">Period:</span>
                    <span className="font-medium">
                      {formatShortDate(rental.startDate)} - {formatShortDate(rental.endDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Total Amount:</span>
                    <span className="font-bold text-sm text-[#1b7a59]">${rental.totalAmount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <RentalStatusBadge status={effectiveStatus} />
                  <div className="flex gap-2">
                    {isPaidOrBeyond ? (
                      <Button size="sm" disabled variant="secondary" className="opacity-60 cursor-not-allowed text-xs h-8">
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
              {paginatedRentals.map((rental) => {
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

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t text-sm">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, rentals.length)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(currentPage * ITEMS_PER_PAGE, rentals.length)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{rentals.length}</span> orders
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="h-8 w-8 text-xs p-0"
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-2.5 text-xs"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
