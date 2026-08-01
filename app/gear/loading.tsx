import { Loader2 } from "lucide-react";

export default function GearLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col min-h-[60vh]">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-md" />
        <div className="h-5 w-96 max-w-full bg-muted/60 rounded-md" />
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Sidebar Skeleton */}
        <aside className="w-full md:w-64 shrink-0 space-y-6 animate-pulse hidden md:block">
          <div className="space-y-2">
            <div className="h-5 w-24 bg-muted rounded-md" />
            <div className="h-10 w-full bg-muted/60 rounded-md" />
          </div>
          <div className="space-y-3">
            <div className="h-5 w-24 bg-muted rounded-md" />
            <div className="space-y-2">
              <div className="h-8 w-full bg-muted/60 rounded-md" />
              <div className="h-8 w-full bg-muted/60 rounded-md" />
              <div className="h-8 w-full bg-muted/60 rounded-md" />
            </div>
          </div>
        </aside>

        {/* Grid Skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse h-full min-h-[350px]">
                <div className="aspect-video w-full bg-muted rounded-t-lg" />
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="h-6 w-3/4 bg-muted rounded-md" />
                  <div className="h-4 w-full bg-muted/60 rounded-md" />
                  <div className="h-4 w-5/6 bg-muted/60 rounded-md" />
                  <div className="mt-auto flex justify-between items-center pt-4 border-t mt-4">
                    <div className="h-4 w-20 bg-muted rounded-md" />
                    <div className="h-6 w-16 bg-primary/20 rounded-md" />
                  </div>
                  <div className="h-10 w-full bg-muted rounded-md mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
