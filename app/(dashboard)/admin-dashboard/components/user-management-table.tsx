"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  User,
  ShieldCheck,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { updateUserStatus, updateUserRole } from "@/service/admin";
import { toast } from "sonner";

interface UserManagementTableProps {
  initialUsers: any[];
}

const ITEMS_PER_PAGE = 6;

export default function UserManagementTable({ initialUsers }: UserManagementTableProps) {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"suspend" | "activate" | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{ user: any; newRole: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  // Handle Suspend / Activate Status Change
  const handleToggleStatus = async (user: any) => {
    const isCurrentlySuspended = (user.status || "").toUpperCase() === "SUSPENDED";
    const nextSuspended = !isCurrentlySuspended;
    const nextStatus = nextSuspended ? "SUSPENDED" : "ACTIVE";

    setUpdatingId(user.id);
    setConfirmUserId(null);
    setConfirmAction(null);

    try {
      const res = await updateUserStatus(user.id, nextSuspended);
      if (res && res.success !== false) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isSuspended: nextSuspended, status: nextStatus } : u
          )
        );
        toast.success(`User ${user.name} has been ${nextSuspended ? "suspended" : "activated"}.`);
      } else {
        toast.error(res?.message || "Failed to update user status.");
      }
    } catch {
      toast.error("An error occurred while updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle User Role Change
  const handleRoleChangeConfirm = async () => {
    if (!confirmRoleChange) return;
    const { user, newRole } = confirmRoleChange;

    setUpdatingId(user.id);
    setConfirmRoleChange(null);

    try {
      const res = await updateUserRole(user.id, newRole);
      if (res && res.success !== false) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
        toast.success(`Role for ${user.name || "user"} updated to ${newRole}.`);
      } else {
        toast.error(res?.message || "Failed to update user role.");
      }
    } catch {
      toast.error("An error occurred while updating user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = u.name || "";
    const email = u.email || "";
    const role = u.role || "";

    const matchesSearch =
      !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "ALL" || role.toUpperCase() === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
            <Users className="w-5 h-5" />
            User Account Management
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 mt-1">
            Search, change roles, filter, and manage account statuses across all platform users.
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none shrink-0"
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="PROVIDER">Provider</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
            <Users className="w-10 h-10 mx-auto text-zinc-400 mb-3 opacity-50" />
            <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">No users found.</p>
            <p className="text-xs text-zinc-500 mt-1">Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((u) => {
                    const isSuspended = (u.status || "").toUpperCase() === "SUSPENDED";
                    const currentRole = (u.role || "CUSTOMER").toUpperCase();

                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-800 dark:text-zinc-200">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                              {u.name || "Unnamed User"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm text-zinc-600 dark:text-zinc-300">
                          {u.email}
                        </TableCell>

                        {/* Interactive Role Dropdown */}
                        <TableCell>
                          {confirmRoleChange?.user.id === u.id ? (
                            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                              <Button
                                size="xs"
                                variant="default"
                                onClick={handleRoleChangeConfirm}
                                className="h-7 px-2 text-xs font-bold bg-zinc-950 text-white"
                              >
                                Set {confirmRoleChange?.newRole}
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => setConfirmRoleChange(null)}
                                className="h-7 px-2 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <select
                              value={currentRole}
                              onChange={(e) => {
                                const newRole = e.target.value;
                                if (newRole !== currentRole) {
                                  setConfirmRoleChange({ user: u, newRole });
                                }
                              }}
                              disabled={updatingId === u.id}
                              className="h-8 text-xs font-bold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer shadow-sm"
                            >
                              <option value="CUSTOMER">CUSTOMER</option>
                              <option value="PROVIDER">PROVIDER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          )}
                        </TableCell>

                        <TableCell>
                          {isSuspended ? (
                            <Badge variant="destructive" className="font-bold">
                              SUSPENDED
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                              ACTIVE
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {updatingId === u.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                            ) : confirmUserId === u.id ? (
                              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                                <Button
                                  size="xs"
                                  variant={confirmAction === "suspend" ? "destructive" : "default"}
                                  onClick={() => handleToggleStatus(u)}
                                  className="h-7 px-2.5 text-xs font-bold"
                                >
                                  Confirm {confirmAction === "suspend" ? "Suspend" : "Activate"}
                                </Button>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => {
                                    setConfirmUserId(null);
                                    setConfirmAction(null);
                                  }}
                                  className="h-7 px-2 text-xs"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <>
                                {isSuspended ? (
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 font-bold"
                                    onClick={() => {
                                      setConfirmUserId(u.id);
                                      setConfirmAction("activate");
                                    }}
                                  >
                                    <UserCheck className="w-3.5 h-3.5 mr-1" /> Activate
                                  </Button>
                                ) : (
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    className="border-red-500/40 text-red-700 hover:bg-red-50 font-bold"
                                    onClick={() => {
                                      setConfirmUserId(u.id);
                                      setConfirmAction("suspend");
                                    }}
                                  >
                                    <UserX className="w-3.5 h-3.5 mr-1" /> Suspend
                                  </Button>
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

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t text-sm">
              <p className="text-xs text-zinc-500">
                Showing{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredUsers.length)}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
                </span>{" "}
                of <span className="font-semibold text-zinc-900 dark:text-white">{filteredUsers.length}</span> users
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
