import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile(filename: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), filename), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { /* file not found */ }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const apiKey = process.env.AERODATABOX_API_KEY!;
const apiHost = process.env.AERODATABOX_API_HOST ?? "aerodatabox.p.rapidapi.com";

if (!supabaseUrl || !supabaseKey || !apiKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

type AeroFIDSFlight = {
  movement: {
    airport?: { iata?: string; icao?: string; name?: string };
    scheduledTime?: { utc?: string; local?: string };
  };
  number: string;
  status: string;
  isCargo: boolean;
  aircraft?: { model?: string };
  airline?: { iata?: string; name?: string };
};

async function fetchDepartures(airportIata: string, from: string, to: string): Promise<AeroFIDSFlight[]> {
  const url = `https://${apiHost}/flights/airports/iata/${airportIata}/${from}/${to}?direction=Departure`;
  const res = await fetch(url, {
    headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": apiHost },
  });

  if (res.status === 429) {
    console.warn("    Rate limited, waiting 5s...");
    await sleep(5000);
    return fetchDepartures(airportIata, from, to);
  }
  if (res.status === 204 || !res.ok) return [];

  const data = await res.json();
  return data.departures ?? [];
}

function formatLocalISO(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${d}T${h}:${mi}`;
}

async function main() {
  console.log("=== SkyPortal Route Seeder (AeroDataBox) ===\n");

  // Load airlines
  const { data: airlinesRaw } = await supabase
    .from("airlines")
    .select("id, iata_code, name, hub_airports")
    .order("name");

  type AirlineRow = { id: string; iata_code: string; name: string; hub_airports: string[] };
  const airlines = (airlinesRaw ?? []) as AirlineRow[];
  console.log(`Loaded ${airlines.length} airlines\n`);

  // Load airport ID lookup
  const airportMap = new Map<string, string>();
  let page = 0;
  while (true) {
    const { data } = await supabase
      .from("airports")
      .select("id, iata_code")
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    for (const a of data) {
      airportMap.set((a as { id: string; iata_code: string }).iata_code, (a as { id: string; iata_code: string }).id);
    }
    page++;
    if (data.length < 1000) break;
  }
  console.log(`Loaded ${airportMap.size} airports for ID lookup\n`);

  // Time window: 24 hours from now (split into two 12h chunks to stay within API limit)
  const now = new Date();
  const chunk1End = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const chunk2End = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Collect all unique hub airports to fetch
  const hubsToFetch = new Set<string>();
  for (const airline of airlines) {
    for (const hub of airline.hub_airports ?? []) {
      hubsToFetch.add(hub);
    }
  }

  console.log(`Unique hub airports to fetch: ${hubsToFetch.size}`);
  console.log(`API calls needed: ~${hubsToFetch.size * 2} (2 chunks each)\n`);

  // Fetch departures from each hub airport and collect flights by airline
  const flightsByHub = new Map<string, AeroFIDSFlight[]>();
  let apiCalls = 0;
  const hubs = Array.from(hubsToFetch);

  for (let i = 0; i < hubs.length; i++) {
    const hub = hubs[i];
    process.stdout.write(`  [${i + 1}/${hubs.length}] ${hub}... `);

    const from1 = formatLocalISO(now);
    const to1 = formatLocalISO(chunk1End);
    const from2 = formatLocalISO(chunk1End);
    const to2 = formatLocalISO(chunk2End);

    const flights1 = await fetchDepartures(hub, from1, to1);
    apiCalls++;
    await sleep(400);

    const flights2 = await fetchDepartures(hub, from2, to2);
    apiCalls++;
    await sleep(400);

    const allFlights = [...flights1, ...flights2];
    flightsByHub.set(hub, allFlights);

    console.log(`${allFlights.length} flights`);
  }

  console.log(`\nAPI calls made: ${apiCalls}`);

  // Extract routes per airline
  type RouteData = {
    airline_id: string;
    departure_airport_id: string;
    arrival_airport_id: string;
    flight_number: string;
    aircraft_type: string | null;
    days_of_week: number[];
  };

  const routes: RouteData[] = [];
  const seenRoutes = new Set<string>();

  for (const airline of airlines) {
    const airlineId = airline.id;
    const airlineIata = airline.iata_code;

    for (const hub of airline.hub_airports ?? []) {
      const hubId = airportMap.get(hub);
      if (!hubId) continue;

      const flights = flightsByHub.get(hub) ?? [];

      for (const f of flights) {
        if (f.isCargo) continue;
        const fIata = f.airline?.iata;
        if (!fIata || fIata !== airlineIata) continue;

        const destIata = f.movement?.airport?.iata;
        if (!destIata) continue;

        const destId = airportMap.get(destIata);
        if (!destId) continue;

        const flightNum = f.number.replace(/\s+/g, "");
        const routeKey = `${airlineId}-${flightNum}`;
        if (seenRoutes.has(routeKey)) continue;
        seenRoutes.add(routeKey);

        routes.push({
          airline_id: airlineId,
          departure_airport_id: hubId,
          arrival_airport_id: destId,
          flight_number: flightNum,
          aircraft_type: f.aircraft?.model ?? null,
          days_of_week: [1, 2, 3, 4, 5, 6, 7],
        });
      }
    }
  }

  console.log(`\nExtracted ${routes.length} unique routes across all airlines\n`);

  // Clear old routes and insert
  console.log("Clearing old routes...");
  await supabase.from("routes").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < routes.length; i += batchSize) {
    const batch = routes.slice(i, i + batchSize);
    const { error } = await supabase.from("routes").insert(batch);
    if (error) {
      console.error(`  Batch error: ${error.message}`);
      for (const row of batch) {
        const { error: singleErr } = await supabase.from("routes").insert(row);
        if (!singleErr) inserted++;
      }
    } else {
      inserted += batch.length;
    }

    if (i % 200 === 0 || i + batchSize >= routes.length) {
      console.log(`  Inserted ${Math.min(i + batchSize, routes.length)}/${routes.length}`);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  Routes inserted: ${inserted}`);
  console.log(`  Airlines with routes: ${new Set(routes.map(r => r.airline_id)).size}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
