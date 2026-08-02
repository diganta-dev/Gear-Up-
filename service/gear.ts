import { API_BASE_URL } from "@/lib/api-client";
import { IGearResponse, ICategoryResponse, ISingleGearResponse } from "@/types/gear";

export const getFeaturedGear = async (limit: number = 8): Promise<IGearResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gear?limit=${limit}`, {
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

export const getAllGear = async (searchParams?: Record<string, string | string[] | undefined>): Promise<IGearResponse | null> => {
  try {
    const query = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(v => query.append(key, v));
          } else {
            query.append(key, value);
          }
        }
      });
    }

    const queryString = query.toString();
    const url = `${API_BASE_URL}/api/gear${queryString ? `?${queryString}` : ''}`;
    
    const res = await fetch(url, {
      cache: "no-store", 
    });
    
    if (!res.ok) {
      return null;
    }
    
    return await res.json();
  } catch (_error) {
    return null;
  }
};

export const getCategories = async (): Promise<ICategoryResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`, {
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    });
    
    if (!res.ok) {
      return null;
    }
    
    return await res.json();
  } catch (_error) {
    return null;
  }
};

export const getGearById = async (id: string): Promise<ISingleGearResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gear/${id}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      return null;
    }
    
    return await res.json();
  } catch (_error) {
    return null;
  }
};
