import { API_BASE_URL } from "@/lib/api-client";
import { IGearResponse } from "@/types/gear";

export const getFeaturedGear = async (): Promise<IGearResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gear`, {
      // Use no-store or revalidate depending on freshness needs. 
      // For a rental platform, inventory changes often, so no-store is safer.
      cache: "no-store", 
    });
    
    if (!res.ok) {
      return null;
    }
    
    const result = await res.json();
    return result;
  } catch (_error) {
    // Silently fail if backend is unreachable so the UI gracefully falls back
    return null;
  }
};
