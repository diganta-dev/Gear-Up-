import { Badge } from "@/components/ui/badge";
import { RENTAL_STATUS, RentalStatus } from "@/types/constants";
import { cn } from "@/lib/utils";

interface RentalStatusBadgeProps {
  status: RentalStatus;
  className?: string;
}

export function RentalStatusBadge({ status, className }: RentalStatusBadgeProps) {
  let colorClass = "";
  
  switch (status) {
    case RENTAL_STATUS.PLACED:
      colorClass = "bg-orange-100 text-orange-800 hover:bg-orange-100/80 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900";
      break;
    case RENTAL_STATUS.CONFIRMED:
      colorClass = "bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900";
      break;
    case RENTAL_STATUS.PAID:
      colorClass = "bg-purple-100 text-purple-800 hover:bg-purple-100/80 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-900";
      break;
    case RENTAL_STATUS.PICKED_UP:
      colorClass = "bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900";
      break;
    case RENTAL_STATUS.RETURNED:
      colorClass = "bg-gray-100 text-gray-800 hover:bg-gray-100/80 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
      break;
    case RENTAL_STATUS.CANCELLED:
      colorClass = "bg-red-100 text-red-800 hover:bg-red-100/80 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800 hover:bg-gray-100/80 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  }

  return (
    <Badge variant="outline" className={cn("font-medium", colorClass, className)}>
      {status.replace("_", " ")}
    </Badge>
  );
}
