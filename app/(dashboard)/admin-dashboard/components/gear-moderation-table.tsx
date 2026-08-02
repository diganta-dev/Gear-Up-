"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IGear } from "@/types/gear";
import { deleteGearAdmin, updateGearAvailabilityAdmin } from "@/service/admin";
import { toast } from "sonner";
import { getValidImageUrl } from "@/lib/utils";
import {
  Search,
  Package,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  Tag,
  DollarSign,
  Boxes,
  AlertTriangle,
  X,
  ExternalLink,
  Pencil,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GearModerationTableProps {
  initialGear: IGear[];
}

const ITEMS_PER_PAGE = 6;

export default function GearModerationTable({ initialGear }: GearModerationTableProps) {
  const [gearList, setGearList] = useState<IGear[]>(initialGear);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDeleteGear, setConfirmDeleteGear] = useState<IGear | null>(null);
  const [inspectedGear, setInspectedGear] = useState<IGear | null>(null);
  const [rentedAlertItem, setRentedAlertItem] = useState<IGear | null>(null);

  // Update gear availability status (Admin)
  const handleUpdateAvailability = async (id: string, newStatus: string) => {
    setTogglingId(id);
    try {
      const res = await updateGearAvailabilityAdmin(id, newStatus);
      if (res?.success !== false) {
        setGearList((prev) =>
          prev.map((g) => (g.id === id ? { ...g, availability: newStatus } : g))
        );
        toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      } else {
        // Fallback: try via client-side API route
        try {
          const apiRes = await fetch("/api/admin/archive-gear", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gearId: id, availability: newStatus }),
            credentials: "include",
          });
          const apiData = await apiRes.json();
          if (apiRes.ok && apiData.success) {
            setGearList((prev) =>
              prev.map((g) => (g.id === id ? { ...g, availability: newStatus } : g))
            );
            toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}.`);
          } else {
            toast.error(res?.message || "Failed to update status.");
          }
        } catch {
          toast.error(res?.message || "Failed to update status.");
        }
      }
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  // Extract unique categories for filter
  const categories = Array.from(
    new Set(gearList.map((g) => g.category?.name || "Uncategorized"))
  );

  // Filter gear items
  const filteredGear = gearList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || (item.category?.name || "Uncategorized") === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredGear.length / ITEMS_PER_PAGE) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGear = filteredGear.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handle Gear Removal
  const handleDeleteConfirm = async () => {
    if (!confirmDeleteGear) return;
    const targetGear = confirmDeleteGear;
    setDeletingId(targetGear.id);
    setConfirmDeleteGear(null);

    const res = await deleteGearAdmin(targetGear.id);
    setDeletingId(null);

    if (res?.success !== false) {
      if (res?.isArchived) {
        setGearList((prev) =>
          prev.map((g) =>
            g.id === targetGear.id ? { ...g, availability: "UNAVAILABLE", stock: 0, availableStock: 0 } : g
          )
        );
        setRentedAlertItem(targetGear);
        toast.warning(`Item "${targetGear.name}" has customer rental history; marked as UNAVAILABLE & archived.`, { duration: 6000 });
      } else {
        setGearList((prev) => prev.filter((g) => g.id !== targetGear.id));
        toast.success(`Listing "${targetGear.name}" removed successfully.`);
      }
    } else {
      if (res?.isRented) {
        // Server action archive failed — try via client-side API route (more reliable for auth)
        try {
          const archiveRes = await fetch("/api/admin/archive-gear", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gearId: targetGear.id }),
            credentials: "include",
          });
          const archiveData = await archiveRes.json();
          if (archiveRes.ok && archiveData.success) {
            setGearList((prev) =>
              prev.map((g) =>
                g.id === targetGear.id ? { ...g, availability: "UNAVAILABLE", stock: 0, availableStock: 0 } : g
              )
            );
            setRentedAlertItem(targetGear);
            toast.warning(`Item "${targetGear.name}" has customer rental history; marked as UNAVAILABLE & archived.`, { duration: 6000 });
            return;
          }
          console.warn("[archive fallback] Results:", archiveData?.results);
        } catch (e) {
          console.error("[archive fallback] fetch failed:", e);
        }
        setRentedAlertItem(targetGear);
        toast.error(res?.message || `Failed to remove "${targetGear.name}".`);
      } else {
        toast.error(res?.message || `Failed to remove "${targetGear.name}".`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search by title, brand, category or provider..."
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

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 px-3 text-xs font-semibold rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
          >
            <option value="ALL">All Categories ({gearList.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Showing {paginatedGear.length} of {filteredGear.length} Gear Listings
        </p>
      </div>

      {/* Gear List Table */}
      {paginatedGear.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
          <Package className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No Gear Listings Found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
            {searchQuery || selectedCategory !== "ALL"
              ? "No items match your active search and filter criteria."
              : "There are currently no gear items listed in the system."}
          </p>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-3.5 px-4">Gear Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Provider</th>
                  <th className="py-3.5 px-4">Rate / Day</th>
                  <th className="py-3.5 px-4 text-center">Stock</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedGear.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    {/* Item details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                          {item.images && item.images[0] ? (
                            <Image
                              src={getValidImageUrl(item.images[0])}
                              alt={item.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.brand || "Standard Brand"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        <Tag className="w-3 h-3 text-zinc-400" />
                        {item.category?.name || "Uncategorized"}
                      </span>
                    </td>

                    {/* Provider */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                          {item.provider?.name ? item.provider.name[0].toUpperCase() : "P"}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{item.provider?.name || "Unknown"}</p>
                          <p className="text-[11px] text-zinc-400">{item.provider?.email || "No email"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Daily Rental Price */}
                    <td className="py-3.5 px-4">
                      <span className="font-black text-zinc-900 dark:text-zinc-100">
                        ${item.dailyRentalPrice}
                      </span>
                      <span className="text-[11px] text-zinc-500"> / day</span>
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                        <Boxes className="w-3 h-3 text-zinc-400" />
                        {item.availableStock ?? item.stock} / {item.stock}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {togglingId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                        ) : (
                          <select
                            value={item.availability || "AVAILABLE"}
                            onChange={(e) => handleUpdateAvailability(item.id, e.target.value)}
                            disabled={togglingId === item.id}
                            className="h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-2xs focus:outline-hidden cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Change Gear Availability Status"
                          >
                          <option value="AVAILABLE">AVAILABLE</option>
                            <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                            <option value="MAINTENANCE">MAINTENANCE</option>
                          </select>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setInspectedGear(item)}
                          className="h-8 px-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                          Inspect
                        </Button>

                        <Link href={`/provider-dashboard/gear/${item.id}/edit`}>
                          <Button
                            size="xs"
                            variant="outline"
                            className="h-8 px-2.5 text-xs font-semibold text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                        </Link>

                        <Button
                          size="xs"
                          variant="destructive"
                          disabled={deletingId === item.id}
                          onClick={() => setConfirmDeleteGear(item)}
                          className="h-8 px-2.5 text-xs font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* MODAL 1: Inspect Gear Details */}
      {inspectedGear && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                  GEAR INSPECTION
                </span>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white mt-2">{inspectedGear.name}</h2>
                <p className="text-xs text-zinc-500">{inspectedGear.brand || "Brand Unspecified"}</p>
              </div>
              <button
                onClick={() => setInspectedGear(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Images Gallery */}
            {inspectedGear.images && inspectedGear.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {inspectedGear.images.map((img, idx) => (
                  <div key={idx} className="relative h-24 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <Image src={getValidImageUrl(img)} alt={`${inspectedGear.name} ${idx + 1}`} fill unoptimized className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Overview Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <p className="font-bold text-zinc-500 uppercase">Daily Rate</p>
                <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">${inspectedGear.dailyRentalPrice}</p>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <p className="font-bold text-zinc-500 uppercase">Stock Status</p>
                <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {inspectedGear.availableStock ?? inspectedGear.stock} Available
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-500 uppercase">Description</p>
              <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {inspectedGear.description || "No description provided for this gear listing."}
              </p>
            </div>

            {/* Provider Information */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <p className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Provider Details
              </p>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{inspectedGear.provider?.name || "Unknown Provider"}</p>
                  <p className="text-zinc-500">{inspectedGear.provider?.email || "No email"}</p>
                </div>
                {inspectedGear.provider?.phone && (
                  <span className="text-zinc-500 font-mono text-[11px]">{inspectedGear.provider.phone}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href={`/gear/${inspectedGear.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
              >
                View Public Page <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-2">
                <Link href={`/provider-dashboard/gear/${inspectedGear.id}/edit`}>
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Gear
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInspectedGear(null)}
                  className="h-8 px-4 text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Confirmation Dialog */}
      {confirmDeleteGear && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Remove Gear Listing?</h3>
                <p className="text-xs text-zinc-500">This moderation action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
              Are you sure you want to remove <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{confirmDeleteGear.name}</span>? The listing will be deleted from the platform.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteGear(null)}
                className="h-8 px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                className="h-8 px-4 text-xs font-bold"
              >
                Confirm Removal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Rented Item Alert Notice */}
      {rentedAlertItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Item Has Active / Past Rentals!</h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Customer Order History Protected</p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <p>
                Item <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">"{rentedAlertItem.name}"</span> cannot be permanently deleted because customers have rented this item.
              </p>
              <p className="font-medium text-amber-800 dark:text-amber-300">
                ⚠️ The item has been marked as <span className="font-bold underline">UNAVAILABLE</span> with 0 stock and archived from active listings to preserve customer rental records.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                onClick={() => setRentedAlertItem(null)}
                className="h-9 px-5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
              >
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
