import { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Leaf,
  Users,
  Compass,
  Award,
  ArrowRight,
  CheckCircle2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us | Gear Up - Premium Outdoor & Equipment Rental Platform",
  description:
    "Learn about Gear Up, the premier peer-to-peer equipment rental platform connecting adventure seekers with high-quality gear providers.",
};

const STATS = [
  { label: "Verified Gear Listings", value: "5,000+" },
  { label: "Happy Adventurers", value: "12,000+" },
  { label: "Community Rating", value: "4.9 / 5" },
  { label: "Cities Served", value: "25+" },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Quality & Safety Certified",
    description:
      "Every piece of equipment is thoroughly inspected and verified by our provider network to ensure maximum reliability during your adventures.",
  },
  {
    icon: Zap,
    title: "Seamless Booking",
    description:
      "Instant reservation system with transparent pricing, easy provider communication, and automated order tracking.",
  },
  {
    icon: Leaf,
    title: "Sustainable Sharing Economy",
    description:
      "By sharing gear instead of buying single-use items, our community actively reduces manufacturing waste and carbon footprints.",
  },
  {
    icon: Users,
    title: "Empowering Providers",
    description:
      "We enable equipment owners to monetize unused gear safely with comprehensive rental management tools and identity verification.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Explore & Reserve",
    description: "Browse thousands of cameras, camping gear, drones, and sports equipment tailored to your destination.",
  },
  {
    step: "02",
    title: "Instant Confirmation",
    description: "Connect directly with trusted providers and receive quick confirmation for your preferred dates.",
  },
  {
    step: "03",
    title: "Pickup & Gear Up",
    description: "Collect your checked equipment, gear up, and focus on capturing memories and pushing limits.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/50 via-background to-background pt-16 pb-20">
        <div className="container mx-auto px-4 text-center max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Compass className="h-4 w-4" />
            ABOUT GEAR UP
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
            Powering Outdoor Adventures & Premium Gear Sharing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gear Up is the premier equipment rental marketplace designed to democratize access to high-end outdoor, photography, and sports gear without the burden of expensive ownership.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button render={<Link href="/gear">Browse Available Gear</Link>} nativeButton={false} className="h-11 px-6 font-semibold" />
            <Button render={<Link href="/contact">Get in Touch</Link>} variant="outline" nativeButton={false} className="h-11 px-6 font-semibold" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b bg-muted/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm text-center space-y-2 hover:border-primary/40 transition-colors"
              >
                <p className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story & Mission Section */}
      <section className="py-20 border-b">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Award className="h-4 w-4" />
                OUR MISSION
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Making Premium Equipment Accessible to Everyone
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Founded with a passion for exploration and high-performance equipment, Gear Up bridges the gap between gear owners and outdoor enthusiasts. We believe nobody should compromise on equipment quality due to high upfront purchase costs.
              </p>
              <ul className="space-y-3">
                {[
                  "Verified provider verification and anti-fraud protection",
                  "Flexible rental terms from daily to multi-week rentals",
                  "Comprehensive item tracking and secure digital payments",
                  "Dedicated support team available around the clock",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <Package className="h-10 w-10 text-primary" />
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/10 text-zinc-300">
                  EST. 2026
                </span>
              </div>
              <blockquote className="text-lg font-medium leading-relaxed italic text-zinc-200">
                &ldquo;Gear Up isn&apos;t just a rental portal; it&apos;s an ecosystem built by outdoor lovers, filmmakers, and explorers who believe in sharing great experiences.&rdquo;
              </blockquote>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                <span>Gear Up Leadership Team</span>
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 border-b bg-muted/10">
        <div className="container mx-auto px-4 max-w-6xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Why Choose Gear Up</h2>
            <p className="text-muted-foreground text-sm">
              We hold ourselves to high standards to ensure every equipment rental is smooth, safe, and memorable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val) => {
              const Icon = val.icon;
              return (
                <div
                  key={val.title}
                  className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">{val.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 border-b">
        <div className="container mx-auto px-4 max-w-6xl space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">How Gear Up Works</h2>
            <p className="text-muted-foreground text-sm">
              Renting your favorite equipment takes only three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="relative p-8 rounded-xl border bg-card shadow-sm space-y-4"
              >
                <span className="text-4xl font-black text-primary/30 font-mono">
                  {step.step}
                </span>
                <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="rounded-2xl bg-primary text-primary-foreground p-8 sm:p-12 text-center space-y-6 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Rent Your Next Equipment?
            </h2>
            <p className="text-primary-foreground/90 max-w-xl mx-auto text-sm sm:text-base">
              Join thousands of explorers and providers already benefiting from the Gear Up network.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                render={<Link href="/gear">Browse All Gear <ArrowRight className="ml-2 h-4 w-4" /></Link>}
                variant="secondary"
                nativeButton={false}
                className="h-11 px-8 font-semibold shadow"
              />
              <Button
                render={<Link href="/register">Become a Provider</Link>}
                variant="outline"
                nativeButton={false}
                className="h-11 px-8 font-semibold bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
