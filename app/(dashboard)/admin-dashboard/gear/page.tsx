import { redirect } from "next/navigation";
import { getMe } from "@/service/getme";
import { getAllGear } from "@/service/gear";
import GearModerationTable from "../components/gear-moderation-table";
import { Package, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Gear Listings Moderation | Admin GearUp",
  description: "Inspect and moderate all sports gear listings on GearUp.",
};

export default async function AdminGearPage() {
  const [meRes, gearRes] = await Promise.all([
    getMe(),
    getAllGear(),
  ]);

  const user = meRes?.data?.user || meRes?.data;
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const allGear = Array.isArray(gearRes?.data) ? gearRes.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold w-fit mb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          CONTENT MODERATION CONTROL
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
          Gear Listings Moderation
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Inspect, filter, and moderate equipment listings submitted by providers across the platform.
        </p>
      </div>

      <GearModerationTable initialGear={allGear} />
    </div>
  );
}
