import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column Skeleton */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-40 mb-4" />
            <div className="border rounded-xl p-4 flex gap-4">
              <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
              <div className="flex flex-col justify-center gap-2 w-full">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>

          <div>
            <Skeleton className="h-8 w-32 mb-3" />
            <div className="border rounded-xl p-4 h-24">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div>
          <div className="border rounded-xl shadow-sm h-80">
            <div className="p-6 border-b">
              <Skeleton className="h-7 w-32" />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-12" />
              </div>
              <div className="pt-4 border-t flex justify-between mt-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <div className="p-4 border-t mt-auto">
              <Skeleton className="h-14 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
