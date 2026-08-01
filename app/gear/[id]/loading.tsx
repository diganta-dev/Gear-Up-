import { Skeleton } from "@/components/ui/skeleton";

export default function GearDetailsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <div className="flex gap-2 overflow-hidden">
              <Skeleton className="h-20 w-28 rounded-lg" />
              <Skeleton className="h-20 w-28 rounded-lg" />
              <Skeleton className="h-20 w-28 rounded-lg" />
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-6">
            <div>
              <div className="flex gap-2 mb-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/6" />
            </div>

            <div className="border-t pt-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
