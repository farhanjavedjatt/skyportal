import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, ArrowDownRight, Plane } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAirportDepartures, getAirportArrivals } from "@/lib/aviation-api";
import { Container } from "@/components/layout/Container";
import { PageTransition } from "@/components/layout/PageTransition";
import { AirportHeader } from "@/components/airports/AirportHeader";
import { AirportContactCard } from "@/components/airports/AirportContactCard";
import { AirportTabNav } from "@/components/airports/AirportTabNav";
import { AirlineCard } from "@/components/airlines/AirlineCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatTime, formatLocalDateTime } from "@/lib/utils";
import type {
  Airport,
  Airline,
  AirportAirline,
  FlightSchedule,
} from "@/lib/supabase/types";

export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("airports")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Airport Not Found" };

  const a = data as Airport;
  return {
    title: `${a.name} (${a.iata_code}) — Airport Info, Flights & Helpline`,
    description: `${a.name} (${a.iata_code}/${a.icao_code}) in ${a.city}, ${a.country}. Live departures, arrivals, airlines, terminal info${a.phone_local ? `, helpline: ${a.phone_local}` : ""}.`,
    openGraph: {
      title: `${a.name} (${a.iata_code}) — SkyPortal`,
      description: `Airport information, live flights, and contact details for ${a.name} in ${a.city}, ${a.country}.`,
    },
  };
}

export default async function AirportDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("airports")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) notFound();
  const airport = data as Airport;

  return (
    <PageTransition>
      <Container className="py-8 sm:py-12 space-y-8">
        <AirportHeader airport={airport} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AirportTabNav slug={slug} activeTab="overview" />

            <Suspense fallback={<FlightPreviewSkeleton label="Departures" />}>
              <DeparturePreview airport={airport} />
            </Suspense>

            <Suspense fallback={<FlightPreviewSkeleton label="Arrivals" />}>
              <ArrivalPreview airport={airport} />
            </Suspense>

            <Suspense fallback={<AirlinesSkeleton />}>
              <AirlinesPreview airport={airport} />
            </Suspense>
          </div>

          <aside className="space-y-6">
            <AirportContactCard airport={airport} />

            <div className="rounded-2xl bg-bg-secondary border border-border-subtle p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                Quick Links
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/airports/${slug}/departures`}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-blue transition-colors"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Full Departure Board
                </Link>
                <Link
                  href={`/airports/${slug}/arrivals`}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-blue transition-colors"
                >
                  <ArrowDownRight className="h-4 w-4" />
                  Full Arrival Board
                </Link>
                <Link
                  href={`/airports/${slug}/airlines`}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-blue transition-colors"
                >
                  <Plane className="h-4 w-4" />
                  All Airlines
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </PageTransition>
  );
}

/* ── Async data sections ── */

async function DeparturePreview({ airport }: { airport: Airport }) {
  const now = new Date();
  const later = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const from = formatLocalDateTime(now, airport.timezone);
  const to = formatLocalDateTime(later, airport.timezone);
  const flights = await getAirportDepartures(airport.iata_code, from, to);

  return (
    <FlightPreviewTable
      label="Upcoming Departures"
      type="departures"
      flights={flights.slice(0, 5)}
      timezone={airport.timezone}
      slug={airport.slug}
    />
  );
}

async function ArrivalPreview({ airport }: { airport: Airport }) {
  const now = new Date();
  const later = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const from = formatLocalDateTime(now, airport.timezone);
  const to = formatLocalDateTime(later, airport.timezone);
  const flights = await getAirportArrivals(airport.iata_code, from, to);

  return (
    <FlightPreviewTable
      label="Upcoming Arrivals"
      type="arrivals"
      flights={flights.slice(0, 5)}
      timezone={airport.timezone}
      slug={airport.slug}
    />
  );
}

function FlightPreviewTable({
  label,
  type,
  flights,
  timezone,
  slug,
}: {
  label: string;
  type: "departures" | "arrivals";
  flights: FlightSchedule[];
  timezone: string;
  slug: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          {label}
        </h2>
        <Link
          href={`/airports/${slug}/${type}`}
          className="text-xs text-accent-blue hover:underline"
        >
          View all &rarr;
        </Link>
      </div>

      {flights.length === 0 ? (
        <p className="text-sm text-text-secondary py-8 text-center rounded-xl border border-border-subtle bg-bg-secondary">
          No {type} in the next 6 hours.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-subtle bg-bg-secondary">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Time
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Flight
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  {type === "departures" ? "To" : "From"}
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {flights.map((flight, i) => (
                <tr
                  key={flight.id || `${flight.flight_iata}-${i}`}
                  className="border-b border-border-subtle/50 last:border-b-0 hover:bg-bg-hover/30 transition-colors"
                >
                  <td className="px-4 py-2.5 font-mono text-text-primary">
                    {formatTime(
                      type === "departures"
                        ? flight.dep_scheduled
                        : flight.arr_scheduled,
                      timezone
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono font-medium text-accent-blue">
                      {flight.flight_iata}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono font-medium text-text-primary">
                      {type === "departures"
                        ? flight.arr_iata
                        : flight.dep_iata}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      status={flight.status}
                      delay={
                        (type === "departures"
                          ? flight.dep_delay_minutes
                          : flight.arr_delay_minutes) ?? undefined
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

async function AirlinesPreview({ airport }: { airport: Airport }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("airport_airlines")
    .select("*, airlines(*)")
    .eq("airport_id", airport.id)
    .limit(8);

  type WithAirline = AirportAirline & { airlines: Airline };
  const entries = (data ?? []) as unknown as WithAirline[];
  const airlines = entries.map((aa) => aa.airlines).filter(Boolean);

  if (airlines.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          Airlines
        </h2>
        <Link
          href={`/airports/${airport.slug}/airlines`}
          className="text-xs text-accent-blue hover:underline"
        >
          View all &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {airlines.map((airline) => (
          <AirlineCard key={airline.id} airline={airline} />
        ))}
      </div>
    </div>
  );
}

/* ── Loading skeletons ── */

function FlightPreviewSkeleton({ label }: { label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          {label}
        </h2>
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="rounded-xl border border-border-subtle bg-bg-secondary p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AirlinesSkeleton() {
  return (
    <div>
      <Skeleton className="h-6 w-24 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-bg-secondary border border-border-subtle p-5"
          >
            <div className="flex gap-4 mb-3">
              <Skeleton
                variant="rectangular"
                className="h-10 w-10 rounded-lg"
              />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
