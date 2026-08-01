import Link from "next/link";
import { Metadata } from "next";
import { XCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Payment Cancelled | GearUp",
  description: "Your payment process was cancelled or not completed.",
};

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PaymentCancelPage(props: PageProps) {
  const resolvedSearchParams = props?.searchParams ? await props.searchParams : {};

  const rentalId = typeof resolvedSearchParams.rentalId === "string" 
    ? resolvedSearchParams.rentalId 
    : undefined;

  const retryHref = rentalId 
    ? `/dashboard/customer/orders/${rentalId}/pay` 
    : "/dashboard";

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full text-center shadow-lg border-amber-500/20">
        <CardHeader className="pt-8 pb-4">
          <div className="mx-auto w-16 h-16 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            Payment Cancelled
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Your transaction was cancelled and no charges were made.
          </p>
        </CardHeader>

        <CardContent className="space-y-3 text-sm py-4">
          <p className="text-muted-foreground">
            You can retry the payment whenever you're ready from your customer dashboard.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 pb-8">
          <Button nativeButton={false} className="w-full" size="lg" render={<Link href={retryHref} />}>
            <RefreshCw className="w-4 h-4 mr-2" /> Retry Payment
          </Button>
          <Button nativeButton={false} variant="outline" className="w-full" render={<Link href="/dashboard" />}>
            <LayoutDashboard className="w-4 h-4 mr-2" /> Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
