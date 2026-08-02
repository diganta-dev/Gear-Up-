import { redirect, notFound } from "next/navigation";
import { getGearById, getCategories } from "@/service/gear";
import { getMe } from "@/service/getme";
import ProviderGearForm from "@/components/shered/provider-gear-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Edit Gear | Provider Dashboard | GearUp",
  description: "Update your listed rental equipment details.",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditGearPage(props: PageProps) {
  const params = await props.params;
  const { id } = params;

  const [gearRes, categoriesRes, meRes] = await Promise.all([
    getGearById(id),
    getCategories(),
    getMe(),
  ]);

  const user = meRes?.data?.user || meRes?.data;
  if (!user) {
    redirect("/login");
  }

  if (!gearRes?.success || !gearRes.data) {
    notFound();
  }

  const gear = gearRes.data;
  const categories = categoriesRes?.data || [];

  // Ownership check: only the provider who owns this gear (or an ADMIN) can edit it
  const gearProviderId = gear.providerId || gear.provider?.id;
  const isAdmin = user.role === "ADMIN";
  if (!isAdmin && gearProviderId && gearProviderId !== user.id) {
    redirect("/provider-dashboard/inventory");
  }

  const basePath = isAdmin ? "/admin-dashboard/gear" : "/provider-dashboard/inventory";

  return (
    <div className="container mx-auto px-4 py-8">
      <ProviderGearForm initialData={gear} categories={categories} isEdit={true} basePath={basePath} />
    </div>
  );
}
