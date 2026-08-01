import { redirect } from "next/navigation";
import { getMe } from "@/service/getme";
import { getProviderGear } from "@/service/provider-gear";
import InventoryTable from "@/app/(dashboard)/provider-dashboard/components/inventory-table";
import { Package } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Inventory Management | GearUp Provider",
  description: "Manage your gear listings — add, edit, and remove equipment from your inventory.",
};

export default async function ProviderInventoryPage() {
  const [meRes, gearRes] = await Promise.all([
    getMe(),
    getProviderGear(),
  ]);

  const user = meRes?.data?.user || meRes?.data;
  if (!user) {
    redirect("/login");
  }

  const gearItems = gearRes?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold w-fit mb-1">
            <Package className="w-3.5 h-3.5" />
            INVENTORY CONTROL
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            You have <span className="font-bold text-zinc-900 dark:text-white">{gearItems.length}</span> gear items listed. Edit, toggle availability, or remove listings below.
          </p>
        </div>

        <Link
          href="/provider-dashboard/gear/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold transition-all shadow-sm whitespace-nowrap"
        >
          <Package className="w-4 h-4" />
          Add New Gear
        </Link>
      </div>

      {/* Inventory Table Component */}
      <InventoryTable initialGear={gearItems} />
    </div>
  );
}
