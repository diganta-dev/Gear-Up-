import { getMyRentals } from "@/service/rentals";
import { getMe } from "@/service/getme";
import OrderHistoryTable from "../components/order-history-table";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";

export const metadata = {
  title: "My Orders | GearUp",
  description: "View and manage your rental orders",
};

export default async function CustomerOrdersPage() {
  const [meRes, rentalsRes] = await Promise.all([
    getMe(),
    getMyRentals(),
  ]);

  const user = meRes?.data?.user || meRes?.data;

  if (!user) {
    redirect("/login");
  }

  const rentals = rentalsRes?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold w-fit mb-1">
          <ShoppingBag className="w-3.5 h-3.5" />
          MY ORDERS
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          My Rental Orders
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          View your active rental bookings, payment status, and order history.
        </p>
      </div>

      <OrderHistoryTable rentals={rentals} />
    </div>
  );
}
