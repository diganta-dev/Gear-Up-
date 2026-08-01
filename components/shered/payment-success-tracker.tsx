"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const rentalId = searchParams.get("rentalId") || searchParams.get("orderId");
    const transactionId = searchParams.get("transactionId") || searchParams.get("tran_id") || searchParams.get("val_id");

    if (rentalId) {
      localStorage.setItem(`gearup_paid_${rentalId}`, "true");
    }
    if (transactionId) {
      localStorage.setItem(`gearup_paid_tx_${transactionId}`, "true");
      localStorage.setItem("gearup_latest_paid_tx", transactionId);
    }
  }, [searchParams]);

  return null;
}
