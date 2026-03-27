import type { Metadata } from "next";
import Link from "next/link";
import { Plane, Info, Clock, Copy, AlertTriangle } from "lucide-react";
import { getFlightStatus } from "@/lib/aviation-api";
import { createClient } from "@/lib/supabase/server";
import type { Airport, FlightSchedule } from "@/lib/supabase/types";
import { formatTime, formatDate, getDelayLabel } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { PageTransition } from "@/components/layout/PageTransition";
import { CodeDisplay } from "@/components/ui/CodeDisplay";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FlightStatusTimeline } from "@/components/flights/FlightStatusTimeline";
import { FlightRouteViz } from "@/components/flights/FlightRouteViz";
import { FlightDetailClient } from "./_components/FlightDetailClient";

export const revalidate = 120;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function calculateProgress(flight: FlightSchedule): number {
  if (flight.status === "landed") return 1;
  if (flight.status !== "active") return 0;

  const depTime =
    flight.dep_actual ?? flight.dep_estimated ?? flight.dep_scheduled;
  const arrTime = flight.arr_estimated ?? flight.arr_scheduled;

  if (!depTime || !arrTime) return 0.5;

  const now = Date.now();
  const dep = new Date(depTime).getTime();
  const arr = new Date(arrTime).getTime();

  if (arr <= dep) return 0.5;
  return Math.max(0, Math.min(1, (now - dep) / (arr - dep)));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata(props: {
  params: Promise<{ flightNumber: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { flightNumber } = await props.params;
  const sp = await props.searchParams;
  const date = typeof sp.date === "string" ? sp.date : todayISO();

  const flights = await getFlightStatus(flightNumber, date);
  const flight = flights[0];

  if (!flight) {
    return { title: `Flight ${flightNumber.toUpperCase()} Status` };
  }

  return {
    title: `Flight ${flight.flight_iata} Status — ${flight.dep_iata} to ${flight.arr_iata}`,
    description: `Track ${flight.flight_iata} from ${flight.dep_iata} to ${flight.arr_iata}. Real-time flight status, delays, gate information, and estimated arrival.`,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function FlightDetailPage(props: {
  params: Promise<{ flightNumber: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { flightNumber } = await props.params;
  const sp = await props.searchParams;
  const date = typeof sp.date === "string" ? sp.date : todayISO();

  const flights = await getFlightStatus(flightNumber, date);

  if (!flights.length) {
    return (
      <Container className="py-20">
        <EmptyState
          title="Flight not found"
          message={`No results for ${flightNumber.toUpperCase()} on ${formatDate(date)}. Double-check the flight number and date.`}
          icon={<Plane className="h-7 w-7" />}
        />
      </Container>
    );
  }

  const flight = flights[0];
  const hasCodeshares = flights.length > 1;
  const isActive =
    flight.status === "active" ||
    flight.status === "boarding" ||
    flight.status === "departed";
  const progress = calculateProgress(flight);

  // Fetch airport details for display names and linking
  const supabase = await createClient();
  const [depResult, arrResult] = await Promise.all([
    supabase
      .from("airports")
      .select("*")
      .eq("iata_code", flight.dep_iata)
      .single(),
    supabase
      .from("airports")
      .select("*")
      .eq("iata_code", flight.arr_iata)
      .single(),
  ]);

  const depAirport = depResult.data as Airport | null;
  const arrAirport = arrResult.data as Airport | null;
  const depName = depAirport?.name ?? flight.dep_iata;
  const arrName = arrAirport?.name ?? flight.arr_iata;

  return (
    <Container className="py-10 sm:py-14">
      <FlightDetailClient isActive={isActive}>
        <PageTransition>
          {/* ── Codeshare Banner ── */}
          {hasCodeshares && (
            <div className="mb-6 flex items-start gap-2 rounded-xl bg-accent-blue/10 border border-accent-blue/20 px-4 py-3 text-sm text-accent-blue">
              <Copy className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                This flight has {flights.length - 1} codeshare
                {flights.length - 1 > 1 ? "s" : ""}:{" "}
                {flights
                  .slice(1)
                  .map((f) => f.flight_iata)
                  .join(", ")}
              </span>
            </div>
          )}

          {/* ── Flight Header ── */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <CodeDisplay code={flight.flight_iata} size="lg" />
              <StatusBadge
                status={flight.status}
                delay={flight.dep_delay_minutes ?? undefined}
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-secondary">
              {flight.airline_name && (
                <span className="text-text-primary font-medium">
                  {flight.airline_name}
                </span>
              )}
              <span className="text-text-tertiary">·</span>
              <span>{formatDate(date)}</span>
            </div>
          </div>

          {/* ── Route Visualization ── */}
          <div className="rounded-2xl bg-bg-secondary border border-border-subtle p-6 mb-6">
            <FlightRouteViz
              departureCode={flight.dep_iata}
              departureName={depAirport?.city ?? depName}
              arrivalCode={flight.arr_iata}
              arrivalName={arrAirport?.city ?? arrName}
              status={flight.status}
              progress={progress}
            />
          </div>

          {/* ── Departure & Arrival Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <AirportInfoCard
              type="departure"
              airport={depAirport}
              iata={flight.dep_iata}
              name={depName}
              terminal={flight.dep_terminal}
              gate={flight.dep_gate}
              scheduled={flight.dep_scheduled}
              estimated={flight.dep_estimated}
              actual={flight.dep_actual}
              delay={flight.dep_delay_minutes}
            />
            <AirportInfoCard
              type="arrival"
              airport={arrAirport}
              iata={flight.arr_iata}
              name={arrName}
              terminal={flight.arr_terminal}
              gate={flight.arr_gate}
              baggage={flight.arr_baggage}
              scheduled={flight.arr_scheduled}
              estimated={flight.arr_estimated}
              actual={flight.arr_actual}
              delay={flight.arr_delay_minutes}
            />
          </div>

          {/* ── Timeline & Details ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-bg-secondary border border-border-subtle p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-text-tertiary" />
                <h3 className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Flight Progress
                </h3>
              </div>
              <FlightStatusTimeline
                currentStatus={flight.status}
                departureTime={
                  (flight.dep_actual ??
                    flight.dep_estimated ??
                    flight.dep_scheduled) ||
                  undefined
                }
                arrivalTime={
                  (flight.arr_actual ??
                    flight.arr_estimated ??
                    flight.arr_scheduled) ||
                  undefined
                }
              />
            </div>

            <div className="rounded-2xl bg-bg-secondary border border-border-subtle p-5">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-4 w-4 text-text-tertiary" />
                <h3 className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                  Flight Details
                </h3>
              </div>
              <dl className="space-y-3 text-sm">
                {flight.aircraft_icao && (
                  <DetailRow label="Aircraft" value={flight.aircraft_icao} mono />
                )}
                {flight.aircraft_registration && (
                  <DetailRow
                    label="Registration"
                    value={flight.aircraft_registration}
                    mono
                  />
                )}
                {flight.flight_icao && (
                  <DetailRow label="ICAO" value={flight.flight_icao} mono />
                )}
                <DetailRow label="Airline IATA" value={flight.airline_iata} mono />
                {flight.codeshare_flight && (
                  <DetailRow label="Codeshare" value={flight.codeshare_flight} />
                )}
                <DetailRow label="Date" value={formatDate(flight.flight_date)} />
              </dl>
            </div>
          </div>
        </PageTransition>
      </FlightDetailClient>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// Sub-components (server-only, co-located)
// ---------------------------------------------------------------------------

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className={mono ? "font-mono text-text-primary" : "text-text-primary"}>
        {value}
      </dd>
    </div>
  );
}

function AirportInfoCard({
  type,
  airport,
  iata,
  name,
  terminal,
  gate,
  baggage,
  scheduled,
  estimated,
  actual,
  delay,
}: {
  type: "departure" | "arrival";
  airport: { name: string; slug: string; city: string } | null;
  iata: string;
  name: string;
  terminal: string | null;
  gate: string | null;
  baggage?: string | null;
  scheduled: string | null;
  estimated: string | null;
  actual: string | null;
  delay: number | null;
}) {
  const isDep = type === "departure";

  return (
    <div className="rounded-2xl bg-bg-secondary border border-border-subtle p-5">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`h-2 w-2 rounded-full ${isDep ? "bg-accent-blue" : "bg-accent-green"}`}
        />
        <h3 className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
          {isDep ? "Departure" : "Arrival"}
        </h3>
      </div>

      <div className="mb-3">
        {airport ? (
          <Link
            href={`/airports/${airport.slug}`}
            className="text-text-primary font-semibold hover:text-accent-blue transition-colors"
          >
            {name}
          </Link>
        ) : (
          <span className="text-text-primary font-semibold">{name}</span>
        )}
        <span className="ml-2 font-mono text-accent-blue font-medium">
          {iata}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        {terminal && (
          <div className="flex justify-between">
            <span className="text-text-tertiary">Terminal</span>
            <span className="font-mono text-text-primary">{terminal}</span>
          </div>
        )}
        {gate && (
          <div className="flex justify-between">
            <span className="text-text-tertiary">Gate</span>
            <span className="font-mono text-text-primary">{gate}</span>
          </div>
        )}
        {baggage && (
          <div className="flex justify-between">
            <span className="text-text-tertiary">Baggage</span>
            <span className="font-mono text-text-primary">{baggage}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-text-tertiary">Scheduled</span>
          <span className="font-mono text-text-primary">
            {formatTime(scheduled)}
          </span>
        </div>
        {estimated && (
          <div className="flex justify-between">
            <span className="text-text-tertiary">Estimated</span>
            <span className="font-mono text-text-primary">
              {formatTime(estimated)}
            </span>
          </div>
        )}
        {actual && (
          <div className="flex justify-between">
            <span className="text-text-tertiary">Actual</span>
            <span className="font-mono text-accent-green">
              {formatTime(actual)}
            </span>
          </div>
        )}
        {delay != null && delay > 0 && (
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-1 text-xs text-accent-amber">
              <AlertTriangle className="h-3 w-3" />
              Delayed {getDelayLabel(delay)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
