import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getGearById } from "@/service/gear";
import CheckoutForm from "@/components/shered/checkout-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout | GearUp",
  description: "Complete your gear rental securely.",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CheckoutPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  // 1. Verify Authentication
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  
  if (!token) {
    redirect("/login");
  }

  // 2. Extract and validate dates
  const startDateStr = typeof searchParams.startDate === 'string' ? searchParams.startDate : undefined;
  const endDateStr = typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined;

  if (!startDateStr || !endDateStr) {
    // If no dates are provided, send user back to the gear details page to pick dates
    redirect(`/gear/${params.id}`);
  }

  // 3. Fetch gear details
  const response = await getGearById(params.id);
  const gear = response?.data;

  if (!gear || gear.availability !== 'AVAILABLE' || gear.availableStock <= 0) {
    // Gear not found or not available
    redirect(`/gear/${params.id}`);
  }

  // 4. Calculate duration and total price
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  
  if (endDate <= startDate) {
    // Invalid date range — end must be strictly after start
    redirect(`/gear/${params.id}`);
  }

  const differenceInTime = endDate.getTime() - startDate.getTime();
  const days = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  const totalPrice = days * gear.dailyRentalPrice;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Secure Checkout</h1>
        <p className="text-muted-foreground">Review your rental details and confirm your order.</p>
      </div>

      <CheckoutForm 
        gear={gear}
        startDate={startDateStr}
        endDate={endDateStr}
        days={days}
        totalPrice={totalPrice}
      />
    </div>
  );
}
