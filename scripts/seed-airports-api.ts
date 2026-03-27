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

if (!supabaseUrl || !supabaseKey) { console.error("Missing Supabase env vars"); process.exit(1); }
if (!apiKey) { console.error("Missing AERODATABOX_API_KEY"); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

type AeroAirport = {
  icao?: string;
  iata?: string;
  name?: string;
  shortName?: string;
  municipalityName?: string;
  location?: { lat?: number; lon?: number };
  elevation?: { meter?: number; feet?: number };
  country?: { code?: string; name?: string };
  continent?: { name?: string };
  timeZone?: string;
  urls?: { webSite?: string };
  phone?: string;
};

function slugify(name: string, iata: string): string {
  const base = name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const short = base.length > 50 ? base.slice(0, 50).replace(/-$/, "") : base;
  return `${short}-${iata.toLowerCase()}`;
}

const MAJOR_AIRPORTS = new Set([
  "ATL","DXB","DFW","DEN","ORD","LHR","LAX","IST","CDG","AMS","FRA","SIN","DEL",
  "ICN","PEK","SFO","CAN","JFK","BKK","HKG","HND","MIA","SEA","NRT","PVG","MEX",
  "KUL","GRU","SYD","YYZ","DOH","FCO","MUC","MAD","JED","BOM","AUH","TPE","CGK",
  "BCN","KHI","ISB","LHE","BLR","HYD","CCU","MAA",
]);

async function fetchByLocation(lat: number, lon: number, radiusKm: number): Promise<AeroAirport[]> {
  const url = `https://${apiHost}/airports/search/location?lat=${lat}&lon=${lon}&radiusKm=${radiusKm}&limit=250&withFlightInfoOnly=false`;
  const res = await fetch(url, {
    headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": apiHost },
  });
  if (res.status === 204) return [];
  if (res.status === 429) {
    console.warn("  Rate limited, waiting 5s...");
    await sleep(5000);
    return fetchByLocation(lat, lon, radiusKm);
  }
  if (!res.ok) {
    console.warn(`  API error ${res.status} for (${lat},${lon})`);
    return [];
  }
  const data = await res.json();
  if (!data?.items) return Array.isArray(data) ? data : [];
  return data.items;
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log("=== SkyPortal Airport Seeder (AeroDataBox) ===\n");

  // Grid covering the entire inhabited world
  // Lat -50 to 72, Lon -180 to 180, step ~18 degrees, radius 1000km
  const gridPoints: [number, number][] = [];
  for (let lat = -50; lat <= 72; lat += 16) {
    for (let lon = -175; lon <= 180; lon += 18) {
      gridPoints.push([lat, lon]);
    }
  }

  console.log(`Grid: ${gridPoints.length} search points (1000km radius each)\n`);

  const allAirports = new Map<string, AeroAirport>();
  let apiCalls = 0;

  for (let i = 0; i < gridPoints.length; i++) {
    const [lat, lon] = gridPoints[i];
    process.stdout.write(`  [${i + 1}/${gridPoints.length}] Searching (${lat}, ${lon})... `);

    const airports = await fetchByLocation(lat, lon, 1000);
    apiCalls++;

    let newCount = 0;
    for (const a of airports) {
      if (!a.iata || a.iata.length !== 3) continue;
      if (!allAirports.has(a.iata)) {
        allAirports.set(a.iata, a);
        newCount++;
      }
    }

    console.log(`${airports.length} results, ${newCount} new (total: ${allAirports.size})`);

    // Respect rate limits: 300ms between calls
    if (i < gridPoints.length - 1) await sleep(300);
  }

  console.log(`\nAPI calls made: ${apiCalls}`);
  console.log(`Total unique airports with IATA codes: ${allAirports.size}\n`);

  // Convert to DB rows
  const rows = Array.from(allAirports.values()).map((a) => ({
    iata_code: a.iata!.toUpperCase(),
    icao_code: a.icao?.toUpperCase() ?? null,
    name: a.name || a.shortName || `${a.municipalityName} Airport`,
    city: a.municipalityName || a.shortName || a.name || "Unknown",
    country: a.country?.name || "Unknown",
    country_code: a.country?.code?.toUpperCase() || "XX",
    timezone: a.timeZone || "UTC",
    latitude: a.location?.lat ?? 0,
    longitude: a.location?.lon ?? 0,
    elevation_ft: a.elevation?.feet ?? null,
    website: a.urls?.webSite ?? null,
    phone_local: a.phone ?? null,
    phone_intl: null,
    address: null,
    total_terminals: null,
    is_major: MAJOR_AIRPORTS.has(a.iata!.toUpperCase()),
    slug: slugify(a.name || a.municipalityName || a.iata!, a.iata!),
  }));

  console.log(`Prepared ${rows.length} airports for upsert\n`);

  // Clear existing airports (cascade deletes airport_airlines, routes)
  console.log("Clearing existing airports...");
  await supabase.from("routes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("airport_airlines").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("airports").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("  Cleared.\n");

  // Upsert in batches of 50
  const batchSize = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("airports").upsert(batch, { onConflict: "iata_code" });
    if (error) {
      console.error(`  Batch ${Math.floor(i / batchSize) + 1} error: ${error.message}`);
      // Try one-by-one for failed batch
      for (const row of batch) {
        const { error: singleErr } = await supabase.from("airports").upsert(row, { onConflict: "iata_code" });
        if (singleErr) {
          errors++;
        } else {
          inserted++;
        }
      }
    } else {
      inserted += batch.length;
    }

    if ((i / batchSize) % 10 === 0 || i + batchSize >= rows.length) {
      console.log(`  Inserted ${Math.min(i + batchSize, rows.length)}/${rows.length} airports`);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total in DB: ${inserted}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
