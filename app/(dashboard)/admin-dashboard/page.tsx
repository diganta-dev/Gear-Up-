import { getMe } from "@/service/getme";
import { getAllGear, getCategories } from "@/service/gear";
import { getMyRentals } from "@/service/rentals";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Package, ShoppingBag, Layers, TrendingUp, ShieldCheck, Activity, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin Dashboard | GearUp",
  description: "System overview and administrative controls.",
};

export default async function AdminDashboardPage() {
  const [meRes, gearRes, catRes, rentalsRes] = await Promise.all([
    getMe(),
    getAllGear(),
    getCategories(),
    getMyRentals(),
  ]);

  const user = meRes?.data?.user || meRes?.data;
  if (!user) {
    redirect("/login");
  }

  const gearItems = gearRes?.data || [];
  const categories = catRes?.data || [];
  const rentals = rentalsRes?.data || [];

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
            Welcome back, {user.name}! Here is your system performance and management summary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button render={<Link href="/gear"><Package className="w-4 h-4 mr-2" />Browse All Gear</Link>} nativeButton={false} variant="outline" size="sm" className="border-zinc-300 dark:border-zinc-700" />
        </div>
      </div>

      {/* Top 4 Stat Cards in Black & White Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Total Gear Items
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">{gearItems.length}</div>
            <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active listings in store</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Categories
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center font-bold border border-zinc-200 dark:border-zinc-700">
              <Layers className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">{categories.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Sports & outdoor categories</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              System Rentals
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">{rentals.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Recorded rental orders</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              System Health
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">100%</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-1">All services operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center justify-between text-zinc-900 dark:text-white">
              <span>Inventory Management</span>
              <ArrowUpRight className="w-5 h-5 text-zinc-900 dark:text-white" />
            </CardTitle>
            <CardDescription className="text-zinc-500">View, inspect, and filter equipment listed by all providers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/gear">View Gear Catalog</Link>} nativeButton={false} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold" />
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center justify-between text-zinc-900 dark:text-white">
              <span>Provider Management</span>
              <ArrowUpRight className="w-5 h-5 text-zinc-900 dark:text-white" />
            </CardTitle>
            <CardDescription className="text-zinc-500">Manage provider accounts, listings, and equipment verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/provider-dashboard">Switch to Provider View</Link>} nativeButton={false} variant="outline" className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold" />
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center justify-between text-zinc-900 dark:text-white">
              <span>Account Settings</span>
              <ArrowUpRight className="w-5 h-5 text-zinc-900 dark:text-white" />
            </CardTitle>
            <CardDescription className="text-zinc-500">Update administrative profile, security preferences, and tokens.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/profile">Manage Admin Profile</Link>} nativeButton={false} variant="outline" className="w-full border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
