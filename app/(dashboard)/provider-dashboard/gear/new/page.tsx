import { getCategories } from "@/service/gear";
import ProviderGearForm from "@/components/shered/provider-gear-form";

export const metadata = {
  title: "Add New Gear | Provider Dashboard | GearUp",
  description: "List a new piece of sports or outdoor gear for rent.",
};

export default async function NewGearPage() {
  const categoriesRes = await getCategories();
  const categories = categoriesRes?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <ProviderGearForm categories={categories} isEdit={false} basePath="/provider-dashboard" />
    </div>
  );
}
