import Image from "next/image";
import Link from "next/link";
import { IGear } from "@/types/gear";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getValidImageUrl } from "@/lib/utils";

interface GearCardProps {
  gear: IGear;
}

export default function GearCard({ gear }: GearCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md h-full">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={getValidImageUrl(gear.images?.[0])}
          alt={gear.name}
          fill
          className="object-cover transition-transform hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {gear.availability !== 'AVAILABLE' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm font-semibold px-3 py-1">
              Currently Unavailable
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-1 flex-1">{gear.name}</h3>
          <Badge variant="secondary" className="whitespace-nowrap shrink-0">{gear.category?.name || "Uncategorized"}</Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {gear.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="font-medium text-sm text-muted-foreground">Brand: {gear.brand}</p>
          <div className="text-right">
            <span className="text-lg font-bold text-primary">${gear.dailyRentalPrice}</span>
            <span className="text-xs text-muted-foreground"> /day</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/gear/${gear.id}`} className="w-full">
          <Button className="w-full" variant={gear.availability === 'AVAILABLE' ? "default" : "secondary"}>
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
