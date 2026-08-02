"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarDays, Info } from "lucide-react";
import { IGear } from "@/types/gear";

interface GearDatePickerProps {
  gear: IGear;
}

export default function GearDatePicker({ gear }: GearDatePickerProps) {
  const router = useRouter();
  
  // Format today's date for the min attribute of date inputs
  const today = new Date().toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Get the next day after a given date string (for end date minimum)
  const getNextDay = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    // If end date is before or equal to new start date, reset end date
    if (endDate && new Date(endDate) <= new Date(newStart)) {
      setEndDate("");
    }
  };

  // Calculate rental duration in days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate difference in time
    const differenceInTime = end.getTime() - start.getTime();
    
    // Calculate difference in days
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    return differenceInDays > 0 ? differenceInDays : 0;
  };

  const days = calculateDays();
  const totalPrice = days * gear.dailyRentalPrice;

  const handleRentNow = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (days <= 0) {
      toast.error("End date must be after start date");
      return;
    }

    // Navigate to checkout — the checkout page handles auth server-side
    // and will redirect to /login if not authenticated
    router.push(`/checkout/${gear.id}?startDate=${startDate}&endDate=${endDate}`);
  };

  const isUnavailable = !gear.availableStock || gear.availableStock <= 0;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-end gap-2 border-b pb-4 mb-6">
        <span className="text-3xl font-bold text-primary">${gear.dailyRentalPrice}</span>
        <span className="text-muted-foreground mb-1">/ day</span>
      </div>

      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="start-date" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Start Date
          </Label>
          <Input 
            id="start-date" 
            type="date" 
            min={today}
            value={startDate}
            onChange={handleStartDateChange}
            disabled={isUnavailable}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-date" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> End Date
          </Label>
          <Input 
            id="end-date" 
            type="date" 
            min={startDate ? getNextDay(startDate) : today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={!startDate || isUnavailable}
          />
        </div>
      </div>

      {days > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span>${gear.dailyRentalPrice} × {days} days</span>
            <span>${totalPrice}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Estimated Total</span>
            <span className="text-primary">${totalPrice}</span>
          </div>
        </div>
      )}

      {isUnavailable ? (
        <Button className="w-full" size="lg" disabled variant="secondary">
          Currently Unavailable
        </Button>
      ) : (
        <Button 
          className="w-full text-base font-semibold" 
          size="lg"
          onClick={handleRentNow}
        >
          Rent Now
        </Button>
      )}

      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>You won't be charged yet. Payment is collected during checkout.</p>
      </div>
    </div>
  );
}
