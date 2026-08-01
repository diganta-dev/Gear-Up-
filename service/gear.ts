import { API_BASE_URL } from "@/lib/api-client";
import { IGearResponse } from "@/types/gear";

export const getFeaturedGear = async (): Promise<IGearResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gear`, {
      next: {
        revalidate: 60, // Re-fetch at most once every 60 seconds
      },
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
