import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { getMe } from "@/service/getme";
import { getProviderRentals } from "@/service/rentals";
import ProviderOrdersTable from "@/app/(dashboard)/provider-dashboard/components/provider-orders-table";

export const metadata = {
  title: "Rental Orders | GearUp Provider",
  description: "Manage incoming rental requests, confirm orders, and track equipment status.",
};

export default async function DashboardProviderOrdersPage() {
  const [meRes, orders] = await Promise.all([getMe(), getProviderRentals()]);

  const user = meRes?.data?.user || meRes?.data;
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold w-fit">
          <ShoppingBag className="w-3.5 h-3.5" />
          PROVIDER ORDERS
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          Rental Orders
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Review incoming rental requests, confirm or cancel orders, and update equipment status.
        </p>
      </div>

      <ProviderOrdersTable initialOrders={orders} />
    </div>
  );
}
