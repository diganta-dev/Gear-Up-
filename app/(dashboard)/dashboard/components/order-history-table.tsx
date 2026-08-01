"use client";

import Link from "next/link";
import { IRental } from "@/types/rental";
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

export default function OrderHistoryTable({ rentals }: OrderHistoryTableProps) {
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
            You haven't placed any rental orders yet.
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
          {rentals.map((rental) => (
            <div key={rental.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                    <Image 
                      src={getValidImageUrl(rental.gearItem?.images?.[0])}
                      alt={rental.gearItem?.name || "Gear"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium line-clamp-1">{rental.gearItem?.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatShortDate(rental.startDate)} - {formatDate(rental.endDate)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <RentalStatusBadge status={rental.status} />
                </div>
                <div className="flex flex-col items-end text-sm">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="font-semibold">${rental.totalAmount}</span>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                {rental.status === "CONFIRMED" && (
                  <Button nativeButton={false} size="sm" render={<Link href={`/dashboard/customer/orders/${rental.id}/pay`}>Pay Now</Link>} />
                )}
                {rental.status === "RETURNED" && (
                  <Button nativeButton={false} size="sm" variant="outline" render={<Link href={`/dashboard/customer/orders/${rental.id}/review`}>Leave Review</Link>} />
                )}
                <Button nativeButton={false} size="sm" variant="secondary" render={<Link href={`/dashboard/customer/orders/${rental.id}`}>Details</Link>} />
              </div>
            </div>
          ))}
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
              {rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted">
                        <Image 
                          src={getValidImageUrl(rental.gearItem?.images?.[0])}
                          alt={rental.gearItem?.name || "Gear"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium">{rental.gearItem?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{formatDate(rental.startDate)}</span>
                      <span className="text-muted-foreground text-xs">to {formatDate(rental.endDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RentalStatusBadge status={rental.status} />
                  </TableCell>
                  <TableCell className="font-medium">
                    ${rental.totalAmount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {rental.status === "CONFIRMED" && (
                        <Button nativeButton={false} size="sm" render={<Link href={`/dashboard/customer/orders/${rental.id}/pay`}>Pay Now</Link>} />
                      )}
                      {rental.status === "RETURNED" && (
                        <Button nativeButton={false} size="sm" variant="outline" render={<Link href={`/dashboard/customer/orders/${rental.id}/review`}>Review</Link>} />
                      )}
                      <Button nativeButton={false} size="sm" variant="ghost" render={<Link href={`/dashboard/customer/orders/${rental.id}`}>View</Link>} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
