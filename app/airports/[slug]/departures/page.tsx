import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAirportDepartures } from "@/lib/aviation-api";
import { formatLocalDateTime } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { PageTransition } from "@/components/layout/PageTransition";
import { AirportHeader } from "@/components/airports/AirportHeader";
import { AirportTabNav } from "@/components/airports/AirportTabNav";
import { FlightBoard } from "@/components/flights/FlightBoard";
import type { Airport } from "@/lib/supabase/types";

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

  if (!data) return { title: "Departures" };

  const airport = data as Airport;

  return {
    title: `Departures — ${airport.name} (${airport.iata_code})`,
    description: `Live departure board for ${airport.name} (${airport.iata_code}) in ${airport.city}, ${airport.country}. Real-time flight status, gates, and delays.`,
  };
}

export default async function DeparturesPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("airports")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) notFound();
  const airport = data as Airport;

  const now = new Date();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const from = formatLocalDateTime(sixHoursAgo, airport.timezone);
  const to = formatLocalDateTime(twelveHoursLater, airport.timezone);

  const flights = await getAirportDepartures(airport.iata_code, from, to);

  return (
    <PageTransition>
      <Container className="py-8 sm:py-12 space-y-8">
        <AirportHeader airport={airport} />
        <AirportTabNav slug={slug} activeTab="departures" />
        <FlightBoard
          flights={flights}
          type="departures"
          airportTimezone={airport.timezone}
          airportCode={airport.iata_code}
        />
      </Container>
    </PageTransition>
  );
}
