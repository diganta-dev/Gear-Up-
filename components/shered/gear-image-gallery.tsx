"use client";

import { useState } from "react";
import Image from "next/image";
import { cn, getValidImageUrl } from "@/lib/utils";

interface GearImageGalleryProps {
  images: string[];
  name: string;
}

export default function GearImageGallery({ images, name }: GearImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fallbackImage = "https://placehold.co/800x600.png?text=No+Image";
  const displayImages = images && images.length > 0 ? images : [fallbackImage];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
        <Image
          src={getValidImageUrl(displayImages[selectedIndex])}
          alt={`${name} - Main View`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                selectedIndex === index ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={getValidImageUrl(img)}
                alt={`${name} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
