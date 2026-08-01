import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center flex-1 w-full px-6 py-24 overflow-hidden">
      {/* Ambient background effect */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="h-[20rem] w-[20rem] sm:h-[40rem] sm:w-[40rem] rounded-full bg-primary/10 blur-[80px]" />
      </div>

      <div className="text-center max-w-2xl z-10">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            404 Error
          </span>
        </div>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
          Page not found
        </h1>
        <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It seems you&apos;ve wandered off the map.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button render={<Link href="/" />} nativeButton={false} size="lg" className="w-full sm:w-auto h-12 px-8">
            <Home className="mr-2 h-5 w-5" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}