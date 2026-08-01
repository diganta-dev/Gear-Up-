import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { getRentalById } from "@/service/rentals";
import PaymentForm from "@/components/shered/payment-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Complete Payment | GearUp",
  description: "Complete payment for your gear rental.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderPayPage(props: PageProps) {
  const params = await props.params;

  const res = await getRentalById(params.id);
  const rental = res?.data;

  if (!res.success && res.message?.includes("logged in")) {
    redirect("/login");
  }

  if (!rental) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button nativeButton={false} variant="outline" size="sm" render={<Link href="/dashboard"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard</Link>} />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Complete Your Payment</h1>
        <p className="text-muted-foreground">
          Review your rental order summary and proceed with secure online payment.
        </p>
      </div>

      <PaymentForm rental={rental} />
    </div>
  );
}
