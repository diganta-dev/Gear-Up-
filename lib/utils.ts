import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getValidImageUrl(url: string | undefined | null): string {
  if (!url) return "https://placehold.co/600x400/png?text=No+Image";
  // The backend contains mock data with "example.com" URLs which don't actually exist
  // and cause Next.js Image component to crash with a 404 when trying to optimize them.
  if (url.includes("example.com")) return "https://placehold.co/600x400/png?text=Mock+Image";
  return url;
}
