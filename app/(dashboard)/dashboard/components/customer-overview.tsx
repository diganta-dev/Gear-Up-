import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IRental } from "@/types/rental";
import { Package, CheckCircle, Clock } from "lucide-react";

interface CustomerOverviewProps {
  rentals: IRental[];
}

export default function CustomerOverview({ rentals }: CustomerOverviewProps) {
  const totalOrders = rentals.length;
  
  // Active rentals are typically PLACED, CONFIRMED, PAID, or PICKED_UP
  const activeRentals = rentals.filter(r => 
    ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"].includes(r.status)
  ).length;

  const completedRentals = rentals.filter(r => r.status === "RETURNED").length;

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">All-time rentals</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
          <Clock className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeRentals}</div>
          <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedRentals}</div>
          <p className="text-xs text-muted-foreground mt-1">Successfully returned</p>
        </CardContent>
      </Card>
    </div>
  );
}
