"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit2, Trash2, Plus, Search, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

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

  const handleToggleAvailability = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
    setTogglingId(id);
    try {
      const response = await updateProviderGear(id, { availability: newStatus });
      if (response && response.success !== false) {
        setGearList((prev) => prev.map((g) => (g.id === id ? { ...g, availability: newStatus } : g)));
        toast.success(`Status updated to ${newStatus}`);
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
    setDeletingId(id);
    try {
      const response = await deleteProviderGear(id);
      if (response && response.success !== false) {
        setGearList((prev) => prev.filter((g) => g.id !== id));
        toast.success("Gear item deleted successfully.");
      } else {
        toast.error(response?.message || "Failed to delete gear.");
      }
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
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(gear.id, gear.availability)}
                        disabled={togglingId === gear.id}
                        className="inline-flex items-center gap-1.5 focus:outline-none"
                      >
                        {togglingId === gear.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : gear.availability === "AVAILABLE" ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1 cursor-pointer">
                            <CheckCircle className="w-3 h-3" /> Available
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 cursor-pointer text-muted-foreground">
                            <XCircle className="w-3 h-3" /> Unavailable
                          </Badge>
                        )}
                      </button>
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
    </CardContent>
  </Card>
);
}
