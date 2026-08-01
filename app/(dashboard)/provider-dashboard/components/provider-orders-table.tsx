"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  XCircle,
  Search,
  Loader2,
  Calendar,
  User,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { updateProviderOrderStatus } from "@/service/rentals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RentalStatusBadge from "@/components/shered/rental-status-badge";
import { toast } from "sonner";

interface ProviderOrdersTableProps {
  initialRentals: any[];
}

const ITEMS_PER_PAGE = 6;

export default function ProviderOrdersTable({ initialRentals }: ProviderOrdersTableProps) {
  const [rentals, setRentals] = useState<any[]>(initialRentals);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string, label: string) => {
    setUpdatingId(id);
    try {
      const res = await updateProviderOrderStatus(id, newStatus);
      if (res && res.success !== false) {
        setRentals((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        toast.success(`Order marked as ${label}`);
      } else {
        toast.error(res?.message || "Failed to update order status.");
      }
    } catch {
      toast.error("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRentals = rentals.filter((order) => {
    // Backend may use: order.user OR order.customer
    const customerObj = order.user || order.customer || {};
    const customerName = customerObj.name || order.customerName || "";
    const customerEmail = customerObj.email || order.customerEmail || "";
    // Backend may use: order.gear OR order.gearItem
    const gearObj = order.gear || order.gearItem || {};
    const gearName = gearObj.name || order.gearName || "";
    const orderId = String(order.id || "");

    const matchesSearch =
      !searchQuery ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gearName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (order.status || "").toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRentals.length / ITEMS_PER_PAGE) || 1;
  const paginatedRentals = filteredRentals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Rental Orders Management
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Review incoming rental requests and update order statuses.
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customer or gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>

          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30 shrink-0"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLACED">Placed (Pending)</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PAID">Paid</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="RETURNED">Returned</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredRentals.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <ShoppingBag className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm font-medium">No rental orders found.</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your search or status filter."
                : "When customers rent your gear, incoming orders will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Info</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Gear Item</TableHead>
                    <TableHead>Rental Period</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRentals.map((order) => {
                    const status = (order.status || "PLACED").toUpperCase();
                    // Support both field naming conventions from backend
                    const customerObj = order.user || order.customer || {};
                    const customer = {
                      name: customerObj.name || order.customerName || "Customer",
                      email: customerObj.email || order.customerEmail || "",
                    };
                    const gearObj = order.gear || order.gearItem || {};
                    const gear = {
                      name: gearObj.name || order.gearName || "Equipment",
                    };

                    let startDateStr = "";
                    let endDateStr = "";
                    try {
                      if (order.startDate) startDateStr = new Date(order.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                      if (order.endDate) endDateStr = new Date(order.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    } catch {
                      startDateStr = order.startDate || "";
                      endDateStr = order.endDate || "";
                    }

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{String(order.id).slice(-6)}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="font-semibold text-sm line-clamp-1">{customer.name}</p>
                              {customer.email && (
                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="font-medium text-sm">
                          {gear.name}
                        </TableCell>

                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {startDateStr} - {endDateStr}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="font-bold text-sm">
                          ${order.totalAmount ?? order.totalPrice ?? 0}
                        </TableCell>

                        <TableCell>
                          <RentalStatusBadge status={status} />
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {updatingId === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            ) : (
                              <>
                                {status === "PLACED" && (
                                  <>
                                    <Button
                                      size="xs"
                                      variant="default"
                                      onClick={() => handleStatusUpdate(order.id, "CONFIRMED", "Confirmed")}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm
                                    </Button>
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                      onClick={() => handleStatusUpdate(order.id, "CANCELLED", "Cancelled")}
                                    >
                                      <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                                    </Button>
                                  </>
                                )}

                                {status === "CONFIRMED" && (
                                  <span className="text-xs text-muted-foreground italic">
                                    Awaiting payment
                                  </span>
                                )}

                                {status === "PAID" && (
                                  <Button
                                    size="xs"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => handleStatusUpdate(order.id, "PICKED_UP", "Picked Up")}
                                  >
                                    <PackageCheck className="w-3.5 h-3.5 mr-1" /> Mark Picked Up
                                  </Button>
                                )}

                                {status === "PICKED_UP" && (
                                  <Button
                                    size="xs"
                                    variant="secondary"
                                    onClick={() => handleStatusUpdate(order.id, "RETURNED", "Returned")}
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Mark Returned
                                  </Button>
                                )}

                                {(status === "RETURNED" || status === "CANCELLED") && (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </>
                            )}
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
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredRentals.length)}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredRentals.length)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{filteredRentals.length}</span> orders
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
