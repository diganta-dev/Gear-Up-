"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit2, Trash2, Plus, Search, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

import { IGear } from "@/types/gear";
import { deleteProviderGear, updateProviderGear } from "@/service/provider-gear";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";

interface InventoryTableProps {
  initialGear: IGear[];
}

const ITEMS_PER_PAGE = 6;

export default function InventoryTable({ initialGear }: InventoryTableProps) {
  const [gearList, setGearList] = useState<IGear[]>(initialGear);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rentedAlertItem, setRentedAlertItem] = useState<IGear | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredGear = gearList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.category?.name && item.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredGear.length / ITEMS_PER_PAGE) || 1;
  const paginatedGear = filteredGear.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleUpdateAvailability = async (id: string, newStatus: string) => {
    setTogglingId(id);
    try {
      const response = await updateProviderGear(id, { availability: newStatus });
      if (response && response.success !== false) {
        setGearList((prev) => prev.map((g) => (g.id === id ? { ...g, availability: newStatus } : g)));
        toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      } else {
        toast.error(response?.message || "Failed to update availability.");
      }
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    const targetGear = gearList.find((g) => g.id === id);
    setDeletingId(id);
    try {
      const response = await deleteProviderGear(id);

      // Case 1: Hard delete succeeded — remove from list
      if (response && response.success !== false && !response.isArchived) {
        setGearList((prev) => prev.filter((g) => g.id !== id));
        toast.success("Gear item deleted successfully.");
        return;
      }

      // Case 2: Soft-archive succeeded on server — keep item, update its status
      if (response && response.success !== false && response.isArchived) {
        const archivedAs = response.archivedAs || "OUT_OF_STOCK";
        setGearList((prev) =>
          prev.map((g) =>
            g.id === id ? { ...g, availability: archivedAs, stock: 0, availableStock: 0 } : g
          )
        );
        if (targetGear) setRentedAlertItem(targetGear);
        toast.warning(
          `"${targetGear?.name}" has rental history — marked as ${archivedAs.replace(/_/g, " ")} and archived.`,
          { duration: 6000 }
        );
        return;
      }

      // Case 3: Server action archive failed — try client-side API route fallback
      if (targetGear) {
        try {
          const archiveRes = await fetch("/api/provider/archive-gear", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gearId: id }),
            credentials: "include",
          });
          const archiveData = await archiveRes.json();

          if (archiveRes.ok && archiveData.success) {
            const newAvailability = archiveData.archivedAs || "OUT_OF_STOCK";
            // Keep item in list, update its status
            setGearList((prev) =>
              prev.map((g) =>
                g.id === id ? { ...g, availability: newAvailability, stock: 0, availableStock: 0 } : g
              )
            );
            setRentedAlertItem(targetGear);
            toast.warning(
              `"${targetGear.name}" has rental history — marked as ${newAvailability.replace(/_/g, " ")} and archived.`,
              { duration: 6000 }
            );
            return;
          }

          console.warn("[provider archive fallback] All attempts failed:", archiveData?.results);
        } catch (e) {
          console.error("[provider archive fallback] fetch failed:", e);
        }
      }

      toast.error(response?.message || "Failed to delete gear. It may have active rentals.");
    } catch {
      toast.error("Failed to delete gear.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };



  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-bold">Inventory Management</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Manage your rental items, stock, and availability.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search gear or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>
          <Button nativeButton={false} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0" render={<Link href="/provider-dashboard/gear/new"><Plus className="w-4 h-4 mr-2" />Add Gear</Link>} />
        </div>
      </CardHeader>

      <CardContent>
        {filteredGear.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground text-sm mb-4">No gear items found in your inventory.</p>
            <Button nativeButton={false} size="sm" render={<Link href="/provider-dashboard/gear/new"><Plus className="w-4 h-4 mr-2" />Add Your First Gear</Link>} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gear Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price/Day</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGear.map((gear) => (
                    <TableRow key={gear.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 border">
                            <Image
                              src={getValidImageUrl(gear.images?.[0])}
                              alt={gear.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-sm line-clamp-1">{gear.name}</p>
                            <p className="text-xs text-muted-foreground">{gear.brand || "Generic"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{gear.category?.name || "General"}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-sm">${gear.dailyRentalPrice}</TableCell>
                      <TableCell className="text-sm">
                        <span className="font-medium">{gear.stock}</span>
                        <span className="text-xs text-muted-foreground ml-1">unit(s)</span>
                      </TableCell>
                      <TableCell>
                        {togglingId === gear.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                          <select
                            value={gear.availability || "AVAILABLE"}
                            onChange={(e) => handleUpdateAvailability(gear.id, e.target.value)}
                            disabled={togglingId === gear.id}
                            className="h-8 rounded-md border border-input bg-background px-2 py-0.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-accent/50 transition-colors"
                            title="Change Gear Availability Status"
                          >
                            <option value="AVAILABLE">AVAILABLE</option>
                            <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                            <option value="MAINTENANCE">MAINTENANCE</option>
                          </select>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button nativeButton={false} size="sm" variant="ghost" render={<Link href={`/provider-dashboard/gear/${gear.id}/edit`}><Edit2 className="w-4 h-4 text-blue-600" /></Link>} />
                          {confirmDeleteId === gear.id ? (
                            <div className="flex items-center gap-1 bg-destructive/10 p-1 rounded-md">
                              <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => handleDeleteConfirm(gear.id)} disabled={deletingId === gear.id}>
                                {deletingId === gear.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(gear.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t text-sm">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredGear.length)}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredGear.length)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{filteredGear.length}</span> items
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

        {/* MODAL: Rented Item Alert Notice */}
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
      </CardContent>
    </Card>
  );
}
