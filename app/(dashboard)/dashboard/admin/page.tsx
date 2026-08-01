import { getMe } from "@/service/getme";
import { getAllGear, getCategories } from "@/service/gear";
import { getMyRentals } from "@/service/rentals";
import { getAllUsers } from "@/service/admin";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Package, ShoppingBag, Layers, TrendingUp, ShieldCheck, Activity, ArrowUpRight, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin Dashboard | GearUp",
  description: "System overview and administrative controls.",
};

export default async function DashboardAdminPage() {
  const [meRes, gearRes, catRes, rentalsRes, usersRes] = await Promise.all([
    getMe(),
    getAllGear(),
    getCategories(),
    getMyRentals(),
    getAllUsers(),
  ]);

  const user = meRes?.data?.user || meRes?.data;
  if (!user || (user.role || "").toUpperCase() !== "ADMIN") {
    redirect("/login");
  }

  const gearItems = gearRes?.data || [];
  const categories = catRes?.data || [];
  const rentals = rentalsRes?.data || [];
  const users = Array.isArray(usersRes?.data) ? usersRes.data : [];

  const totalCustomers = users.filter((u: any) => (u.role || "").toUpperCase() === "CUSTOMER").length;
  const totalProviders = users.filter((u: any) => (u.role || "").toUpperCase() === "PROVIDER").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            SYSTEM CONTROL CENTER
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Admin Overview</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Welcome back, <span className="font-semibold text-zinc-900 dark:text-white">{user.name}</span>! Here is your platform summary and system metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button render={<Link href="/admin-dashboard/users"><Users className="w-4 h-4 mr-2" />User Management</Link>} nativeButton={false} className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold" />
        </div>
      </div>

      {/* Top 5 Stat Cards in Black & White Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Total Users
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">{users.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Customers
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center font-bold border border-zinc-200 dark:border-zinc-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">{totalCustomers}</div>
            <p className="text-xs text-zinc-500 mt-1">Renting customers</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Providers
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">{totalProviders}</div>
            <p className="text-xs text-zinc-500 mt-1">Equipment owners</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Active Gear
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center font-bold border border-zinc-200 dark:border-zinc-700">
              <Package className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">{gearItems.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Listed equipment</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Total Rentals
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">{rentals.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Platform transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Control Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center justify-between text-zinc-900 dark:text-white">
              <span>User Directory</span>
              <ArrowUpRight className="w-5 h-5 text-zinc-900 dark:text-white" />
            </CardTitle>
            <CardDescription className="text-zinc-500">Manage user roles, filter by status, and suspend or activate accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/admin-dashboard/users">Manage Users</Link>} nativeButton={false} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold" />
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center justify-between text-zinc-900 dark:text-white">
              <span>All Rental Orders</span>
              <ArrowUpRight className="w-5 h-5 text-zinc-900 dark:text-white" />
            </CardTitle>
            <CardDescription className="text-zinc-500">Monitor all rental requests, transactions, and status updates across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/admin-dashboard/orders">View All Orders</Link>} nativeButton={false} variant="outline" className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold" />
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center justify-between text-zinc-900 dark:text-white">
              <span>Equipment Catalog</span>
              <ArrowUpRight className="w-5 h-5 text-zinc-900 dark:text-white" />
            </CardTitle>
            <CardDescription className="text-zinc-500">Inspect equipment listings, categories, and provider inventory.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/gear">Browse All Gear</Link>} nativeButton={false} variant="outline" className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
