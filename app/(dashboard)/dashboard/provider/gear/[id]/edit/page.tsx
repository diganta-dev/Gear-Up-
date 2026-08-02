import { notFound } from "next/navigation";
import { getGearById, getCategories } from "@/service/gear";
import ProviderGearForm from "@/components/shered/provider-gear-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Edit Gear | Provider | GearUp",
  description: "Update your listed rental equipment details.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditGearPage(props: PageProps) {
  const params = await props.params;
  const { id } = params;

  const [gearRes, categoriesRes] = await Promise.all([
    getGearById(id),
    getCategories(),
  ]);

  if (!gearRes?.success || !gearRes.data) {
    notFound();
  }

  const gear = gearRes.data;
  const categories = categoriesRes?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <ProviderGearForm initialData={gear} categories={categories} isEdit={true} />
    </div>
  );
}
