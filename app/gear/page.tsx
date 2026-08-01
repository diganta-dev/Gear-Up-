import { getAllGear, getCategories } from "@/service/gear";
import GearCard from "@/components/shered/gear-card";
import GearFilters from "@/components/shered/gear-filters";
import MobileFilterDrawer from "@/components/shered/mobile-filter-drawer";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function GearPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  
  // Fetch data in parallel
  const [gearResponse, categoriesResponse] = await Promise.all([
    getAllGear(searchParams),
    getCategories()
  ]);

  const gearItems = gearResponse?.success && Array.isArray(gearResponse.data) ? gearResponse.data : [];
  const categories = categoriesResponse?.success && Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col min-h-[60vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Browse Gear</h1>
        <p className="text-muted-foreground mt-2">Find the perfect equipment for your next adventure.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer categories={categories} />

        {/* Desktop Filter Sidebar */}
        <aside className="w-full md:w-64 shrink-0 hidden md:block">
          <div className="sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Filters</h2>
            <GearFilters categories={categories} />
          </div>
        </aside>

        {/* Gear Grid */}
        <div className="flex-1">
          {gearItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gearItems.map((gear) => (
                <GearCard key={gear.id} gear={gear} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-lg border border-dashed h-full min-h-[300px]">
              <h3 className="text-xl font-semibold mb-2">No gear found</h3>
              <p className="text-muted-foreground max-w-md">
                We couldn&apos;t find any gear matching your current filters. Try adjusting your search or clearing some filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
