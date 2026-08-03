"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log boundary error for monitoring if needed
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
        {/* Icon Header */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Something Went Wrong
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {error?.message || "An unexpected error occurred while loading this page. Please try again."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2"
            onClick={() => window.location.href = "/"}
          >
            <Home className="w-4 h-4" />
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
