"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  Users,
  Sparkles,
  Layers,
} from "lucide-react";

import { logout } from "@/service/logout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface DashboardShellProps {
  user: any;
  children: React.ReactNode;
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = user?.data?.user || user?.data || user;
  const role = (currentUser?.role || "PROVIDER").toUpperCase();
  const userName = currentUser?.name || "User";
  const userEmail = currentUser?.email || "";

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
      toast.success("Logged out successfully");
      window.location.href = "/login";
    });
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Define sidebar navigation links based on user role
  const getNavItems = () => {
    if (role === "ADMIN") {
      return [
        { label: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
        { label: "User Management", href: "/admin-dashboard/users", icon: Users },
        { label: "Gear Inventory", href: "/gear", icon: Package },
        { label: "Rental Orders", href: "/admin-dashboard/orders", icon: ShoppingBag },
        { label: "Settings", href: "/profile", icon: Settings },
      ];
    }

    if (role === "PROVIDER") {
      return [
        { label: "Dashboard", href: "/provider-dashboard", icon: LayoutDashboard },
        { label: "Inventory", href: "/provider-dashboard/inventory", icon: Layers },
        { label: "Rental Orders", href: "/provider-dashboard/orders", icon: ShoppingBag },
        { label: "Add New Gear", href: "/provider-dashboard/gear/new", icon: Package },
        { label: "Browse Store", href: "/gear", icon: Sparkles },
        { label: "Settings", href: "/profile", icon: Settings },
      ];
    }

    // Default Customer items
    return [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Browse Gear", href: "/gear", icon: Sparkles },
      { label: "My Orders", href: "/dashboard#orders", icon: ShoppingBag },
      { label: "Profile", href: "/profile", icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-2 sm:p-4 md:p-6 font-sans">
      <div className="mx-auto max-w-[1600px] bg-zinc-100 dark:bg-zinc-950 rounded-3xl overflow-hidden flex flex-col md:flex-row gap-4 min-h-[calc(100vh-2rem)]">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between bg-zinc-950 text-white p-4 rounded-2xl shadow-md border border-zinc-800">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="text-white text-xl font-black">⚡</span> GearUp
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-zinc-900 text-white focus:outline-none border border-zinc-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar Container */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 text-white p-6 rounded-r-3xl md:rounded-3xl flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } shadow-2xl md:shadow-none border border-zinc-900`}
        >
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                ⚡
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight text-white">GearUp</h1>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
                  {role} PORTAL
                </p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" &&
                    item.href !== "/provider-dashboard" &&
                    item.href !== "/admin-dashboard" &&
                    item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-zinc-800 text-white font-semibold border border-zinc-700/60 shadow-sm"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-zinc-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Logout Area */}
          <div className="pt-6 border-t border-zinc-850 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-9 w-9 border border-zinc-700">
                <AvatarImage src={currentUser?.profileImage || currentUser?.profile?.profilePicture} />
                <AvatarFallback className="bg-zinc-800 text-white text-xs font-bold">
                  {getUserInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{userName}</p>
                <p className="text-[10px] text-zinc-400 truncate">{userEmail}</p>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              disabled={isPending}
              className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold rounded-full h-10 shadow-sm border-0 gap-2 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </aside>

        {/* Overlay backdrop for mobile menu */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          />
        )}

        {/* Main Workspace Panel */}
        <main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-950 rounded-3xl space-y-4">
          {/* Top Header Bar */}
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            {/* Search Input Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search..."
                className="pl-10 pr-4 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-sm focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:bg-white transition-all text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Quick Actions & Role Indicator */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="hidden sm:flex items-center gap-2 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white dark:bg-zinc-950 animate-ping" />
                <span>{role} MODE</span>
              </div>

              <button className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-200 transition-colors border border-zinc-200 dark:border-zinc-700">
                <Bell className="w-4 h-4" />
              </button>

              <div className="h-9 px-3 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center gap-2 text-xs font-bold shadow-sm">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentUser?.profileImage || currentUser?.profile?.profilePicture} />
                  <AvatarFallback className="bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950 text-[10px]">
                    {getUserInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline line-clamp-1 max-w-[100px]">{userName}</span>
              </div>
            </div>
          </header>

          {/* Dynamic Page Content */}
          <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-zinc-200/80 dark:border-zinc-800 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
