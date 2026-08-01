"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IGearCategory } from "@/types/gear";
import { Search, X } from "lucide-react";

interface GearFiltersProps {
  categories: IGearCategory[];
  closeDrawer?: () => void;
}

export default function GearFilters({ categories, closeDrawer }: GearFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("searchTerm") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("priceMin") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("priceMax") || "");

  useEffect(() => {
    setSearchTerm(searchParams.get("searchTerm") || "");
    setMinPrice(searchParams.get("priceMin") || "");
    setMaxPrice(searchParams.get("priceMax") || "");
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only push if it's different from current param
      const currentParam = searchParams.get("searchTerm") || "";
      if (searchTerm !== currentParam) {
        const query = createQueryString("searchTerm", searchTerm);
        router.push(`/gear?${query}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, router, createQueryString, searchParams]);

  const handleFilterChange = (name: string, value: string) => {
    router.push(`/gear?${createQueryString(name, value)}`, { scroll: false });
  };

  const handleClearFilters = () => {
    router.push("/gear", { scroll: false });
    setSearchTerm("");
    if (closeDrawer) closeDrawer();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="search">Search Gear</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search by name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Category</Label>
        <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto pr-2">
          <button
            onClick={() => handleFilterChange("category", "")}
            className={`text-left text-sm px-2 py-1.5 rounded-md transition-colors ${!searchParams.get("category") ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"}`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleFilterChange("category", category.id)}
              className={`text-left text-sm px-2 py-1.5 rounded-md transition-colors ${searchParams.get("category") === category.id ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Price Range ($/day)</Label>
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            placeholder="Min" 
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={(e) => handleFilterChange("priceMin", e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange("priceMin", e.currentTarget.value)}
          />
          <span className="text-muted-foreground">-</span>
          <Input 
            type="number" 
            placeholder="Max" 
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={(e) => handleFilterChange("priceMax", e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange("priceMax", e.currentTarget.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="availability"
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          checked={searchParams.get("availability") === "AVAILABLE"}
          onChange={(e) => handleFilterChange("availability", e.target.checked ? "AVAILABLE" : "")}
        />
        <Label htmlFor="availability" className="cursor-pointer font-normal">Only show available gear</Label>
      </div>

      <Button variant="outline" className="w-full mt-4" onClick={handleClearFilters}>
        Clear All Filters
      </Button>
    </div>
  );
}
