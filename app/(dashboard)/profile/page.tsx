import { redirect } from "next/navigation";
import { CalendarDays, Mail, ShieldCheck, Sparkles, User } from "lucide-react";

import { getMe } from "@/service/getme";
import { getMyRentals, getProviderRentals } from "@/service/rentals";
import { getAllRentalsAdmin, getAllUsers } from "@/service/admin";
import { getFeaturedGear, getAllGear } from "@/service/gear";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import ProfileEditForm from "./components/profile-edit-form";
import ChangePasswordForm from "./components/change-password-form";
import AiRecommendation from "./components/ai-recommendation";
import type { IGear } from "@/types/gear";
import type { IRental, IProviderOrder } from "@/types/rental";

export const metadata = {
  title: "Profile | GearUp",
  description: "Manage your account settings and view personalised gear recommendations.",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function pickSuggestions(
  rentals: IRental[],
  allGear: IGear[],
  role: string
): IGear[] {
  if (role !== "CUSTOMER" || rentals.length === 0) {
    return allGear.slice(0, 4);
  }

  const rentedCategoryIds = new Set(
    rentals.map((r) => r.gearItem?.categoryId).filter(Boolean)
  );
  const rentedGearIds = new Set(rentals.map((r) => r.gearItemId));

  const matched = allGear.filter(
    (g) => rentedCategoryIds.has(g.categoryId) && !rentedGearIds.has(g.id)
  );
  if (matched.length >= 4) return matched.slice(0, 4);

  const rest = allGear.filter(
    (g) => !rentedCategoryIds.has(g.categoryId) && !rentedGearIds.has(g.id)
  );
  return [...matched, ...rest].slice(0, 4);
}

// -------------------------------------------------------------------
// Stat builders
// -------------------------------------------------------------------

interface StatCard {
  label: string;
  value: number | string;
}

function customerStats(rentals: IRental[]): StatCard[] {
  return [
    { label: "Total Orders", value: rentals.length },
    {
      label: "Active Rentals",
      value: rentals.filter((r) =>
        ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"].includes(r.status)
      ).length,
    },
    {
      label: "Completed",
      value: rentals.filter((r) => r.status === "RETURNED").length,
    },
  ];
}

function providerStats(orders: IProviderOrder[]): StatCard[] {
  return [
    { label: "Total Orders", value: orders.length },
    {
      label: "Active Orders",
      value: orders.filter((o) =>
        ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"].includes(o.status)
      ).length,
    },
    {
      label: "Completed",
      value: orders.filter((o) => o.status === "RETURNED").length,
    },
  ];
}

function adminStats(
  totalOrders: number,
  totalGear: number,
  totalRentals: number
): StatCard[] {
  return [
    { label: "Total Orders",  value: totalOrders  },
    { label: "Gear Listings", value: totalGear    },
    { label: "Total Rentals", value: totalRentals },
  ];
}

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default async function ProfilePage() {
  const meRes = await getMe();
  const user = meRes?.data?.user || meRes?.data;

  if (!user) redirect("/login");

  const role: string = (user.role || "CUSTOMER").toUpperCase();

  // Fetch only what each role needs
  const [rentalsRes, providerOrders, adminRentalsRes, usersRes, gearRes] =
    await Promise.all([
      role === "CUSTOMER" ? getMyRentals()         : Promise.resolve(null),
      role === "PROVIDER" ? getProviderRentals()   : Promise.resolve([]),
      role === "ADMIN"    ? getAllRentalsAdmin()    : Promise.resolve(null),
      role === "ADMIN"    ? getAllUsers()           : Promise.resolve(null),
      getFeaturedGear(20),
    ]);

  // ------- CUSTOMER -------
  const rentals: IRental[] = Array.isArray(rentalsRes?.data)
    ? rentalsRes.data
    : [];

  // ------- PROVIDER -------
  const orders: IProviderOrder[] = Array.isArray(providerOrders)
    ? providerOrders
    : [];

  // ------- ADMIN ----------
  // Flatten rental orders from whatever shape the backend returns
  const rawAdminRentals: any[] = (() => {
    const d = adminRentalsRes;
    if (!d) return [];
    if (Array.isArray(d))           return d;
    if (Array.isArray(d.data))      return d.data;
    if (Array.isArray(d.data?.result)) return d.data.result;
    if (Array.isArray(d.data?.data))   return d.data.data;
    return [];
  })();

  const rawUsers: any[] = (() => {
    const d = usersRes;
    if (!d) return [];
    if (Array.isArray(d))           return d;
    if (Array.isArray(d.data))      return d.data;
    if (Array.isArray(d.data?.result)) return d.data.result;
    if (Array.isArray(d.data?.data))   return d.data.data;
    return [];
  })();

  // ------- Gear (all roles for suggestions) -------
  const allGear: IGear[] = (() => {
    const d = gearRes;
    if (!d) return [];
    if (Array.isArray(d.data)) return d.data;
    return [];
  })();

  // For admin gear count, fetch all gear (no limit) in parallel only for admin
  let adminGearCount = allGear.length;
  if (role === "ADMIN") {
    const fullGearRes = await getAllGear();
    const fullGear = Array.isArray(fullGearRes?.data) ? fullGearRes.data : [];
    adminGearCount = fullGear.length;
  }

  // ------- Build stats -------
  let stats: StatCard[];
  if (role === "ADMIN") {
    stats = adminStats(
      rawAdminRentals.length,   // Total Orders
      adminGearCount,            // Gear Listings
      rawAdminRentals.length     // Total Rentals (same source, different label)
    );
  } else if (role === "PROVIDER") {
    stats = providerStats(orders);
  } else {
    stats = customerStats(rentals);
  }

  const suggestions = pickSuggestions(rentals, allGear, role);
  const recommendationRentals = role === "CUSTOMER" ? rentals : ([] as IRental[]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account details and discover gear made for you.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-center"
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" /> Account Details
              </CardTitle>
              <CardDescription>Read-only account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="capitalize">{role.toLowerCase()} account</span>
              </div>
              {user.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Member since {formatDate(user.createdAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit profile */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Edit Profile</CardTitle>
              <CardDescription>Update your display name and avatar.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileEditForm user={user} />
            </CardContent>
          </Card>

          {/* Change password */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>
                Choose a strong password you don&apos;t use elsewhere.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>

        {/* Right column — AI recommendations */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> For You
              </CardTitle>
              <CardDescription>
                {role === "CUSTOMER"
                  ? "Gear picked based on your rental activity."
                  : "Popular gear on the platform."}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <AiRecommendation
                rentals={recommendationRentals}
                suggestions={suggestions}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
