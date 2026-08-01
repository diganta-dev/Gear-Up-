"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { IGearCategory } from "@/types/gear";
import GearFilters from "./gear-filters";

interface MobileFilterDrawerProps {
  categories: IGearCategory[];
}

export default function MobileFilterDrawer({ categories }: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden mb-6">
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Filter className="w-4 h-4" />
        Filter Gear
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="relative z-[101] w-[85%] max-w-sm bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold tracking-tight">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="-mr-2">
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <GearFilters categories={categories} closeDrawer={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
