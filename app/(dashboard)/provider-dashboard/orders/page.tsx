import { redirect } from "next/navigation";
import { getMe } from "@/service/getme";
import { getProviderRentals } from "@/service/rentals";
import ProviderOrdersTable from "@/app/(dashboard)/provider-dashboard/components/provider-orders-table";
import { ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Rental Orders Management | GearUp Provider",
  description: "Manage incoming rental requests, approve orders, and track equipment status.",
};

export default async function ProviderOrdersPage() {
  const [meRes, providerOrdersRes] = await Promise.all([
    getMe(),
    getProviderRentals(),
  ]);

  const user = meRes?.data?.user || meRes?.data;
  if (!user) {
    redirect("/login");
  }

  const providerOrders = Array.isArray(providerOrdersRes?.data)
    ? providerOrdersRes.data
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold w-fit mb-1">
          <ShoppingBag className="w-3.5 h-3.5" />
          RENTAL ORDERS CONTROL
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Rental Orders Management</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Track incoming rental requests from customers, update order statuses, and monitor active rentals.
        </p>
      </div>

      {/* Orders Management Table Component */}
      <ProviderOrdersTable initialRentals={providerOrders} />
    </div>
  );
}
