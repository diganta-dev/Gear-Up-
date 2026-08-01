import { redirect } from "next/navigation";
import { getMe } from "@/service/getme";
import { getMyRentals } from "@/service/rentals";
import ProviderOrdersTable from "@/app/(dashboard)/provider-dashboard/components/provider-orders-table";
import { ShoppingBag } from "lucide-react";

export const metadata = {
  title: "All Rental Orders | Admin GearUp",
  description: "View and manage system-wide rental orders.",
};

export default async function AdminOrdersPage() {
  const [meRes, rentalsRes] = await Promise.all([
    getMe(),
    getMyRentals(),
  ]);

  const user = meRes?.data?.user || meRes?.data;
  if (!user) {
    redirect("/login");
  }

  const allRentals = Array.isArray(rentalsRes?.data) ? rentalsRes.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold w-fit mb-1">
          <ShoppingBag className="w-3.5 h-3.5" />
          SYSTEM ORDERS CONTROL
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">All System Rental Orders</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Inspect, filter, and manage all rental orders submitted across the platform.
        </p>
      </div>

      <ProviderOrdersTable initialRentals={allRentals} />
    </div>
  );
}
