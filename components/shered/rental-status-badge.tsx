import { Badge } from "@/components/ui/badge";
import { RentalStatus } from "@/types/rental";

interface RentalStatusBadgeProps {
  status: RentalStatus | string;
}

export default function RentalStatusBadge({ status }: RentalStatusBadgeProps) {
  switch (status) {
    case "PLACED":
      return <Badge className="bg-amber-500 hover:bg-amber-600">Placed</Badge>;
    case "CONFIRMED":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Confirmed</Badge>;
    case "PAID":
      return <Badge className="bg-purple-500 hover:bg-purple-600">Paid</Badge>;
    case "PICKED_UP":
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">Picked Up</Badge>;
    case "RETURNED":
      return <Badge className="bg-slate-500 hover:bg-slate-600">Returned</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
