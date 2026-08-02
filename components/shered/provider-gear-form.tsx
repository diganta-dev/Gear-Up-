"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, PackagePlus, ArrowLeft } from "lucide-react";

import { IGear, IGearCategory } from "@/types/gear";
import { createProviderGear, updateProviderGear } from "@/service/provider-gear";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

interface ProviderGearFormProps {
  initialData?: IGear | null;
  categories: IGearCategory[];
  isEdit?: boolean;
  basePath?: string;
}

export default function ProviderGearForm({ initialData, categories, isEdit = false, basePath = "/provider-dashboard" }: ProviderGearFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [dailyRentalPrice, setDailyRentalPrice] = useState<number | string>(initialData?.dailyRentalPrice ?? "");
  const [stock, setStock] = useState<number | string>(initialData?.stock ?? 1);
  const [imageUrl, setImageUrl] = useState(initialData?.images?.join("\n") || "");
  const [availability, setAvailability] = useState(initialData?.availability || "AVAILABLE");
  const [description, setDescription] = useState(initialData?.description || "");
  const [specificationsText, setSpecificationsText] = useState(
    initialData?.specifications
      ? typeof initialData.specifications === "string"
        ? initialData.specifications
        : JSON.stringify(initialData.specifications, null, 2)
      : ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Please enter a gear name.");
      toast.error("Please enter a gear name.");
      return;
    }

    if (!categoryId) {
      setErrorMsg("Please select a category.");
      toast.error("Please select a category.");
      return;
    }

    if (!dailyRentalPrice || Number(dailyRentalPrice) <= 0) {
      setErrorMsg("Please enter a valid daily rental price.");
      toast.error("Please enter a valid daily rental price.");
      return;
    }

    const priceNum = Number(dailyRentalPrice);
    const stockNum = stock === "" || isNaN(Number(stock)) ? 0 : Math.max(0, Number(stock));

    // Parse image URLs (comma or newline separated)
    const imagesArray = imageUrl
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const finalImages = imagesArray.length > 0 ? imagesArray : ["https://placehold.co/600x400.png?text=Gear+Image"];

    // Parse specifications (JSON or fallback object)
    let specsObj: Record<string, any> | null = null;
    if (specificationsText.trim()) {
      try {
        specsObj = JSON.parse(specificationsText);
      } catch {
        // Fallback: convert key: value lines
        const lines = specificationsText.split("\n");
        const parsed: Record<string, string> = {};
        lines.forEach((line) => {
          const parts = line.split(":");
          if (parts.length >= 2) {
            parsed[parts[0].trim()] = parts.slice(1).join(":").trim();
          }
        });
        specsObj = Object.keys(parsed).length > 0 ? parsed : { details: specificationsText.trim() };
      }
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      categoryId,
      brand: brand.trim() || "Generic",
      dailyRentalPrice: priceNum,
      stock: stockNum,
      images: finalImages,
      specifications: specsObj,
      availability,
    };

    try {
      let response;
      if (isEdit && initialData?.id) {
        response = await updateProviderGear(initialData.id, payload);
      } else {
        response = await createProviderGear(payload);
      }

      if (response && response.success !== false) {
        toast.success(`Gear ${isEdit ? "updated" : "created"} successfully!`);
        window.location.href = basePath;
      } else {
        const error = response?.message || `Failed to ${isEdit ? "update" : "create"} gear.`;
        setErrorMsg(error);
        toast.error(error);
        setIsSubmitting(false);
      }
    } catch (_err) {
      toast.error("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <PackagePlus className="w-6 h-6 text-primary" />
              {isEdit ? "Edit Gear Item" : "Add New Gear"}
            </CardTitle>
            <CardDescription className="mt-1">
              {isEdit ? "Update your rental equipment details." : "List new sports or outdoor equipment for rent."}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gear Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="gear-name" className="text-sm font-medium">
                Gear Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="gear-name"
                placeholder="e.g. Professional Mountain Bike 29er"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="gear-category" className="text-sm font-medium">
                Category <span className="text-destructive">*</span>
              </Label>
              <select
                id="gear-category"
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={isSubmitting}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="dark:bg-background">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="gear-brand" className="text-sm font-medium">
                Brand
              </Label>
              <Input
                id="gear-brand"
                placeholder="e.g. Trek, Coleman, Sony"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Daily Price */}
            <div className="space-y-2">
              <Label htmlFor="gear-price" className="text-sm font-medium">
                Price Per Day ($) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="gear-price"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 25"
                value={dailyRentalPrice}
                onChange={(e) => setDailyRentalPrice(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="gear-stock" className="text-sm font-medium">
                Total Stock <span className="text-destructive">*</span>
              </Label>
              <Input
                id="gear-stock"
                type="number"
                min="0"
                placeholder="e.g. 3"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label htmlFor="gear-availability" className="text-sm font-medium">
                Availability Status
              </Label>
              <select
                id="gear-availability"
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="AVAILABLE" className="dark:bg-background">AVAILABLE</option>
                <option value="OUT_OF_STOCK" className="dark:bg-background">OUT OF STOCK</option>
                <option value="UNAVAILABLE" className="dark:bg-background">UNAVAILABLE (Archived/Rented)</option>
                <option value="MAINTENANCE" className="dark:bg-background">MAINTENANCE</option>
              </select>
            </div>

            {/* Image URLs */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="gear-images" className="text-sm font-medium">
                Image URLs (one per line or comma-separated)
              </Label>
              <Textarea
                id="gear-images"
                placeholder="https://example.com/images/gear1.jpg"
                rows={3}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="gear-desc" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="gear-desc"
                placeholder="Detailed description of the equipment, included accessories, and usage guidelines..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Specifications */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="gear-specs" className="text-sm font-medium">
                Specifications (Key: Value or JSON format)
              </Label>
              <Textarea
                id="gear-specs"
                placeholder={`weight: 4.5kg\ncapacity: 2 persons\nmaterial: Carbon Fiber`}
                rows={3}
                value={specificationsText}
                onChange={(e) => setSpecificationsText(e.target.value)}
                className="font-mono text-xs"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> {isEdit ? "Update Gear" : "Save Gear"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
