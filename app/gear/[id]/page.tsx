import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getGearById } from "@/service/gear";
import GearImageGallery from "@/components/shered/gear-image-gallery";
import GearDatePicker from "@/components/shered/gear-date-picker";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, User } from "lucide-react";
import { Metadata } from "next";

type PageProps = {
  params: Promise<{ id: string }>;
};

// Next.js dynamic metadata
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const response = await getGearById(params.id);
  const gear = response?.data;

  if (!gear) {
    return {
      title: "Gear Not Found | GearUp",
    };
  }

  return {
    title: `${gear.name} | GearUp`,
    description: gear.description,
  };
}

export default async function GearDetailsPage(props: PageProps) {
  const params = await props.params;
  
  // Check if user is logged in using the existing cookie strategy
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("accessToken");

  const response = await getGearById(params.id);
  const gear = response?.data;

  if (!gear) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          <GearImageGallery images={gear.images} name={gear.name} />

          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  {gear.category?.name || "Uncategorized"}
                </Badge>
                {gear.availability === "AVAILABLE" && gear.availableStock > 0 ? (
                  <Badge variant="default" className="px-3 py-1 bg-green-600 hover:bg-green-700 text-xs">
                    Available ({gear.availableStock} in stock)
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="px-3 py-1 text-xs">
                    Currently Unavailable
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-2">{gear.name}</h1>
              <p className="text-lg text-muted-foreground">Brand: <span className="font-medium text-foreground">{gear.brand}</span></p>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {gear.description}
              </p>
            </div>

            {/* Specifications (if they exist) */}
            {gear.specifications && Object.keys(gear.specifications).length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-3">Specifications</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(gear.specifications).map(([key, value]) => (
                      <div key={key} className="flex flex-col p-3 rounded-lg bg-muted/30 border">
                        <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">{key}</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Provider Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Provided by</h2>
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{gear.provider?.name || "Unknown Provider"}</h3>
                  <p className="text-sm text-muted-foreground">
                    Trusted GearUp Partner
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {gear.reviews && gear.reviews.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Star className="fill-primary text-primary w-5 h-5" /> 
                    Reviews ({gear.reviews.length})
                  </h2>
                  <div className="space-y-4">
                    {gear.reviews.map((review) => (
                      <div key={review.id} className="p-4 rounded-xl border bg-muted/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{review.customer?.name || "Customer"}</span>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <GearDatePicker gear={gear} isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </div>
    </div>
  );
}
