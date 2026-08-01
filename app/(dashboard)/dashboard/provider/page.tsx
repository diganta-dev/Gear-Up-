import { redirect } from "next/navigation";
import { getMe } from "@/service/getme";
import { getProviderGear } from "@/service/provider-gear";
import { getMyRentals } from "@/service/rentals";
import ProviderOverview from "./components/provider-overview";
import InventoryTable from "./components/inventory-table";

export const metadata = {
  title: "Provider Dashboard | GearUp",
  description: "Manage your equipment inventory, listings, and orders.",
};

export default async function ProviderDashboardPage() {
  const [meRes, gearRes, rentalsRes] = await Promise.all([
    getMe(),
    getProviderGear(),
    getMyRentals(),
  ]);

  const user = meRes?.data?.user || meRes?.data;

  if (!user) {
    redirect("/login");
  }

  // Redirect customers away from provider dashboard if not provider or admin
  const userRole = (user.role || "").toUpperCase();
  if (userRole !== "PROVIDER" && userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const gearItems = gearRes?.data || [];
  const rentals = rentalsRes?.data || [];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Provider Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Track your equipment listings, rentals, and inventory.
        </p>
      </div>

      {/* Overview Stats */}
      <ProviderOverview gearItems={gearItems} rentals={rentals} />

      {/* Inventory Management Table */}
      <InventoryTable initialGear={gearItems} />
    </div>
  );
}
