"use client";

import { useState } from "react";
import Image from "next/image";
import { IRental, RentalStatus } from "@/types/rental";
import RentalStatusBadge from "@/components/shered/rental-status-badge";
import { updateRentalStatus } from "@/service/rentals";
import { toast } from "sonner";
import {
  Search,
  ShoppingBag,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  DollarSign,
  Package,
  X,
  CreditCard,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminOrdersTableProps {
  initialRentals: IRental[];
}

const ITEMS_PER_PAGE = 6;

const RENTAL_STATUSES: { label: string; value: string }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Placed", value: "PLACED text-amber-600" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Paid", value: "PAID" },
  { label: "Picked Up", value: "PICKED_UP" },
  { label: "Returned", value: "RETURNED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function AdminOrdersTable({ initialRentals }: AdminOrdersTableProps) {
  const [rentals, setRentals] = useState<IRental[]>(initialRentals);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [inspectedOrder, setInspectedOrder] = useState<IRental | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmCancelOrder, setConfirmCancelOrder] = useState<IRental | null>(null);

  // Filter rentals
  const filteredRentals = rentals.filter((order) => {
    const gearTitle = order.gearItem?.name || order.items?.[0]?.gearItem?.name || "";
    const customerName = order.customer?.name || "";
    const customerEmail = order.customer?.email || "";
    const providerName = order.gearItem?.provider?.name || "";

    const matchesSearch =
      gearTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" || (order.status || "").toUpperCase() === selectedStatus.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRentals.length / ITEMS_PER_PAGE) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRentals = filteredRentals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Format dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle Order Cancel by Admin
  const handleCancelConfirm = async () => {
    if (!confirmCancelOrder) return;
    const targetOrder = confirmCancelOrder;
    setUpdatingId(targetOrder.id);
    setConfirmCancelOrder(null);

    const res = await updateRentalStatus(targetOrder.id, "CANCELLED");
    setUpdatingId(null);

    if (res?.success !== false) {
      setRentals((prev) =>
        prev.map((r) => (r.id === targetOrder.id ? { ...r, status: "CANCELLED" as RentalStatus } : r))
      );
      toast.success(`Order #${targetOrder.id.slice(-6)} cancelled successfully.`);
    } else {
      toast.error(res?.message || "Failed to cancel order.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search by order ID, gear name, customer, or provider..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 px-3 text-xs font-semibold rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
          >
            {RENTAL_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Showing {paginatedRentals.length} of {filteredRentals.length} System Orders
        </p>
      </div>

      {/* Orders Table */}
      {paginatedRentals.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
          <ShoppingBag className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No Rental Orders Found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
            {searchQuery || selectedStatus !== "ALL"
              ? "No orders match your active search and filter criteria."
              : "There are currently no rental orders placed in the system."}
          </p>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-3.5 px-4">Order & Item</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Rental Period</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedRentals.map((order) => {
                  const gear = order.gearItem || order.items?.[0]?.gearItem;

                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      {/* Order ID & Gear Item */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                            {gear?.images?.[0] ? (
                              <Image src={gear.images[0]} alt={gear.name || "Gear"} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              #{order.id.slice(-6)}
                            </p>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 line-clamp-1">
                              {gear?.name || "Rental Package"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {order.customer?.name || "Customer"}
                          </p>
                          <p className="text-[11px] text-zinc-400">{order.customer?.email || "N/A"}</p>
                        </div>
                      </td>

                      {/* Rental Period */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs space-y-0.5 text-zinc-600 dark:text-zinc-300">
                          <p>{formatDate(order.startDate)}</p>
                          <p className="text-[11px] text-zinc-400 font-mono">to {formatDate(order.endDate)}</p>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <RentalStatusBadge status={order.status} />
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-black text-zinc-900 dark:text-zinc-100">${order.totalAmount}</span>
                        <p className="text-[10px] uppercase font-bold text-zinc-400">{order.paymentStatus || "UNPAID"}</p>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setInspectedOrder(order)}
                            className="h-8 px-2.5 text-xs font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                            Details
                          </Button>

                          {order.status !== "CANCELLED" && order.status !== "RETURNED" && (
                            <Button
                              size="xs"
                              variant="destructive"
                              disabled={updatingId === order.id}
                              onClick={() => setConfirmCancelOrder(order)}
                              className="h-8 px-2 text-xs"
                            >
                              <Ban className="w-3.5 h-3.5 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-zinc-500">
            Page <span className="font-bold text-zinc-900 dark:text-zinc-100">{validCurrentPage}</span> of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 text-xs"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-3 text-xs"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* MODAL 1: Inspect Order Details */}
      {inspectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                  ORDER #{inspectedOrder.id.slice(-8)}
                </span>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white mt-2">Rental Order Details</h2>
                <p className="text-xs text-zinc-500">Created on {formatDate(inspectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setInspectedOrder(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Payment Overview */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <p className="font-bold text-zinc-500 uppercase">Rental Status</p>
                <RentalStatusBadge status={inspectedOrder.status} />
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <p className="font-bold text-zinc-500 uppercase">Total Amount</p>
                <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">${inspectedOrder.totalAmount}</p>
              </div>
            </div>

            {/* Customer & Provider Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <p className="font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" /> Customer Information
                </p>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{inspectedOrder.customer?.name || "Customer"}</p>
                <p className="text-zinc-500 text-[11px]">{inspectedOrder.customer?.email || "No email"}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <p className="font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-zinc-400" /> Provider Information
                </p>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {inspectedOrder.gearItem?.provider?.name || "Provider"}
                </p>
                <p className="text-zinc-500 text-[11px]">{inspectedOrder.gearItem?.provider?.email || "No email"}</p>
              </div>
            </div>

            {/* Rental Timeline */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
              <p className="font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Rental Schedule
              </p>
              <div className="flex items-center justify-between font-mono">
                <div>
                  <p className="text-zinc-400 text-[10px]">START DATE</p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{formatDate(inspectedOrder.startDate)}</p>
                </div>
                <div className="text-center font-sans text-[11px] font-bold text-zinc-400">➜</div>
                <div>
                  <p className="text-zinc-400 text-[10px]">END DATE</p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{formatDate(inspectedOrder.endDate)}</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectedOrder(null)}
                className="h-8 px-4 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Cancel Confirmation Dialog */}
      {confirmCancelOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Cancel Rental Order?</h3>
                <p className="text-xs text-zinc-500">This action will change the order status to CANCELLED.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
              Are you sure you want to cancel order <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">#{confirmCancelOrder.id.slice(-8)}</span>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmCancelOrder(null)}
                className="h-8 px-3 text-xs"
              >
                Go Back
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelConfirm}
                className="h-8 px-4 text-xs font-bold"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
