import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Plane } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/layout/Container";
import { PageTransition } from "@/components/layout/PageTransition";
import { AirportHeader } from "@/components/airports/AirportHeader";
import { AirportTabNav } from "@/components/airports/AirportTabNav";
import { AirlineCard } from "@/components/airlines/AirlineCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Airport, Airline, AirportAirline } from "@/lib/supabase/types";

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

  if (!data) return { title: "Airlines" };

  const airport = data as Airport;

  return {
    title: `Airlines at ${airport.name} (${airport.iata_code})`,
    description: `Airlines operating at ${airport.name} (${airport.iata_code}) in ${airport.city}, ${airport.country}. View terminals, hub status, and airline details.`,
  };
}

export default async function AirportAirlinesPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: airportData } = await supabase
    .from("airports")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!airportData) notFound();
  const airport = airportData as Airport;

  const { data: joinData } = await supabase
    .from("airport_airlines")
    .select("*, airlines(*)")
    .eq("airport_id", airport.id);

  type WithAirline = AirportAirline & { airlines: Airline };
  const airportAirlines = (joinData ?? []) as unknown as WithAirline[];

  return (
    <PageTransition>
      <Container className="py-8 sm:py-12 space-y-8">
        <AirportHeader airport={airport} />
        <AirportTabNav slug={slug} activeTab="airlines" />

        {airportAirlines.length === 0 ? (
          <EmptyState
            title="No airlines found"
            message={`No airlines currently listed for ${airport.name}.`}
            icon={<Plane className="h-7 w-7" />}
          />
        ) : (
          <div>
            <p className="text-sm text-text-secondary mb-6">
              {airportAirlines.length} airline
              {airportAirlines.length !== 1 ? "s" : ""} operating at{" "}
              {airport.name}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {airportAirlines.map((aa) => {
                if (!aa.airlines) return null;
                return (
                  <div key={aa.id} className="flex flex-col gap-2">
                    <AirlineCard airline={aa.airlines} />
                    {(aa.terminal || aa.is_hub) && (
                      <div className="flex items-center gap-2 px-2">
                        {aa.is_hub && (
                          <span className="px-2 py-0.5 rounded-full bg-accent-amber/10 text-accent-amber text-[10px] font-semibold uppercase tracking-wider">
                            Hub
                          </span>
                        )}
                        {aa.terminal && (
                          <span className="px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary text-[10px] font-medium">
                            Terminal {aa.terminal}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Container>
    </PageTransition>
  );
}
