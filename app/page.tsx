import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Plane, Globe, Building2, Clock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/layout/Container";
import { SearchBar } from "@/components/ui/SearchBar";
import { CountUpNumber } from "@/components/ui/CountUpNumber";
import { AirportCard } from "@/components/airports/AirportCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { HeroSection } from "@/components/home/HeroSection";
import type { Airport } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: {
    absolute: "SkyPortal — Every Airport. Every Flight. One Search.",
  },
  description:
    "Browse airports worldwide, search flights by number or route, and view real-time departure and arrival boards. Your comprehensive aviation information portal.",
  openGraph: {
    title: "SkyPortal — Every Airport. Every Flight. One Search.",
    description:
      "Browse airports worldwide, search flights by number or route, and view real-time departure and arrival boards.",
    type: "website",
    siteName: "SkyPortal",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkyPortal",
    description:
      "Browse airports worldwide, search flights by number or route, and view real-time departure and arrival boards.",
  },
};

const popularRoutes = [
  { from: "JFK", to: "LAX", slug: "new-york-john-f-kennedy" },
  { from: "LHR", to: "CDG", slug: "london-heathrow" },
  { from: "DXB", to: "SIN", slug: "dubai" },
  { from: "SFO", to: "NRT", slug: "san-francisco" },
  { from: "LAX", to: "HNL", slug: "los-angeles" },
  { from: "ORD", to: "MIA", slug: "chicago-ohare" },
  { from: "ATL", to: "LHR", slug: "atlanta-hartsfield-jackson" },
  { from: "SIN", to: "HKG", slug: "singapore-changi" },
  { from: "CDG", to: "FCO", slug: "paris-charles-de-gaulle" },
  { from: "FRA", to: "JFK", slug: "frankfurt" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero with animated dot grid */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
        <div
          className="absolute inset-0 animate-pulse-slow"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(59,130,246,0.15) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/0 via-bg-primary/60 to-bg-primary" />
        <Container className="relative z-10">
          <HeroSection />
          <div className="mt-10 flex justify-center">
            <SearchBar className="max-w-[600px]" />
          </div>
        </Container>
      </section>

      {/* Quick stats bar */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* Featured airports grid */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
                Featured Airports
              </h2>
              <p className="mt-2 text-text-secondary">
                Major hubs and international gateways worldwide
              </p>
            </div>
            <Link
              href="/airports?major=true"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-accent-blue hover:underline"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Suspense fallback={<AirportsGridSkeleton />}>
            <FeaturedAirportsGrid />
          </Suspense>
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/airports?major=true"
              className="text-sm text-accent-blue hover:underline"
            >
              View all airports &rarr;
            </Link>
          </div>
        </Container>
      </section>

      {/* Popular routes */}
      <section className="py-16 sm:py-20 border-t border-border-subtle">
        <Container>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-6">
            Popular Routes
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {popularRoutes.map((route) => (
              <Link
                key={`${route.from}-${route.to}`}
                href={`/airports/${route.slug}`}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-bg-secondary border border-border-subtle text-sm font-medium text-text-primary hover:border-border-hover hover:bg-bg-hover transition-all group"
              >
                <span className="font-mono text-accent-blue font-semibold">
                  {route.from}
                </span>
                <Plane className="h-3.5 w-3.5 text-text-tertiary group-hover:text-accent-blue transition-colors" />
                <span className="font-mono text-accent-blue font-semibold">
                  {route.to}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

/* ── Async data sections ── */

async function StatsSection() {
  const supabase = await createClient();

  const [airportsRes, airlinesRes, countriesRes] = await Promise.all([
    supabase.from("airports").select("*", { count: "exact", head: true }),
    supabase.from("airlines").select("*", { count: "exact", head: true }),
    supabase.from("airports").select("*"),
  ]);

  const airportCount = airportsRes.count ?? 0;
  const airlineCount = airlinesRes.count ?? 0;
  const countriesData = countriesRes.data as Airport[] | null;
  const countryCount = new Set(
    countriesData?.map((a) => a.country_code) ?? []
  ).size;

  const stats = [
    { end: airportCount, suffix: "+", label: "Airports", Icon: Building2 },
    { end: airlineCount, suffix: "+", label: "Airlines", Icon: Plane },
    { end: countryCount, suffix: "+", label: "Countries", Icon: Globe },
  ];

  return (
    <section className="border-y border-border-subtle bg-bg-secondary/50 backdrop-blur-sm">
      <Container className="py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/10">
                  <stat.Icon className="h-5 w-5 text-accent-blue" />
                </div>
              </div>
              <CountUpNumber
                end={stat.end}
                suffix={stat.suffix}
                className="text-2xl font-bold text-text-primary font-heading"
              />
              <div className="text-xs text-text-secondary mt-1">
                {stat.label}
              </div>
            </div>
          ))}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-green/10">
                <Clock className="h-5 w-5 text-accent-green" />
              </div>
            </div>
            <div className="text-2xl font-bold text-text-primary font-heading">
              Live
            </div>
            <div className="text-xs text-text-secondary mt-1">
              Updated Every 5 Min
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

async function FeaturedAirportsGrid() {
  const supabase = await createClient();
  const { data: airports } = await supabase
    .from("airports")
    .select("*")
    .eq("is_major", true)
    .limit(12);

  if (!airports?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {(airports as Airport[]).map((airport) => (
        <AirportCard key={airport.id} airport={airport} />
      ))}
    </div>
  );
}

/* ── Loading skeletons ── */

function StatsLoadingSkeleton() {
  return (
    <section className="border-y border-border-subtle bg-bg-secondary/50">
      <Container className="py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton
                variant="rectangular"
                className="h-10 w-10 rounded-xl"
              />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function AirportsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-bg-secondary border border-border-subtle p-5"
        >
          <div className="flex justify-between mb-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
