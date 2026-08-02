import { getMyRentals } from "@/service/rentals";
import { getMe } from "@/service/getme";
import CustomerOverview from "./components/customer-overview";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard | GearUp",
  description: "Manage your rentals and orders",
};

export default async function DashboardPage() {
  const [meRes, rentalsRes] = await Promise.all([
    getMe(),
    getMyRentals()
  ]);

  const user = meRes?.data?.user || meRes?.data;
  
  if (!user) {
    redirect("/login");
  }

  const rentals = rentalsRes?.data || [];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">
          View your rental overview and account summary.
        </p>
      </div>

      <CustomerOverview rentals={rentals} />
    </div>
  );
}
