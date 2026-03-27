import { createClient } from "@/lib/supabase/server";
import type { FlightSchedule } from "@/lib/supabase/types";
import type { FlightStatus } from "@/lib/utils";

const API_KEY = process.env.AERODATABOX_API_KEY!;
const API_HOST =
  process.env.AERODATABOX_API_HOST ?? "aerodatabox.p.rapidapi.com";
const BASE_URL = `https://${API_HOST}`;

const FLIGHT_TTL = 300;
const STATIC_TTL = 86400;

type CacheEntry = { data: unknown; expiry: number };
const cache = new Map<string, CacheEntry>();

let rateLimitReset = 0;
let backoffMs = 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttlSeconds: number) {
  cache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
}

async function apiFetch<T>(path: string, ttl: number): Promise<T> {
  const cacheKey = path;
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  if (Date.now() < rateLimitReset) {
    throw new Error("Rate limited — backing off");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": API_HOST,
    },
    next: { revalidate: ttl },
  });

  if (res.status === 429) {
    rateLimitReset = Date.now() + backoffMs;
    backoffMs = Math.min(backoffMs * 2, 60_000);
    throw new Error("Rate limited (429)");
  }

  backoffMs = 1000;

  if (!res.ok) {
    throw new Error(`AeroDataBox ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as T;
  setCache(cacheKey, data, ttl);
  return data;
}

// ---------------------------------------------------------------------------
// AeroDataBox response shapes (actual API structure)
// ---------------------------------------------------------------------------

type AeroMovement = {
  airport?: { iata?: string; icao?: string; name?: string; countryCode?: string; timeZone?: string };
  scheduledTime?: { utc?: string; local?: string };
  revisedTime?: { utc?: string; local?: string };
  predictedTime?: { utc?: string; local?: string };
  actualTime?: { utc?: string; local?: string };
  terminal?: string;
  gate?: string;
  baggageBelt?: string;
  quality?: string[];
};

type AeroFIDSFlight = {
  movement: AeroMovement;
  number: string;
  callSign?: string;
  status: string;
  codeshareStatus?: string;
  isCargo: boolean;
  aircraft?: { model?: string; reg?: string; modeS?: string };
  airline?: { name?: string; iata?: string; icao?: string };
};

type AeroDeparturesResponse = {
  departures: AeroFIDSFlight[];
};

type AeroArrivalsResponse = {
  arrivals: AeroFIDSFlight[];
};

type AeroFlightStatusFlight = {
  departure?: AeroMovement;
  arrival?: AeroMovement;
  number: string;
  callSign?: string;
  status: string;
  codeshareStatus?: string;
  isCargo: boolean;
  aircraft?: { model?: string; reg?: string; modeS?: string };
  airline?: { name?: string; iata?: string; icao?: string };
  greatCircleDistance?: { km?: number };
};

export type AeroAirportInfo = {
  iata?: string;
  icao?: string;
  name?: string;
  fullName?: string;
  municipalityName?: string;
  shortName?: string;
  location?: { lat?: number; lon?: number };
  country?: { code?: string; name?: string };
  continent?: { name?: string };
  timeZone?: string;
  urls?: { webSite?: string; flightRadar?: string };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapApiStatus(raw: string): FlightStatus {
  const lower = raw.toLowerCase();
  const map: Record<string, FlightStatus> = {
    scheduled: "scheduled",
    expected: "scheduled",
    active: "active",
    landed: "landed",
    cancelled: "cancelled",
    diverted: "diverted",
    delayed: "delayed",
    boarding: "boarding",
    departed: "departed",
    "en-route": "active",
    "check-in": "scheduled",
    "gate-closed": "departed",
    unknown: "scheduled",
  };
  return map[lower] ?? "scheduled";
}

function inferDepartureStatus(
  apiStatus: string,
  scheduledUtc: string | null | undefined,
  actualUtc: string | null | undefined
): FlightStatus {
  const lower = apiStatus.toLowerCase();
  if (lower === "cancelled") return "cancelled";
  if (lower === "diverted") return "diverted";

  const explicit = mapApiStatus(apiStatus);
  if (explicit !== "scheduled") return explicit;

  if (actualUtc) {
    const actualAge = (Date.now() - new Date(actualUtc).getTime()) / 60_000;
    if (actualAge > 180) return "landed";
    if (actualAge > 30) return "active";
    return "departed";
  }

  if (!scheduledUtc) return "scheduled";

  const diffMin = (Date.now() - new Date(scheduledUtc).getTime()) / 60_000;

  if (diffMin > 240) return "landed";
  if (diffMin > 60) return "active";
  if (diffMin > 15) return "departed";
  if (diffMin > 0) return "boarding";
  return "scheduled";
}

function inferArrivalStatus(
  apiStatus: string,
  scheduledUtc: string | null | undefined,
  actualUtc: string | null | undefined
): FlightStatus {
  const lower = apiStatus.toLowerCase();
  if (lower === "cancelled") return "cancelled";
  if (lower === "diverted") return "diverted";

  const explicit = mapApiStatus(apiStatus);
  if (explicit !== "scheduled") return explicit;

  if (actualUtc) return "landed";

  if (!scheduledUtc) return "scheduled";

  const diffMin = (Date.now() - new Date(scheduledUtc).getTime()) / 60_000;

  if (diffMin > 20) return "landed";
  if (diffMin > -5) return "active";
  if (diffMin > -30) return "active";
  return "scheduled";
}

function computeDelay(
  scheduled?: string | null,
  actual?: string | null
): number | null {
  if (!scheduled || !actual) return null;
  const diff = new Date(actual).getTime() - new Date(scheduled).getTime();
  const minutes = Math.round(diff / 60_000);
  return minutes > 0 ? minutes : null;
}

function bestTime(m: AeroMovement | undefined): string | null {
  return (
    m?.actualTime?.utc ??
    m?.revisedTime?.utc ??
    m?.predictedTime?.utc ??
    null
  );
}

function fidsDepartureToSchedule(
  f: AeroFIDSFlight,
  requestAirportIata: string,
  flightDate: string
): Omit<FlightSchedule, "id" | "fetched_at"> {
  const mov = f.movement;
  return {
    flight_iata: f.number.replace(/\s+/g, ""),
    flight_icao: f.callSign ?? null,
    airline_iata: f.airline?.iata ?? f.number.replace(/\s+/g, "").slice(0, 2),
    airline_name: f.airline?.name ?? null,
    dep_iata: requestAirportIata,
    dep_icao: null,
    dep_terminal: mov.terminal ?? null,
    dep_gate: mov.gate ?? null,
    dep_scheduled: mov.scheduledTime?.utc ?? null,
    dep_estimated: mov.revisedTime?.utc ?? mov.predictedTime?.utc ?? null,
    dep_actual: mov.actualTime?.utc ?? null,
    dep_delay_minutes: computeDelay(
      mov.scheduledTime?.utc,
      bestTime(mov)
    ),
    arr_iata: mov.airport?.iata ?? "",
    arr_icao: mov.airport?.icao ?? null,
    arr_terminal: null,
    arr_gate: null,
    arr_baggage: null,
    arr_scheduled: null,
    arr_estimated: null,
    arr_actual: null,
    arr_delay_minutes: null,
    status: inferDepartureStatus(f.status, mov.scheduledTime?.utc, mov.actualTime?.utc),
    aircraft_icao: f.aircraft?.model ?? null,
    aircraft_registration: f.aircraft?.reg ?? null,
    codeshare_flight:
      f.codeshareStatus === "IsCodeshared" ? f.number : null,
    flight_date: flightDate,
  };
}

function fidsArrivalToSchedule(
  f: AeroFIDSFlight,
  requestAirportIata: string,
  flightDate: string
): Omit<FlightSchedule, "id" | "fetched_at"> {
  const mov = f.movement;
  return {
    flight_iata: f.number.replace(/\s+/g, ""),
    flight_icao: f.callSign ?? null,
    airline_iata: f.airline?.iata ?? f.number.replace(/\s+/g, "").slice(0, 2),
    airline_name: f.airline?.name ?? null,
    dep_iata: mov.airport?.iata ?? "",
    dep_icao: mov.airport?.icao ?? null,
    dep_terminal: null,
    dep_gate: null,
    dep_scheduled: mov.scheduledTime?.utc ?? null,
    dep_estimated: null,
    dep_actual: null,
    dep_delay_minutes: null,
    arr_iata: requestAirportIata,
    arr_icao: null,
    arr_terminal: mov.terminal ?? null,
    arr_gate: mov.gate ?? null,
    arr_baggage: mov.baggageBelt ?? null,
    arr_scheduled: mov.scheduledTime?.utc ?? null,
    arr_estimated: mov.revisedTime?.utc ?? mov.predictedTime?.utc ?? null,
    arr_actual: mov.actualTime?.utc ?? null,
    arr_delay_minutes: computeDelay(
      mov.scheduledTime?.utc,
      bestTime(mov)
    ),
    status: inferArrivalStatus(f.status, mov.scheduledTime?.utc, mov.actualTime?.utc),
    aircraft_icao: f.aircraft?.model ?? null,
    aircraft_registration: f.aircraft?.reg ?? null,
    codeshare_flight:
      f.codeshareStatus === "IsCodeshared" ? f.number : null,
    flight_date: flightDate,
  };
}

function flightStatusToSchedule(
  f: AeroFlightStatusFlight,
  flightDate: string
): Omit<FlightSchedule, "id" | "fetched_at"> {
  return {
    flight_iata: f.number.replace(/\s+/g, ""),
    flight_icao: f.callSign ?? null,
    airline_iata: f.airline?.iata ?? f.number.replace(/\s+/g, "").slice(0, 2),
    airline_name: f.airline?.name ?? null,
    dep_iata: f.departure?.airport?.iata ?? "",
    dep_icao: f.departure?.airport?.icao ?? null,
    dep_terminal: f.departure?.terminal ?? null,
    dep_gate: f.departure?.gate ?? null,
    dep_scheduled: f.departure?.scheduledTime?.utc ?? null,
    dep_estimated: f.departure?.revisedTime?.utc ?? null,
    dep_actual: f.departure?.actualTime?.utc ?? null,
    dep_delay_minutes: computeDelay(
      f.departure?.scheduledTime?.utc,
      f.departure?.actualTime?.utc ?? f.departure?.revisedTime?.utc
    ),
    arr_iata: f.arrival?.airport?.iata ?? "",
    arr_icao: f.arrival?.airport?.icao ?? null,
    arr_terminal: f.arrival?.terminal ?? null,
    arr_gate: f.arrival?.gate ?? null,
    arr_baggage: f.arrival?.baggageBelt ?? null,
    arr_scheduled: f.arrival?.scheduledTime?.utc ?? null,
    arr_estimated: f.arrival?.revisedTime?.utc ?? null,
    arr_actual: f.arrival?.actualTime?.utc ?? null,
    arr_delay_minutes: computeDelay(
      f.arrival?.scheduledTime?.utc,
      f.arrival?.actualTime?.utc ?? f.arrival?.revisedTime?.utc
    ),
    status: mapApiStatus(f.status),
    aircraft_icao: f.aircraft?.model ?? null,
    aircraft_registration: f.aircraft?.reg ?? null,
    codeshare_flight:
      f.codeshareStatus === "IsCodeshared" ? f.number : null,
    flight_date: flightDate,
  };
}

// ---------------------------------------------------------------------------
// Time-range chunking (AeroDataBox max 12h per request)
// ---------------------------------------------------------------------------

const MAX_WINDOW_MS = 12 * 60 * 60 * 1000;

function parseLocalDT(s: string): number {
  return new Date(s.replace("T", " ").replace(/\+.*$/, "")).getTime();
}

function toLocalDTString(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${day}T${h}:${mi}`;
}

function splitTimeRange(from: string, to: string): [string, string][] {
  const fromMs = parseLocalDT(from);
  const toMs = parseLocalDT(to);
  const chunks: [string, string][] = [];
  let cursor = fromMs;
  while (cursor < toMs) {
    const chunkEnd = Math.min(cursor + MAX_WINDOW_MS, toMs);
    chunks.push([toLocalDTString(cursor), toLocalDTString(chunkEnd)]);
    cursor = chunkEnd;
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

export async function getAirportDepartures(
  iataCode: string,
  fromLocal: string,
  toLocal: string
): Promise<FlightSchedule[]> {
  const code = iataCode.toUpperCase();
  const chunks = splitTimeRange(fromLocal, toLocal);
  const seen = new Set<string>();
  const all: FlightSchedule[] = [];

  for (const [from, to] of chunks) {
    const path = `/flights/airports/iata/${code}/${from}/${to}?direction=Departure`;
    try {
      const raw = await apiFetch<AeroDeparturesResponse>(path, FLIGHT_TTL);
      const flights = raw.departures ?? [];
      const today = from.split("T")[0];
      for (const f of flights) {
        if (f.isCargo) continue;
        const key = `${f.number}-${f.movement?.scheduledTime?.utc ?? ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        all.push({
          id: "",
          fetched_at: new Date().toISOString(),
          ...fidsDepartureToSchedule(f, code, today),
        });
      }
    } catch {
      /* chunk failed — try next, fall back at the end */
    }
  }

  if (all.length === 0) {
    return fallbackFlightSchedules(code, "departure");
  }
  return all;
}

export async function getAirportArrivals(
  iataCode: string,
  fromLocal: string,
  toLocal: string
): Promise<FlightSchedule[]> {
  const code = iataCode.toUpperCase();
  const chunks = splitTimeRange(fromLocal, toLocal);
  const seen = new Set<string>();
  const all: FlightSchedule[] = [];

  for (const [from, to] of chunks) {
    const path = `/flights/airports/iata/${code}/${from}/${to}?direction=Arrival`;
    try {
      const raw = await apiFetch<AeroArrivalsResponse>(path, FLIGHT_TTL);
      const flights = raw.arrivals ?? [];
      const today = from.split("T")[0];
      for (const f of flights) {
        if (f.isCargo) continue;
        const key = `${f.number}-${f.movement?.scheduledTime?.utc ?? ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        all.push({
          id: "",
          fetched_at: new Date().toISOString(),
          ...fidsArrivalToSchedule(f, code, today),
        });
      }
    } catch {
      /* chunk failed — try next */
    }
  }

  if (all.length === 0) {
    return fallbackFlightSchedules(code, "arrival");
  }
  return all;
}

export async function getFlightStatus(
  flightNumber: string,
  date: string
): Promise<FlightSchedule[]> {
  const num = flightNumber.toUpperCase().replace(/\s/g, "");
  const path = `/flights/number/${num}/${date}`;

  try {
    const raw = await apiFetch<AeroFlightStatusFlight[]>(path, FLIGHT_TTL);
    const flights = Array.isArray(raw) ? raw : [];
    return flights.map((f) => ({
      id: "",
      fetched_at: new Date().toISOString(),
      ...flightStatusToSchedule(f, date),
    }));
  } catch {
    return fallbackFlightByNumber(num, date);
  }
}

export async function getAirportInfo(
  iataCode: string
): Promise<AeroAirportInfo | null> {
  const code = iataCode.toUpperCase();
  const path = `/airports/iata/${code}`;

  try {
    return await apiFetch<AeroAirportInfo>(path, STATIC_TTL);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Supabase fallbacks
// ---------------------------------------------------------------------------

async function fallbackFlightSchedules(
  airportIata: string,
  direction: "departure" | "arrival"
): Promise<FlightSchedule[]> {
  const supabase = await createClient();
  const column = direction === "departure" ? "dep_iata" : "arr_iata";

  const { data } = await supabase
    .from("flight_schedules")
    .select("*")
    .eq(column, airportIata)
    .order("dep_scheduled", { ascending: true })
    .limit(100);

  return (data as FlightSchedule[]) ?? [];
}

async function fallbackFlightByNumber(
  flightNumber: string,
  date: string
): Promise<FlightSchedule[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("flight_schedules")
    .select("*")
    .eq("flight_iata", flightNumber)
    .eq("flight_date", date)
    .limit(10);

  return (data as FlightSchedule[]) ?? [];
}
