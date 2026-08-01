import { redirect } from "next/navigation";
import { getMe } from "@/service/getme";
import { getProviderGear } from "@/service/provider-gear";
import { getProviderRentals } from "@/service/rentals";
import ProviderOverview from "@/app/(dashboard)/provider-dashboard/components/provider-overview";
import { ShoppingBag, Layers, LayoutDashboard, Package } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Provider Dashboard | GearUp",
  description: "Manage your equipment inventory, listings, and orders.",
};

export default async function ProviderDashboardPage() {
  const [meRes, gearRes, providerOrdersRes] = await Promise.all([
    getMe(),
    getProviderGear(),
    getProviderRentals(),
  ]);

  const user = meRes?.data?.user || meRes?.data;

  if (!user) {
    redirect("/login");
  }

  const gearItems = gearRes?.data || [];
  const providerOrders = Array.isArray(providerOrdersRes?.data)
    ? providerOrdersRes.data
    : [];

  const pendingOrders = providerOrders.filter(
    (o: any) => (o.status || "").toUpperCase() === "PLACED"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold w-fit mb-1">
          <LayoutDashboard className="w-3.5 h-3.5" />
          PROVIDER PORTAL
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          Provider Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Welcome back, <span className="font-semibold text-zinc-900 dark:text-white">{user.name}</span>! Track your equipment listings, rentals, and order status.
        </p>
      </div>

      {/* Overview Stats */}
      <ProviderOverview gearItems={gearItems} rentals={providerOrders} />

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Rental Orders Quick Link */}
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {providerOrders.length} Rental Orders
              </p>
              {pendingOrders > 0 && (
                <p className="text-xs text-amber-600 font-semibold">
                  {pendingOrders} pending action
                </p>
              )}
              {pendingOrders === 0 && (
                <p className="text-xs text-zinc-500">
                  Manage incoming requests on your gear
                </p>
              )}
            </div>
          </div>
          <Link
            href="/provider-dashboard/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 text-white text-xs font-bold transition-all whitespace-nowrap"
          >
            View Orders →
          </Link>
        </div>

        {/* Inventory Quick Link */}
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {gearItems.length} Gear Listed
              </p>
              <p className="text-xs text-zinc-500">
                Edit, toggle availability, or remove items
              </p>
            </div>
          </div>
          <Link
            href="/provider-dashboard/inventory"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all whitespace-nowrap"
          >
            Manage →
          </Link>
        </div>
      </div>

      {/* Add new gear CTA */}
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 px-6 py-5">
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">Ready to list more gear?</p>
          <p className="text-xs text-zinc-500 mt-0.5">Add new equipment to expand your inventory and earn more.</p>
        </div>
        <Link
          href="/provider-dashboard/gear/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold transition-all whitespace-nowrap"
        >
          <Package className="w-4 h-4" />
          Add New Gear
        </Link>
      </div>
    </div>
  );
}