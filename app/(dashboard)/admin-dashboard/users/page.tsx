import { redirect } from "next/navigation";
import { getMe } from "@/service/getme";
import { getAllUsers } from "@/service/admin";
import UserManagementTable from "@/app/(dashboard)/admin-dashboard/components/user-management-table";
import { Users } from "lucide-react";

export const metadata = {
  title: "User Management | Admin GearUp",
  description: "View, filter, suspend, and activate system user accounts.",
};

export default async function AdminUsersPage() {
  const [meRes, usersRes] = await Promise.all([
    getMe(),
    getAllUsers(),
  ]);

  const user = meRes?.data?.user || meRes?.data;
  if (!user || (user.role || "").toUpperCase() !== "ADMIN") {
    redirect("/login");
  }

  const users = Array.isArray(usersRes?.data) ? usersRes.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold w-fit mb-1">
          <Users className="w-3.5 h-3.5" />
          USER DIRECTORY & CONTROL
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          User Management
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage registered customers, providers, and administrator accounts across the platform.
        </p>
      </div>

      {/* User Management Table */}
      <UserManagementTable initialUsers={users} />
    </div>
  );
}
