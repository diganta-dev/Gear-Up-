import Link from "next/link";
import Image from "next/image";
import { Sparkles, Tag, ArrowRight } from "lucide-react";
import { IGear } from "@/types/gear";
import { IRental } from "@/types/rental";
import { getValidImageUrl } from "@/lib/utils";

interface AiRecommendationProps {
  rentals: IRental[];
  suggestions: IGear[];
}

// Derive what category the user rents most — used to label the recommendation reason.
function getMostRentedCategory(rentals: IRental[]): string | null {
  const counts: Record<string, number> = {};
  for (const r of rentals) {
    const cat = r.gearItem?.category?.name;
    if (cat) counts[cat] = (counts[cat] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
}

export default function AiRecommendation({ rentals, suggestions }: AiRecommendationProps) {
  const topCategory = getMostRentedCategory(rentals);
  const hasRentals = rentals.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="h-9 w-9 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white dark:text-zinc-900" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">AI-Powered Suggestions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasRentals && topCategory
              ? `Based on your interest in ${topCategory} gear`
              : "Popular gear you might enjoy renting"}
          </p>
        </div>
      </div>

      {/* No suggestions fallback */}
      {suggestions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No recommendations available right now. Browse gear to get started.
        </div>
      )}

      {/* Gear cards grid */}
      <div className="grid grid-cols-1 gap-3">
        {suggestions.slice(0, 4).map((gear) => (
          <Link
            key={gear.id}
            href={`/gear/${gear.id}`}
            className="group flex gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm transition-all duration-200"
          >
            {/* Thumbnail */}
            <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              {gear.images?.[0] ? (
                <Image
                  src={getValidImageUrl(gear.images[0])}
                  alt={gear.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="64px"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-zinc-400">
                  <Tag className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {gear.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {gear.brand} · {gear.category?.name}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold">${gear.dailyRentalPrice}/day</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA to browse more */}
      <div className="mt-4 text-center">
        <Link
          href="/gear"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Browse all available gear →
        </Link>
      </div>
    </div>
  );
}
