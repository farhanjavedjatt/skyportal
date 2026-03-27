import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getAirportDepartures } from "@/lib/aviation-api";
import type { Airport } from "@/lib/supabase/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const syncSecret = process.env.SYNC_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!syncSecret || authHeader !== `Bearer ${syncSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: airportsRaw, error: airportsError } = await adminClient
    .from("airports")
    .select("*")
    .order("is_major", { ascending: false })
    .limit(50);

  const airports = airportsRaw as Airport[] | null;

  if (airportsError || !airports?.length) {
    return NextResponse.json(
      { error: "Failed to fetch airports" },
      { status: 500 }
    );
  }

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const fromISO = now.toISOString().slice(0, 16);
  const toISO = tomorrow.toISOString().slice(0, 16);

  let synced = 0;
  let airportCount = 0;

  for (const airport of airports) {
    try {
      const departures = await getAirportDepartures(
        airport.iata_code,
        fromISO,
        toISO
      );
      if (departures.length === 0) continue;

      const records = departures.map(({ id: _id, ...data }) => ({
        ...data,
        fetched_at: new Date().toISOString(),
      }));

      const { error } = await adminClient
        .from("flight_schedules")
        .upsert(records, { onConflict: "flight_iata,flight_date" });

      if (!error) {
        synced += records.length;
        airportCount++;
      }
    } catch {
      // Individual airport failure — continue with the rest
    }
  }

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const cutoffDate = sevenDaysAgo.toISOString().split("T")[0];

  const { count } = await adminClient
    .from("flight_schedules")
    .select("*", { count: "exact", head: true })
    .lt("flight_date", cutoffDate);

  await adminClient
    .from("flight_schedules")
    .delete()
    .lt("flight_date", cutoffDate);

  return NextResponse.json({
    synced,
    airports: airportCount,
    cleaned: count ?? 0,
    duration_ms: Date.now() - startTime,
  });
}
