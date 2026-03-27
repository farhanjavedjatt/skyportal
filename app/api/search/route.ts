import { createClient } from "@/lib/supabase/server";
import type { Airline, Airport, FlightSchedule } from "@/lib/supabase/types";
import { NextRequest, NextResponse } from "next/server";

type SearchResult = {
  type: "airport" | "airline" | "flight";
  title: string;
  subtitle: string;
  code?: string;
  href: string;
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Query parameter 'q' must be at least 2 characters" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const isFlightNumber = /^[A-Za-z]{2}\d+/.test(q.trim());

  const [{ data: airportsRaw }, { data: airlinesRaw }] = await Promise.all([
    supabase
      .from("airports")
      .select("*")
      .textSearch("search_vector", q, { type: "plain" })
      .limit(5),
    supabase
      .from("airlines")
      .select("*")
      .textSearch("search_vector", q, { type: "plain" })
      .limit(5),
  ]);

  const airports = airportsRaw as Airport[] | null;
  const airlines = airlinesRaw as Airline[] | null;

  const results: SearchResult[] = [];

  if (airports) {
    for (const a of airports) {
      results.push({
        type: "airport",
        title: a.name,
        subtitle: `${a.city}, ${a.country}`,
        code: a.iata_code,
        href: `/airports/${a.slug}`,
      });
    }
  }

  if (airlines) {
    for (const a of airlines) {
      results.push({
        type: "airline",
        title: a.name,
        subtitle: a.country,
        code: a.iata_code,
        href: `/airlines/${a.slug}`,
      });
    }
  }

  if (isFlightNumber) {
    const { data: flightsRaw } = await supabase
      .from("flight_schedules")
      .select("*")
      .ilike("flight_iata", `${q.trim().toUpperCase()}%`)
      .limit(5);

    const flights = flightsRaw as FlightSchedule[] | null;

    if (flights) {
      const seen = new Set<string>();
      for (const f of flights) {
        if (seen.has(f.flight_iata)) continue;
        seen.add(f.flight_iata);
        results.push({
          type: "flight",
          title: f.flight_iata,
          subtitle: `${f.dep_iata} → ${f.arr_iata}`,
          href: `/flights/${f.flight_iata}`,
        });
      }
    }
  }

  return NextResponse.json({ results: results.slice(0, 10) });
}
