import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, DollarSign, Activity } from "lucide-react";
import { IGear } from "@/types/gear";

interface ProviderOverviewProps {
  gearItems: IGear[];
  rentals?: any[];
}

export default function ProviderOverview({ gearItems, rentals = [] }: ProviderOverviewProps) {
  const totalGear = gearItems.length;

  const activeRentals = rentals.filter((r) =>
    ["PAID", "PICKED_UP"].includes((r.status || "").toUpperCase())
  ).length;

  const pendingOrders = rentals.filter((r) =>
    ["PLACED"].includes((r.status || "").toUpperCase())
  ).length;

  const totalRevenue = rentals.reduce((sum, r) => {
    const isPaid = ["PAID", "PICKED_UP", "RETURNED"].includes((r.status || "").toUpperCase());
    return isPaid ? sum + (Number(r.totalAmount) || 0) : sum;
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Gear */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Gear</CardTitle>
          <Package className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalGear}</div>
          <p className="text-xs text-muted-foreground mt-1">Listed inventory items</p>
        </CardContent>
      </Card>

      {/* Active Rentals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
          <Activity className="w-4 h-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeRentals}</div>
          <p className="text-xs text-muted-foreground mt-1">Currently rented out</p>
        </CardContent>
      </Card>

      {/* Pending Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
          <Clock className="w-4 h-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Revenue</CardTitle>
          <DollarSign className="w-4 h-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue}</div>
          <p className="text-xs text-muted-foreground mt-1">From completed & active rentals</p>
        </CardContent>
      </Card>
    </div>
  );
}
