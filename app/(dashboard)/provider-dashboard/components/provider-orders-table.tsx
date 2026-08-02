"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  Search,
  Loader2,
  Calendar,
  User,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import type { IProviderOrder, RentalStatus } from "@/types/rental";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import RentalStatusBadge from "@/components/shered/rental-status-badge";
import { EmptyState } from "@/components/shered/empty-state";

interface ProviderOrdersTableProps {
  initialOrders: IProviderOrder[];
}

interface PendingAction {
  id: string;
  newStatus: RentalStatus;
  label: string;
}

const STATUSES = ["ALL", "PLACED", "CONFIRMED", "PAID", "PICKED_UP", "RETURNED", "CANCELLED"] as const;
const ITEMS_PER_PAGE = 8;

const STATUS_LABELS: Record<RentalStatus, string> = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PAID: "Paid",
  PICKED_UP: "Picked Up",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
};

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Resolves customer/gear regardless of which field name the backend uses
function resolveCustomer(order: IProviderOrder) {
  const c = order.user ?? order.customer;
  return { name: c?.name ?? "Customer", email: c?.email ?? "" };
}

function resolveGear(order: IProviderOrder) {
  const g = order.gear ?? order.gearItem;
  return { name: g?.name ?? "Equipment" };
}

export default function ProviderOrdersTable({ initialOrders }: ProviderOrdersTableProps) {
  const router = useRouter();

  const [orders, setOrders] = useState<IProviderOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Sync state if initialOrders prop changes
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredOrders = orders.filter((order) => {
    const customer = resolveCustomer(order);
    const gear = resolveGear(order);
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      gear.name.toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" || order.status.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const executeStatusUpdate = async (action: PendingAction) => {
    // 1. Optimistically update UI immediately before network call
    const previousOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) => (o.id === action.id ? { ...o, status: action.newStatus } : o))
    );
    setUpdatingId(action.id);
    setPendingAction(null);

    const result = await updateProviderOrderStatus(action.id, action.newStatus);

    if (result.success === true) {
      toast.success(`Order marked as ${action.label}.`);
      // Sync the server component so the next hard reload is consistent
      router.refresh();
    } else {
      // Revert on failure
      setOrders(previousOrders);
      toast.error(result.message ?? "Failed to update order status.");
    }

    setUpdatingId(null);
  };

  const requestAction = (id: string, newStatus: RentalStatus, label: string) => {
    // Confirm before destructive or important status changes
    setPendingAction({ id, newStatus, label });
  };

  return (
    <>
      {/* Confirmation dialog for status changes */}
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open: boolean) => { if (!open) setPendingAction(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.newStatus === "CANCELLED"
                ? "Are you sure you want to cancel this order? This action cannot be undone."
                : `Mark this order as "${pendingAction?.label}"? This will update the order status for the customer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingAction && executeStatusUpdate(pendingAction)}
              className={
                pendingAction?.newStatus === "CANCELLED"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Rental Orders
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {orders.length} total order{orders.length !== 1 ? "s" : ""} for your gear
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search customer or gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm h-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30 shrink-0"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Statuses" : s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders found"
              description={
                searchQuery || statusFilter !== "ALL"
                  ? "Try adjusting your search or filter."
                  : "When customers rent your gear, their orders will appear here."
              }
              className="min-h-[280px]"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[90px]">Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Gear</TableHead>
                      <TableHead>Rental Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => {
                      const status = order.status.toUpperCase() as RentalStatus;
                      const customer = resolveCustomer(order);
                      const gear = resolveGear(order);
                      const isUpdating = updatingId === order.id;

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{order.id.slice(-6).toUpperCase()}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2 min-w-0">
                              <User className="w-4 h-4 text-muted-foreground shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{customer.name}</p>
                                {customer.email && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {customer.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="font-medium text-sm max-w-[160px] truncate">
                            {gear.name}
                          </TableCell>

                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {formatDate(order.startDate)} — {formatDate(order.endDate)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="font-semibold text-sm">
                            ${(order.totalAmount ?? 0).toLocaleString()}
                          </TableCell>

                          <TableCell>
                            <RentalStatusBadge status={status} />
                          </TableCell>

                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {isUpdating ? (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <>
                                  {/* PLACED → Confirm */}
                                  {status === "PLACED" && (
                                    <Button
                                      size="xs"
                                      variant="default"
                                      onClick={() =>
                                        requestAction(order.id, "CONFIRMED", "Confirmed")
                                      }
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                      Confirm
                                    </Button>
                                  )}

                                  {/* PAID → Mark Picked Up */}
                                  {status === "PAID" && (
                                    <Button
                                      size="xs"
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                      onClick={() =>
                                        requestAction(order.id, "PICKED_UP", "Picked Up")
                                      }
                                    >
                                      <PackageCheck className="w-3.5 h-3.5 mr-1" />
                                      Mark Picked Up
                                    </Button>
                                  )}

                                  {/* PICKED_UP → Mark Returned */}
                                  {status === "PICKED_UP" && (
                                    <Button
                                      size="xs"
                                      variant="secondary"
                                      onClick={() =>
                                        requestAction(order.id, "RETURNED", "Returned")
                                      }
                                    >
                                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                      Mark Returned
                                    </Button>
                                  )}

                                  {/* Direct Status Selector Dropdown */}
                                  <select
                                    value={pendingAction?.id === order.id ? pendingAction.newStatus : status}
                                    onChange={(e) => {
                                      const nextStatus = e.target.value as RentalStatus;
                                      if (nextStatus !== status) {
                                        const label = STATUS_LABELS[nextStatus] || nextStatus;
                                        requestAction(order.id, nextStatus, label);
                                      }
                                    }}
                                    disabled={isUpdating}
                                    className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-accent/50 transition-colors shrink-0"
                                    title="Change Order Status"
                                  >
                                    <option value="PLACED">Placed</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PAID">Paid</option>
                                    <option value="PICKED_UP">Picked Up</option>
                                    <option value="RETURNED">Returned</option>
                                    <option value="CANCELLED">Cancelled</option>
                                  </select>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t text-sm">
                  <p className="text-xs text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">{filteredOrders.length}</span>{" "}
                    orders
                  </p>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-2.5 text-xs"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-2.5 text-xs"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
