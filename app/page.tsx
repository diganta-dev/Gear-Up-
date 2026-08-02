import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getFeaturedGear } from "@/service/gear";
import GearCard from "@/components/shered/gear-card";
import { Search, Shield, Zap, RefreshCw, Loader2 } from "lucide-react";

// Async component that fetches gear data — wrapped in Suspense below
async function FeaturedGearSection() {
  const gearResponse = await getFeaturedGear(8);
  const featuredGear = gearResponse?.success && Array.isArray(gearResponse.data) ? gearResponse.data.slice(0, 8) : [];

  if (featuredGear.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-lg border border-dashed">
        <h3 className="text-lg font-medium text-muted-foreground">No featured gear available at the moment.</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {featuredGear.map((gear) => (
        <GearCard key={gear.id} gear={gear} />
      ))}
    </div>
  );
}

// Loading skeleton shown while FeaturedGearSection streams in
function FeaturedGearSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading featured gear...</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section — renders instantly, no data dependency */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Gear Up for Your Next <span className="text-primary">Adventure</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Rent premium sports and outdoor equipment from trusted providers. Or list your own gear and start earning today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/gear">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    <Search className="w-4 h-4" /> Browse Gear
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Become a Provider
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Gear — streams in via Suspense */}
        <section className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Featured Gear</h2>
                <p className="text-muted-foreground mt-2">Top-rated equipment for your next journey.</p>
              </div>
              <Link href="/gear">
                <Button variant="ghost">View All Gear</Button>
              </Link>
            </div>

            <Suspense fallback={<FeaturedGearSkeleton />}>
              <FeaturedGearSection />
            </Suspense>
          </div>
        </section>

        {/* How it Works Section — renders instantly */}
        <section className="w-full py-16 md:py-24 bg-muted/40">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">How GearUp Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 text-primary rounded-full">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">1. Find Your Gear</h3>
                <p className="text-muted-foreground">Browse thousands of high-quality items for any sport or outdoor activity.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 text-primary rounded-full">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">2. Book & Pay</h3>
                <p className="text-muted-foreground">Securely rent the equipment for your desired dates using our safe platform.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 text-primary rounded-full">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">3. Play & Return</h3>
                <p className="text-muted-foreground">Enjoy your adventure, then easily return the gear to the provider.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Highlights */}
        <section className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="flex flex-col items-center space-y-4 max-w-3xl mx-auto">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-3xl font-bold tracking-tight">Rent with Confidence</h2>
              <p className="text-muted-foreground text-lg">
                Every transaction on GearUp is protected. Providers are verified, and our community reviews ensure you always get exactly what you expect.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
              Ready to start your adventure?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/gear">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-primary">
                  Browse Gear Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

