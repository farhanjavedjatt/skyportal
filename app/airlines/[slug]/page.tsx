import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, Plane, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Airline, Airport } from "@/lib/supabase/types";
import { Container } from "@/components/layout/Container";
import { PageTransition } from "@/components/layout/PageTransition";
import { AirlineHeader } from "@/components/airlines/AirlineHeader";
import { AirportCard } from "@/components/airports/AirportCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const revalidate = 86400;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("airlines")
    .select("*")
    .eq("slug", slug)
    .single();

  const airline = data as Airline | null;
  if (!airline) return { title: "Airline Not Found" };

  return {
    title: `${airline.name} (${airline.iata_code}) — Flights, Routes & Fleet`,
    description: `View ${airline.name} (${airline.iata_code}) routes, hub airports, fleet information, and more on SkyPortal.`,
  };
}

export default async function AirlineDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: airlineData } = await supabase
    .from("airlines")
    .select("*")
    .eq("slug", slug)
    .single();

  const airline = airlineData as Airline | null;
  if (!airline) notFound();

  const [hubResult, destinationsResult] = await Promise.all([
    airline.hub_airports.length
      ? supabase
          .from("airports")
          .select("*")
          .in("iata_code", airline.hub_airports)
      : null,
    supabase
      .from("airport_airlines")
      .select("*, airports(*)")
      .eq("airline_id", airline.id),
  ]);

  const hubAirports = (hubResult?.data as Airport[] | null) ?? [];

  type AirportAirlineWithAirport = {
    id: string;
    airport_id: string;
    airline_id: string;
    terminal: string | null;
    is_hub: boolean;
    airports: Airport;
  };

  const destinationRows = (destinationsResult.data ?? []) as unknown as AirportAirlineWithAirport[];
  const destinations = destinationRows
    .filter((d) => d.airports)
    .sort((a, b) => a.airports.city.localeCompare(b.airports.city));

  const hubIatas = new Set(airline.hub_airports);

  return (
    <Container className="py-10 sm:py-14">
      <PageTransition>
        <AirlineHeader airline={airline} />

        {/* ── Hub Airports ── */}
        {hubAirports.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="h-5 w-5 text-accent-blue" />
              <h2 className="font-heading text-xl font-semibold text-text-primary">
                Hub Airports
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hubAirports.map((airport) => (
                <AirportCard key={airport.id} airport={airport} />
              ))}
            </div>
          </section>
        )}

        {/* ── Destinations ── */}
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="h-5 w-5 text-accent-blue" />
            <h2 className="font-heading text-xl font-semibold text-text-primary">
              Destinations
            </h2>
            {destinations.length > 0 && (
              <span className="text-sm text-text-tertiary">
                ({destinations.length} airports)
              </span>
            )}
          </div>

          {destinations.length === 0 ? (
            <EmptyState
              title="No destinations found"
              message="Destination data is not yet available for this airline."
              icon={<Plane className="h-7 w-7" />}
            />
          ) : (
            <div className="rounded-2xl bg-bg-secondary border border-border-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                        Airport
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary hidden sm:table-cell">
                        City
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary hidden md:table-cell">
                        Country
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary hidden lg:table-cell">
                        Terminal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                        Flights
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {destinations.map((dest, idx) => {
                      const airport = dest.airports;
                      const isHub = hubIatas.has(airport.iata_code);

                      return (
                        <tr
                          key={dest.id}
                          className={`border-b border-border-subtle/50 transition-colors hover:bg-bg-hover/50 ${
                            idx % 2 === 1 ? "bg-bg-tertiary/20" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/airports/${airport.slug}`}
                              className="group/link flex items-center gap-2"
                            >
                              <span className="font-mono font-semibold text-accent-blue">
                                {airport.iata_code}
                              </span>
                              <span className="text-text-primary group-hover/link:text-accent-blue transition-colors truncate max-w-[200px]">
                                {airport.name}
                              </span>
                            </Link>
                          </td>

                          <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">
                            {airport.city}
                          </td>

                          <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                            {airport.country}
                          </td>

                          <td className="px-4 py-3 font-mono text-text-secondary hidden lg:table-cell">
                            {dest.terminal ?? "—"}
                          </td>

                          <td className="px-4 py-3">
                            {isHub ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent-amber/10 text-accent-amber text-[10px] font-semibold uppercase tracking-wider">
                                Hub
                              </span>
                            ) : (
                              <span className="text-xs text-text-tertiary">
                                Destination
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <Link
                              href={`/airports/${airport.slug}/departures`}
                              className="inline-flex items-center gap-1 text-xs text-accent-blue hover:underline"
                            >
                              View
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ── Website ── */}
        {airline.website && (
          <section className="mt-10">
            <a
              href={airline.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-subtle text-sm text-text-secondary hover:text-accent-blue hover:border-border-hover transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Visit {airline.name} website
            </a>
          </section>
        )}
      </PageTransition>
    </Container>
  );
}
