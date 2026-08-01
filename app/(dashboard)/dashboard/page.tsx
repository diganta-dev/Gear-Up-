import { getMyRentals } from "@/service/rentals";
import { getMe } from "@/service/getme";
import CustomerOverview from "./components/customer-overview";
import OrderHistoryTable from "./components/order-history-table";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard | GearUp",
  description: "Manage your rentals and orders",
};

export default async function DashboardPage() {
  const meRes = await getMe();
  const user = meRes?.data?.user || meRes?.data;
  
  if (!user) {
    redirect("/login");
  }

  const rentalsRes = await getMyRentals();
  const rentals = rentalsRes?.data || [];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">
          Manage your rentals and view your order history.
        </p>
      </div>

      <CustomerOverview rentals={rentals} />
      <OrderHistoryTable rentals={rentals} />
    </div>
  );
}
