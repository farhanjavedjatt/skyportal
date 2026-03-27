import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ---------------------------------------------------------------------------
// Env loading — reads .env.local so the user doesn't need to export manually
// ---------------------------------------------------------------------------
function loadEnvFile(filename: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), filename), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // file not found — rely on existing env vars
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Set them in .env.local or export them before running this script."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ---------------------------------------------------------------------------
// Types (insert shapes — omit auto-generated columns)
// ---------------------------------------------------------------------------
type AirportSeed = {
  iata_code: string;
  icao_code: string;
  name: string;
  city: string;
  country: string;
  country_code: string;
  timezone: string;
  latitude: number;
  longitude: number;
  elevation_ft: number | null;
  website: string | null;
  phone_local: string | null;
  phone_intl: string | null;
  total_terminals: number | null;
  is_major: boolean;
  slug: string;
};

type AirlineSeed = {
  iata_code: string;
  icao_code: string;
  name: string;
  callsign: string | null;
  country: string;
  country_code: string;
  is_active: boolean;
  logo_url: string;
  website: string | null;
  hub_airports: string[];
  alliance: string | null;
  fleet_size: number | null;
  founded_year: number | null;
  slug: string;
};

type RouteSeed = {
  airline_iata: string;
  dep_iata: string;
  arr_iata: string;
  flight_number: string;
  days_of_week: number[];
  aircraft_type: string | null;
  distance_km: number | null;
  avg_duration_minutes: number | null;
};

// ---------------------------------------------------------------------------
// 100 AIRPORTS — real IATA/ICAO, coordinates, elevation, timezones
// ---------------------------------------------------------------------------
const airports: AirportSeed[] = [
  // ── Middle East ──
  { iata_code: "DXB", icao_code: "OMDB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", country_code: "AE", timezone: "Asia/Dubai", latitude: 25.2532, longitude: 55.3657, elevation_ft: 62, website: "https://www.dubaiairports.ae", phone_local: "04 224 5555", phone_intl: "+971 4 224 5555", total_terminals: 3, is_major: true, slug: "dubai-international-dxb" },
  { iata_code: "DOH", icao_code: "OTHH", name: "Hamad International Airport", city: "Doha", country: "Qatar", country_code: "QA", timezone: "Asia/Qatar", latitude: 25.2731, longitude: 51.6081, elevation_ft: 13, website: "https://dohahamadairport.com", phone_local: "4010 6666", phone_intl: "+974 4010 6666", total_terminals: 1, is_major: true, slug: "hamad-international-doh" },
  { iata_code: "AUH", icao_code: "OMAA", name: "Abu Dhabi International Airport", city: "Abu Dhabi", country: "United Arab Emirates", country_code: "AE", timezone: "Asia/Dubai", latitude: 24.4330, longitude: 54.6511, elevation_ft: 88, website: "https://www.abudhabiairport.ae", phone_local: "02 505 5555", phone_intl: "+971 2 505 5555", total_terminals: 3, is_major: false, slug: "abu-dhabi-international-auh" },
  { iata_code: "RUH", icao_code: "OERK", name: "King Khalid International Airport", city: "Riyadh", country: "Saudi Arabia", country_code: "SA", timezone: "Asia/Riyadh", latitude: 24.9576, longitude: 46.6988, elevation_ft: 2049, website: null, phone_local: null, phone_intl: null, total_terminals: 5, is_major: false, slug: "king-khalid-international-ruh" },
  { iata_code: "JED", icao_code: "OEJN", name: "King Abdulaziz International Airport", city: "Jeddah", country: "Saudi Arabia", country_code: "SA", timezone: "Asia/Riyadh", latitude: 21.6796, longitude: 39.1565, elevation_ft: 48, website: null, phone_local: null, phone_intl: null, total_terminals: 3, is_major: false, slug: "king-abdulaziz-international-jed" },
  { iata_code: "MCT", icao_code: "OOMS", name: "Muscat International Airport", city: "Muscat", country: "Oman", country_code: "OM", timezone: "Asia/Muscat", latitude: 23.5933, longitude: 58.2844, elevation_ft: 48, website: "https://www.omanairports.co.om", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "muscat-international-mct" },
  { iata_code: "BAH", icao_code: "OBBI", name: "Bahrain International Airport", city: "Manama", country: "Bahrain", country_code: "BH", timezone: "Asia/Bahrain", latitude: 26.2708, longitude: 50.6336, elevation_ft: 6, website: "https://www.bahrainairport.bh", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "bahrain-international-bah" },
  { iata_code: "KWI", icao_code: "OKBK", name: "Kuwait International Airport", city: "Kuwait City", country: "Kuwait", country_code: "KW", timezone: "Asia/Kuwait", latitude: 29.2267, longitude: 47.9689, elevation_ft: 206, website: null, phone_local: null, phone_intl: null, total_terminals: 4, is_major: false, slug: "kuwait-international-kwi" },
  { iata_code: "AMM", icao_code: "OJAI", name: "Queen Alia International Airport", city: "Amman", country: "Jordan", country_code: "JO", timezone: "Asia/Amman", latitude: 31.7226, longitude: 35.9932, elevation_ft: 2395, website: "https://www.qaiairport.com", phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "queen-alia-international-amm" },
  { iata_code: "TLV", icao_code: "LLBG", name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel", country_code: "IL", timezone: "Asia/Jerusalem", latitude: 32.0114, longitude: 34.8867, elevation_ft: 135, website: "https://www.iaa.gov.il", phone_local: null, phone_intl: null, total_terminals: 3, is_major: false, slug: "ben-gurion-tlv" },
  { iata_code: "BEY", icao_code: "OLBA", name: "Beirut–Rafic Hariri International Airport", city: "Beirut", country: "Lebanon", country_code: "LB", timezone: "Asia/Beirut", latitude: 33.8209, longitude: 35.4884, elevation_ft: 87, website: null, phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "beirut-rafic-hariri-bey" },

  // ── North America — United States ──
  { iata_code: "JFK", icao_code: "KJFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", country_code: "US", timezone: "America/New_York", latitude: 40.6413, longitude: -73.7781, elevation_ft: 13, website: "https://www.jfkairport.com", phone_local: "(718) 244-4444", phone_intl: "+1 718-244-4444", total_terminals: 6, is_major: true, slug: "john-f-kennedy-international-jfk" },
  { iata_code: "LAX", icao_code: "KLAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", country_code: "US", timezone: "America/Los_Angeles", latitude: 33.9425, longitude: -118.4081, elevation_ft: 128, website: "https://www.flylax.com", phone_local: "(855) 463-5252", phone_intl: "+1 855-463-5252", total_terminals: 9, is_major: true, slug: "los-angeles-international-lax" },
  { iata_code: "ORD", icao_code: "KORD", name: "O'Hare International Airport", city: "Chicago", country: "United States", country_code: "US", timezone: "America/Chicago", latitude: 41.9742, longitude: -87.9073, elevation_ft: 672, website: "https://www.flychicago.com/ohare", phone_local: "(800) 832-6352", phone_intl: "+1 800-832-6352", total_terminals: 4, is_major: true, slug: "ohare-international-ord" },
  { iata_code: "ATL", icao_code: "KATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "United States", country_code: "US", timezone: "America/New_York", latitude: 33.6407, longitude: -84.4277, elevation_ft: 1026, website: "https://www.atl.com", phone_local: "(800) 897-1910", phone_intl: "+1 800-897-1910", total_terminals: 2, is_major: true, slug: "hartsfield-jackson-atlanta-atl" },
  { iata_code: "DFW", icao_code: "KDFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "United States", country_code: "US", timezone: "America/Chicago", latitude: 32.8998, longitude: -97.0403, elevation_ft: 607, website: "https://www.dfwairport.com", phone_local: "(972) 973-3112", phone_intl: "+1 972-973-3112", total_terminals: 5, is_major: true, slug: "dallas-fort-worth-international-dfw" },
  { iata_code: "SFO", icao_code: "KSFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States", country_code: "US", timezone: "America/Los_Angeles", latitude: 37.6213, longitude: -122.3790, elevation_ft: 13, website: "https://www.flysfo.com", phone_local: "(650) 821-8211", phone_intl: "+1 650-821-8211", total_terminals: 4, is_major: true, slug: "san-francisco-international-sfo" },
  { iata_code: "MIA", icao_code: "KMIA", name: "Miami International Airport", city: "Miami", country: "United States", country_code: "US", timezone: "America/New_York", latitude: 25.7959, longitude: -80.2870, elevation_ft: 8, website: "https://www.miami-airport.com", phone_local: "(305) 876-7000", phone_intl: "+1 305-876-7000", total_terminals: 3, is_major: true, slug: "miami-international-mia" },
  { iata_code: "SEA", icao_code: "KSEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "United States", country_code: "US", timezone: "America/Los_Angeles", latitude: 47.4502, longitude: -122.3088, elevation_ft: 433, website: "https://www.portseattle.org/sea-tac", phone_local: "(206) 787-5388", phone_intl: "+1 206-787-5388", total_terminals: 2, is_major: true, slug: "seattle-tacoma-international-sea" },
  { iata_code: "BOS", icao_code: "KBOS", name: "Boston Logan International Airport", city: "Boston", country: "United States", country_code: "US", timezone: "America/New_York", latitude: 42.3656, longitude: -71.0096, elevation_ft: 20, website: "https://www.massport.com/logan-airport", phone_local: "(800) 235-6426", phone_intl: "+1 800-235-6426", total_terminals: 4, is_major: true, slug: "boston-logan-international-bos" },
  { iata_code: "DEN", icao_code: "KDEN", name: "Denver International Airport", city: "Denver", country: "United States", country_code: "US", timezone: "America/Denver", latitude: 39.8561, longitude: -104.6737, elevation_ft: 5431, website: "https://www.flydenver.com", phone_local: "(303) 342-2000", phone_intl: "+1 303-342-2000", total_terminals: 3, is_major: true, slug: "denver-international-den" },
  { iata_code: "EWR", icao_code: "KEWR", name: "Newark Liberty International Airport", city: "Newark", country: "United States", country_code: "US", timezone: "America/New_York", latitude: 40.6895, longitude: -74.1745, elevation_ft: 18, website: "https://www.newarkairport.com", phone_local: "(973) 961-6000", phone_intl: "+1 973-961-6000", total_terminals: 3, is_major: false, slug: "newark-liberty-international-ewr" },
  { iata_code: "IAD", icao_code: "KIAD", name: "Washington Dulles International Airport", city: "Washington", country: "United States", country_code: "US", timezone: "America/New_York", latitude: 38.9531, longitude: -77.4565, elevation_ft: 313, website: "https://www.flydulles.com", phone_local: "(703) 572-2700", phone_intl: "+1 703-572-2700", total_terminals: 2, is_major: false, slug: "washington-dulles-international-iad" },
  { iata_code: "IAH", icao_code: "KIAH", name: "George Bush Intercontinental Airport", city: "Houston", country: "United States", country_code: "US", timezone: "America/Chicago", latitude: 29.9844, longitude: -95.3414, elevation_ft: 97, website: "https://www.fly2houston.com", phone_local: "(281) 230-3100", phone_intl: "+1 281-230-3100", total_terminals: 5, is_major: false, slug: "george-bush-intercontinental-iah" },
  { iata_code: "PHX", icao_code: "KPHX", name: "Phoenix Sky Harbor International Airport", city: "Phoenix", country: "United States", country_code: "US", timezone: "America/Phoenix", latitude: 33.4373, longitude: -112.0078, elevation_ft: 1135, website: "https://www.skyharbor.com", phone_local: "(602) 273-3300", phone_intl: "+1 602-273-3300", total_terminals: 3, is_major: false, slug: "phoenix-sky-harbor-phx" },
  { iata_code: "MSP", icao_code: "KMSP", name: "Minneapolis–Saint Paul International Airport", city: "Minneapolis", country: "United States", country_code: "US", timezone: "America/Chicago", latitude: 44.8848, longitude: -93.2223, elevation_ft: 841, website: "https://www.mspairport.com", phone_local: "(612) 726-5555", phone_intl: "+1 612-726-5555", total_terminals: 2, is_major: false, slug: "minneapolis-saint-paul-msp" },
  { iata_code: "DTW", icao_code: "KDTW", name: "Detroit Metropolitan Wayne County Airport", city: "Detroit", country: "United States", country_code: "US", timezone: "America/Detroit", latitude: 42.2124, longitude: -83.3534, elevation_ft: 645, website: "https://www.metroairport.com", phone_local: "(734) 247-7678", phone_intl: "+1 734-247-7678", total_terminals: 2, is_major: false, slug: "detroit-metropolitan-dtw" },
  { iata_code: "PHL", icao_code: "KPHL", name: "Philadelphia International Airport", city: "Philadelphia", country: "United States", country_code: "US", timezone: "America/New_York", latitude: 39.8721, longitude: -75.2411, elevation_ft: 36, website: "https://www.phl.org", phone_local: "(215) 937-6937", phone_intl: "+1 215-937-6937", total_terminals: 7, is_major: false, slug: "philadelphia-international-phl" },
  { iata_code: "CLT", icao_code: "KCLT", name: "Charlotte Douglas International Airport", city: "Charlotte", country: "United States", country_code: "US", timezone: "America/New_York", latitude: 35.2140, longitude: -80.9431, elevation_ft: 748, website: "https://www.cltairport.com", phone_local: "(704) 359-4013", phone_intl: "+1 704-359-4013", total_terminals: 1, is_major: false, slug: "charlotte-douglas-international-clt" },
  { iata_code: "MCO", icao_code: "KMCO", name: "Orlando International Airport", city: "Orlando", country: "United States", country_code: "US", timezone: "America/New_York", latitude: 28.4312, longitude: -81.3081, elevation_ft: 96, website: "https://www.orlandoairports.net", phone_local: "(407) 825-2001", phone_intl: "+1 407-825-2001", total_terminals: 2, is_major: false, slug: "orlando-international-mco" },
  { iata_code: "SAN", icao_code: "KSAN", name: "San Diego International Airport", city: "San Diego", country: "United States", country_code: "US", timezone: "America/Los_Angeles", latitude: 32.7336, longitude: -117.1897, elevation_ft: 17, website: "https://www.san.org", phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "san-diego-international-san" },
  { iata_code: "TPA", icao_code: "KTPA", name: "Tampa International Airport", city: "Tampa", country: "United States", country_code: "US", timezone: "America/New_York", latitude: 27.9755, longitude: -82.5332, elevation_ft: 26, website: "https://www.tampaairport.com", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "tampa-international-tpa" },
  { iata_code: "PDX", icao_code: "KPDX", name: "Portland International Airport", city: "Portland", country: "United States", country_code: "US", timezone: "America/Los_Angeles", latitude: 45.5898, longitude: -122.5951, elevation_ft: 31, website: "https://www.flypdx.com", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "portland-international-pdx" },
  { iata_code: "SLC", icao_code: "KSLC", name: "Salt Lake City International Airport", city: "Salt Lake City", country: "United States", country_code: "US", timezone: "America/Denver", latitude: 40.7884, longitude: -111.9778, elevation_ft: 4227, website: "https://www.slcairport.com", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "salt-lake-city-international-slc" },
  { iata_code: "BWI", icao_code: "KBWI", name: "Baltimore/Washington International Airport", city: "Baltimore", country: "United States", country_code: "US", timezone: "America/New_York", latitude: 39.1754, longitude: -76.6683, elevation_ft: 146, website: "https://www.bwiairport.com", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "baltimore-washington-international-bwi" },
  { iata_code: "FLL", icao_code: "KFLL", name: "Fort Lauderdale–Hollywood International Airport", city: "Fort Lauderdale", country: "United States", country_code: "US", timezone: "America/New_York", latitude: 26.0726, longitude: -80.1527, elevation_ft: 9, website: "https://www.broward.org/airport", phone_local: null, phone_intl: null, total_terminals: 4, is_major: false, slug: "fort-lauderdale-hollywood-fll" },
  { iata_code: "MDW", icao_code: "KMDW", name: "Chicago Midway International Airport", city: "Chicago", country: "United States", country_code: "US", timezone: "America/Chicago", latitude: 41.7868, longitude: -87.7522, elevation_ft: 620, website: "https://www.flychicago.com/midway", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "chicago-midway-mdw" },
  { iata_code: "HNL", icao_code: "PHNL", name: "Daniel K. Inouye International Airport", city: "Honolulu", country: "United States", country_code: "US", timezone: "Pacific/Honolulu", latitude: 21.3187, longitude: -157.9225, elevation_ft: 13, website: "https://airports.hawaii.gov/hnl", phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "daniel-k-inouye-international-hnl" },
  { iata_code: "ANC", icao_code: "PANC", name: "Ted Stevens Anchorage International Airport", city: "Anchorage", country: "United States", country_code: "US", timezone: "America/Anchorage", latitude: 61.1743, longitude: -149.9964, elevation_ft: 152, website: null, phone_local: null, phone_intl: null, total_terminals: 3, is_major: false, slug: "ted-stevens-anchorage-anc" },

  // ── North America — Canada & Mexico ──
  { iata_code: "YYZ", icao_code: "CYYZ", name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada", country_code: "CA", timezone: "America/Toronto", latitude: 43.6777, longitude: -79.6248, elevation_ft: 569, website: "https://www.torontopearson.com", phone_local: "(416) 247-7678", phone_intl: "+1 416-247-7678", total_terminals: 2, is_major: true, slug: "toronto-pearson-international-yyz" },
  { iata_code: "MEX", icao_code: "MMMX", name: "Mexico City International Airport", city: "Mexico City", country: "Mexico", country_code: "MX", timezone: "America/Mexico_City", latitude: 19.4363, longitude: -99.0721, elevation_ft: 7316, website: "https://www.aicm.com.mx", phone_local: null, phone_intl: "+52 55 2482 2400", total_terminals: 2, is_major: false, slug: "mexico-city-international-mex" },
  { iata_code: "CUN", icao_code: "MMUN", name: "Cancún International Airport", city: "Cancún", country: "Mexico", country_code: "MX", timezone: "America/Cancun", latitude: 21.0365, longitude: -86.8771, elevation_ft: 22, website: null, phone_local: null, phone_intl: null, total_terminals: 4, is_major: false, slug: "cancun-international-cun" },

  // ── Central & South America ──
  { iata_code: "PTY", icao_code: "MPTO", name: "Tocumen International Airport", city: "Panama City", country: "Panama", country_code: "PA", timezone: "America/Panama", latitude: 9.0714, longitude: -79.3835, elevation_ft: 135, website: "https://www.tocumenpanama.aero", phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "tocumen-international-pty" },
  { iata_code: "BOG", icao_code: "SKBO", name: "El Dorado International Airport", city: "Bogotá", country: "Colombia", country_code: "CO", timezone: "America/Bogota", latitude: 4.7016, longitude: -74.1469, elevation_ft: 8361, website: "https://www.eldorado.aero", phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "el-dorado-international-bog" },
  { iata_code: "LIM", icao_code: "SPJC", name: "Jorge Chávez International Airport", city: "Lima", country: "Peru", country_code: "PE", timezone: "America/Lima", latitude: -12.0219, longitude: -77.1143, elevation_ft: 112, website: "https://www.lima-airport.com", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "jorge-chavez-international-lim" },
  { iata_code: "GRU", icao_code: "SBGR", name: "São Paulo/Guarulhos International Airport", city: "São Paulo", country: "Brazil", country_code: "BR", timezone: "America/Sao_Paulo", latitude: -23.4356, longitude: -46.4731, elevation_ft: 2459, website: "https://www.gru.com.br", phone_local: null, phone_intl: null, total_terminals: 3, is_major: false, slug: "sao-paulo-guarulhos-gru" },
  { iata_code: "GIG", icao_code: "SBGL", name: "Rio de Janeiro/Galeão International Airport", city: "Rio de Janeiro", country: "Brazil", country_code: "BR", timezone: "America/Sao_Paulo", latitude: -22.8100, longitude: -43.2506, elevation_ft: 28, website: "https://www.riogaleao.com", phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "rio-galeao-international-gig" },
  { iata_code: "EZE", icao_code: "SAEZ", name: "Ministro Pistarini International Airport", city: "Buenos Aires", country: "Argentina", country_code: "AR", timezone: "America/Argentina/Buenos_Aires", latitude: -34.8222, longitude: -58.5358, elevation_ft: 67, website: "https://www.aa2000.com.ar", phone_local: null, phone_intl: null, total_terminals: 3, is_major: false, slug: "ezeiza-international-eze" },
  { iata_code: "SCL", icao_code: "SCEL", name: "Arturo Merino Benítez International Airport", city: "Santiago", country: "Chile", country_code: "CL", timezone: "America/Santiago", latitude: -33.3930, longitude: -70.7858, elevation_ft: 1555, website: "https://www.nuevopudahuel.cl", phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "arturo-merino-benitez-scl" },

  // ── Europe ──
  { iata_code: "LHR", icao_code: "EGLL", name: "Heathrow Airport", city: "London", country: "United Kingdom", country_code: "GB", timezone: "Europe/London", latitude: 51.4700, longitude: -0.4543, elevation_ft: 83, website: "https://www.heathrow.com", phone_local: "0344 335 1801", phone_intl: "+44 344 335 1801", total_terminals: 4, is_major: true, slug: "heathrow-lhr" },
  { iata_code: "CDG", icao_code: "LFPG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", country_code: "FR", timezone: "Europe/Paris", latitude: 49.0097, longitude: 2.5479, elevation_ft: 392, website: "https://www.parisaeroport.fr", phone_local: "01 70 36 39 50", phone_intl: "+33 1 70 36 39 50", total_terminals: 3, is_major: true, slug: "charles-de-gaulle-cdg" },
  { iata_code: "FRA", icao_code: "EDDF", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", country_code: "DE", timezone: "Europe/Berlin", latitude: 50.0379, longitude: 8.5622, elevation_ft: 364, website: "https://www.frankfurt-airport.com", phone_local: "069 690 0", phone_intl: "+49 69 690 0", total_terminals: 2, is_major: true, slug: "frankfurt-fra" },
  { iata_code: "AMS", icao_code: "EHAM", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", country_code: "NL", timezone: "Europe/Amsterdam", latitude: 52.3105, longitude: 4.7683, elevation_ft: -11, website: "https://www.schiphol.nl", phone_local: "020 794 0800", phone_intl: "+31 20 794 0800", total_terminals: 1, is_major: true, slug: "amsterdam-schiphol-ams" },
  { iata_code: "IST", icao_code: "LTFM", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", country_code: "TR", timezone: "Europe/Istanbul", latitude: 41.2753, longitude: 28.7519, elevation_ft: 325, website: "https://www.istairport.com", phone_local: null, phone_intl: "+90 444 1 442", total_terminals: 1, is_major: true, slug: "istanbul-ist" },
  { iata_code: "MAD", icao_code: "LEMD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain", country_code: "ES", timezone: "Europe/Madrid", latitude: 40.4983, longitude: -3.5676, elevation_ft: 2000, website: "https://www.aena.es/en/madrid-barajas", phone_local: null, phone_intl: "+34 91 321 10 00", total_terminals: 4, is_major: true, slug: "madrid-barajas-mad" },
  { iata_code: "BCN", icao_code: "LEBL", name: "Josep Tarradellas Barcelona–El Prat Airport", city: "Barcelona", country: "Spain", country_code: "ES", timezone: "Europe/Madrid", latitude: 41.2971, longitude: 2.0785, elevation_ft: 12, website: "https://www.aena.es/en/barcelona", phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "barcelona-el-prat-bcn" },
  { iata_code: "FCO", icao_code: "LIRF", name: "Leonardo da Vinci–Fiumicino Airport", city: "Rome", country: "Italy", country_code: "IT", timezone: "Europe/Rome", latitude: 41.8003, longitude: 12.2389, elevation_ft: 15, website: "https://www.adr.it/fiumicino", phone_local: null, phone_intl: "+39 06 65951", total_terminals: 4, is_major: false, slug: "fiumicino-fco" },
  { iata_code: "MUC", icao_code: "EDDM", name: "Munich Airport", city: "Munich", country: "Germany", country_code: "DE", timezone: "Europe/Berlin", latitude: 48.3538, longitude: 11.7861, elevation_ft: 1487, website: "https://www.munich-airport.de", phone_local: null, phone_intl: "+49 89 975 00", total_terminals: 2, is_major: false, slug: "munich-muc" },
  { iata_code: "ZRH", icao_code: "LSZH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", country_code: "CH", timezone: "Europe/Zurich", latitude: 47.4647, longitude: 8.5492, elevation_ft: 1416, website: "https://www.zurich-airport.com", phone_local: null, phone_intl: "+41 43 816 22 11", total_terminals: 3, is_major: false, slug: "zurich-zrh" },
  { iata_code: "VIE", icao_code: "LOWW", name: "Vienna International Airport", city: "Vienna", country: "Austria", country_code: "AT", timezone: "Europe/Vienna", latitude: 48.1103, longitude: 16.5697, elevation_ft: 600, website: "https://www.viennaairport.com", phone_local: null, phone_intl: "+43 1 7007 22233", total_terminals: 3, is_major: false, slug: "vienna-international-vie" },
  { iata_code: "LIS", icao_code: "LPPT", name: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal", country_code: "PT", timezone: "Europe/Lisbon", latitude: 38.7813, longitude: -9.1359, elevation_ft: 374, website: "https://www.aeroportolisboa.pt", phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "lisbon-humberto-delgado-lis" },
  { iata_code: "ATH", icao_code: "LGAV", name: "Athens International Airport", city: "Athens", country: "Greece", country_code: "GR", timezone: "Europe/Athens", latitude: 37.9364, longitude: 23.9445, elevation_ft: 308, website: "https://www.aia.gr", phone_local: null, phone_intl: "+30 210 353 0000", total_terminals: 2, is_major: false, slug: "athens-international-ath" },
  { iata_code: "DUB", icao_code: "EIDW", name: "Dublin Airport", city: "Dublin", country: "Ireland", country_code: "IE", timezone: "Europe/Dublin", latitude: 53.4213, longitude: -6.2701, elevation_ft: 242, website: "https://www.dublinairport.com", phone_local: null, phone_intl: "+353 1 814 1111", total_terminals: 2, is_major: false, slug: "dublin-dub" },
  { iata_code: "EDI", icao_code: "EGPH", name: "Edinburgh Airport", city: "Edinburgh", country: "United Kingdom", country_code: "GB", timezone: "Europe/London", latitude: 55.9508, longitude: -3.3615, elevation_ft: 135, website: "https://www.edinburghairport.com", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "edinburgh-edi" },
  { iata_code: "CPH", icao_code: "EKCH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark", country_code: "DK", timezone: "Europe/Copenhagen", latitude: 55.6181, longitude: 12.6561, elevation_ft: 17, website: "https://www.cph.dk", phone_local: null, phone_intl: "+45 32 31 32 31", total_terminals: 3, is_major: false, slug: "copenhagen-cph" },
  { iata_code: "OSL", icao_code: "ENGM", name: "Oslo Airport Gardermoen", city: "Oslo", country: "Norway", country_code: "NO", timezone: "Europe/Oslo", latitude: 60.1976, longitude: 11.1004, elevation_ft: 681, website: "https://avinor.no/en/airport/oslo-airport", phone_local: null, phone_intl: "+47 64 81 20 00", total_terminals: 1, is_major: false, slug: "oslo-gardermoen-osl" },
  { iata_code: "ARN", icao_code: "ESSA", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden", country_code: "SE", timezone: "Europe/Stockholm", latitude: 59.6519, longitude: 17.9186, elevation_ft: 137, website: "https://www.swedavia.com/arlanda", phone_local: null, phone_intl: "+46 10 109 10 00", total_terminals: 4, is_major: false, slug: "stockholm-arlanda-arn" },
  { iata_code: "HEL", icao_code: "EFHK", name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland", country_code: "FI", timezone: "Europe/Helsinki", latitude: 60.3172, longitude: 24.9633, elevation_ft: 179, website: "https://www.finavia.fi/en/helsinki-airport", phone_local: null, phone_intl: "+358 200 14636", total_terminals: 2, is_major: false, slug: "helsinki-vantaa-hel" },
  { iata_code: "LCA", icao_code: "LCLK", name: "Larnaca International Airport", city: "Larnaca", country: "Cyprus", country_code: "CY", timezone: "Asia/Nicosia", latitude: 34.8756, longitude: 33.6249, elevation_ft: 8, website: "https://www.hermesairports.com", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "larnaca-international-lca" },
  { iata_code: "WAW", icao_code: "EPWA", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland", country_code: "PL", timezone: "Europe/Warsaw", latitude: 52.1657, longitude: 20.9671, elevation_ft: 362, website: "https://www.lotnisko-chopina.pl", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "warsaw-chopin-waw" },
  { iata_code: "BUD", icao_code: "LHBP", name: "Budapest Ferenc Liszt International Airport", city: "Budapest", country: "Hungary", country_code: "HU", timezone: "Europe/Budapest", latitude: 47.4369, longitude: 19.2556, elevation_ft: 495, website: "https://www.bud.hu", phone_local: null, phone_intl: "+36 1 296 7000", total_terminals: 2, is_major: false, slug: "budapest-ferenc-liszt-bud" },
  { iata_code: "PRG", icao_code: "LKPR", name: "Václav Havel Airport Prague", city: "Prague", country: "Czech Republic", country_code: "CZ", timezone: "Europe/Prague", latitude: 50.1008, longitude: 14.2600, elevation_ft: 1247, website: "https://www.prg.aero", phone_local: null, phone_intl: "+420 220 111 888", total_terminals: 2, is_major: false, slug: "vaclav-havel-prague-prg" },

  // ── Asia-Pacific ──
  { iata_code: "SIN", icao_code: "WSSS", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", country_code: "SG", timezone: "Asia/Singapore", latitude: 1.3644, longitude: 103.9915, elevation_ft: 22, website: "https://www.changiairport.com", phone_local: "6595 6868", phone_intl: "+65 6595 6868", total_terminals: 4, is_major: true, slug: "singapore-changi-sin" },
  { iata_code: "HND", icao_code: "RJTT", name: "Tokyo Haneda Airport", city: "Tokyo", country: "Japan", country_code: "JP", timezone: "Asia/Tokyo", latitude: 35.5494, longitude: 139.7798, elevation_ft: 35, website: "https://tokyo-haneda.com", phone_local: "03-5757-8111", phone_intl: "+81 3-5757-8111", total_terminals: 3, is_major: true, slug: "tokyo-haneda-hnd" },
  { iata_code: "NRT", icao_code: "RJAA", name: "Narita International Airport", city: "Tokyo", country: "Japan", country_code: "JP", timezone: "Asia/Tokyo", latitude: 35.7647, longitude: 140.3864, elevation_ft: 141, website: "https://www.narita-airport.jp", phone_local: "0476-34-8000", phone_intl: "+81 476-34-8000", total_terminals: 3, is_major: false, slug: "narita-international-nrt" },
  { iata_code: "HKG", icao_code: "VHHH", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong", country_code: "HK", timezone: "Asia/Hong_Kong", latitude: 22.3080, longitude: 113.9185, elevation_ft: 28, website: "https://www.hongkongairport.com", phone_local: "2181 8888", phone_intl: "+852 2181 8888", total_terminals: 2, is_major: true, slug: "hong-kong-international-hkg" },
  { iata_code: "ICN", icao_code: "RKSI", name: "Incheon International Airport", city: "Seoul", country: "South Korea", country_code: "KR", timezone: "Asia/Seoul", latitude: 37.4602, longitude: 126.4407, elevation_ft: 23, website: "https://www.airport.kr", phone_local: "1577-2600", phone_intl: "+82 1577-2600", total_terminals: 2, is_major: true, slug: "incheon-international-icn" },
  { iata_code: "BKK", icao_code: "VTBS", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", country_code: "TH", timezone: "Asia/Bangkok", latitude: 13.6900, longitude: 100.7501, elevation_ft: 5, website: "https://www.suvarnabhumiairport.com", phone_local: "02 132 1888", phone_intl: "+66 2 132 1888", total_terminals: 1, is_major: true, slug: "suvarnabhumi-bkk" },
  { iata_code: "KUL", icao_code: "WMKK", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", country_code: "MY", timezone: "Asia/Kuala_Lumpur", latitude: 2.7456, longitude: 101.7099, elevation_ft: 69, website: "https://www.klia.com.my", phone_local: "03 8777 8888", phone_intl: "+60 3 8777 8888", total_terminals: 2, is_major: true, slug: "kuala-lumpur-international-kul" },
  { iata_code: "MNL", icao_code: "RPLL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines", country_code: "PH", timezone: "Asia/Manila", latitude: 14.5086, longitude: 121.0198, elevation_ft: 75, website: "https://www.miaa.gov.ph", phone_local: null, phone_intl: null, total_terminals: 4, is_major: false, slug: "ninoy-aquino-international-mnl" },
  { iata_code: "CGK", icao_code: "WIII", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia", country_code: "ID", timezone: "Asia/Jakarta", latitude: -6.1256, longitude: 106.6558, elevation_ft: 34, website: null, phone_local: null, phone_intl: null, total_terminals: 3, is_major: true, slug: "soekarno-hatta-international-cgk" },
  { iata_code: "PEK", icao_code: "ZBAA", name: "Beijing Capital International Airport", city: "Beijing", country: "China", country_code: "CN", timezone: "Asia/Shanghai", latitude: 40.0799, longitude: 116.6031, elevation_ft: 116, website: null, phone_local: null, phone_intl: "+86 10 96158", total_terminals: 3, is_major: true, slug: "beijing-capital-international-pek" },
  { iata_code: "DEL", icao_code: "VIDP", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", country_code: "IN", timezone: "Asia/Kolkata", latitude: 28.5562, longitude: 77.1000, elevation_ft: 777, website: "https://www.newdelhiairport.in", phone_local: null, phone_intl: "+91 124 337 6000", total_terminals: 3, is_major: true, slug: "indira-gandhi-international-del" },
  { iata_code: "BOM", icao_code: "VABB", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", country_code: "IN", timezone: "Asia/Kolkata", latitude: 19.0896, longitude: 72.8656, elevation_ft: 39, website: "https://www.csia.in", phone_local: null, phone_intl: "+91 22 6685 1010", total_terminals: 2, is_major: true, slug: "chhatrapati-shivaji-maharaj-bom" },
  { iata_code: "CCU", icao_code: "VECC", name: "Netaji Subhas Chandra Bose International Airport", city: "Kolkata", country: "India", country_code: "IN", timezone: "Asia/Kolkata", latitude: 22.6547, longitude: 88.4467, elevation_ft: 16, website: null, phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "netaji-subhas-chandra-bose-ccu" },
  { iata_code: "MAA", icao_code: "VOMM", name: "Chennai International Airport", city: "Chennai", country: "India", country_code: "IN", timezone: "Asia/Kolkata", latitude: 12.9941, longitude: 80.1709, elevation_ft: 52, website: null, phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "chennai-international-maa" },
  { iata_code: "BLR", icao_code: "VOBL", name: "Kempegowda International Airport", city: "Bengaluru", country: "India", country_code: "IN", timezone: "Asia/Kolkata", latitude: 13.1986, longitude: 77.7066, elevation_ft: 3000, website: "https://www.bengaluruairport.com", phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "kempegowda-international-blr" },
  { iata_code: "HYD", icao_code: "VOHS", name: "Rajiv Gandhi International Airport", city: "Hyderabad", country: "India", country_code: "IN", timezone: "Asia/Kolkata", latitude: 17.2403, longitude: 78.4294, elevation_ft: 2024, website: "https://www.hyderabad.aero", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "rajiv-gandhi-international-hyd" },
  { iata_code: "CMB", icao_code: "VCBI", name: "Bandaranaike International Airport", city: "Colombo", country: "Sri Lanka", country_code: "LK", timezone: "Asia/Colombo", latitude: 7.1808, longitude: 79.8841, elevation_ft: 30, website: "https://www.airport.lk", phone_local: null, phone_intl: null, total_terminals: 1, is_major: false, slug: "bandaranaike-international-cmb" },
  { iata_code: "KTM", icao_code: "VNKT", name: "Tribhuvan International Airport", city: "Kathmandu", country: "Nepal", country_code: "NP", timezone: "Asia/Kathmandu", latitude: 27.6966, longitude: 85.3591, elevation_ft: 4390, website: null, phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "tribhuvan-international-ktm" },
  { iata_code: "DAC", icao_code: "VGHS", name: "Hazrat Shahjalal International Airport", city: "Dhaka", country: "Bangladesh", country_code: "BD", timezone: "Asia/Dhaka", latitude: 23.8433, longitude: 90.3978, elevation_ft: 30, website: null, phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "hazrat-shahjalal-international-dac" },

  // ── Oceania ──
  { iata_code: "SYD", icao_code: "YSSY", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", country_code: "AU", timezone: "Australia/Sydney", latitude: -33.9461, longitude: 151.1772, elevation_ft: 21, website: "https://www.sydneyairport.com.au", phone_local: "(02) 9667 9111", phone_intl: "+61 2 9667 9111", total_terminals: 3, is_major: true, slug: "sydney-kingsford-smith-syd" },
  { iata_code: "MEL", icao_code: "YMML", name: "Melbourne Airport", city: "Melbourne", country: "Australia", country_code: "AU", timezone: "Australia/Melbourne", latitude: -37.6733, longitude: 144.8433, elevation_ft: 434, website: "https://www.melbourneairport.com.au", phone_local: null, phone_intl: "+61 3 9297 1600", total_terminals: 4, is_major: false, slug: "melbourne-mel" },
  { iata_code: "PER", icao_code: "YPPH", name: "Perth Airport", city: "Perth", country: "Australia", country_code: "AU", timezone: "Australia/Perth", latitude: -31.9403, longitude: 115.9672, elevation_ft: 67, website: "https://www.perthairport.com.au", phone_local: null, phone_intl: null, total_terminals: 4, is_major: false, slug: "perth-per" },
  { iata_code: "AKL", icao_code: "NZAA", name: "Auckland Airport", city: "Auckland", country: "New Zealand", country_code: "NZ", timezone: "Pacific/Auckland", latitude: -37.0082, longitude: 174.7850, elevation_ft: 7, website: "https://www.aucklandairport.co.nz", phone_local: null, phone_intl: "+64 9 275 0789", total_terminals: 2, is_major: false, slug: "auckland-akl" },

  // ── Africa ──
  { iata_code: "JNB", icao_code: "FAOR", name: "O.R. Tambo International Airport", city: "Johannesburg", country: "South Africa", country_code: "ZA", timezone: "Africa/Johannesburg", latitude: -26.1392, longitude: 28.2460, elevation_ft: 5558, website: "https://www.airports.co.za", phone_local: null, phone_intl: "+27 11 921 6262", total_terminals: 2, is_major: false, slug: "or-tambo-international-jnb" },
  { iata_code: "CAI", icao_code: "HECA", name: "Cairo International Airport", city: "Cairo", country: "Egypt", country_code: "EG", timezone: "Africa/Cairo", latitude: 30.1219, longitude: 31.4056, elevation_ft: 382, website: null, phone_local: null, phone_intl: null, total_terminals: 3, is_major: false, slug: "cairo-international-cai" },
  { iata_code: "LOS", icao_code: "DNMM", name: "Murtala Muhammed International Airport", city: "Lagos", country: "Nigeria", country_code: "NG", timezone: "Africa/Lagos", latitude: 6.5774, longitude: 3.3212, elevation_ft: 135, website: null, phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "murtala-muhammed-international-los" },
  { iata_code: "ADD", icao_code: "HAAB", name: "Bole International Airport", city: "Addis Ababa", country: "Ethiopia", country_code: "ET", timezone: "Africa/Addis_Ababa", latitude: 8.9779, longitude: 38.7993, elevation_ft: 7625, website: null, phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "bole-international-add" },
  { iata_code: "NBO", icao_code: "HKJK", name: "Jomo Kenyatta International Airport", city: "Nairobi", country: "Kenya", country_code: "KE", timezone: "Africa/Nairobi", latitude: -1.3192, longitude: 36.9278, elevation_ft: 5327, website: null, phone_local: null, phone_intl: null, total_terminals: 2, is_major: false, slug: "jomo-kenyatta-international-nbo" },
];

// ---------------------------------------------------------------------------
// 100 AIRLINES — real IATA/ICAO, alliances, fleet sizes, founding years
// ---------------------------------------------------------------------------
function airlineLogoUrl(iata: string): string {
  return `__PLACEHOLDER_${iata}__`;
}

function resolveAirlineLogos(list: AirlineSeed[]): AirlineSeed[] {
  return list.map((a) => {
    let logo = "";
    if (a.website) {
      try {
        const url = new URL(a.website);
        const origin = url.origin;
        logo = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(origin)}&size=128`;
      } catch { /* fall through */ }
    }
    if (!logo) {
      const label = (a.iata_code || a.name || "?").slice(0, 2).toUpperCase();
      logo = `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=1e293b&color=3b82f6&size=200&bold=true&format=png`;
    }
    return { ...a, logo_url: logo };
  });
}

const airlines: AirlineSeed[] = [
  // ── Gulf Carriers ──
  { iata_code: "EK", icao_code: "UAE", name: "Emirates", callsign: "EMIRATES", country: "United Arab Emirates", country_code: "AE", is_active: true, logo_url: airlineLogoUrl("EK"), website: "https://www.emirates.com", hub_airports: ["DXB"], alliance: null, fleet_size: 262, founded_year: 1985, slug: "emirates" },
  { iata_code: "QR", icao_code: "QTR", name: "Qatar Airways", callsign: "QATARI", country: "Qatar", country_code: "QA", is_active: true, logo_url: airlineLogoUrl("QR"), website: "https://www.qatarairways.com", hub_airports: ["DOH"], alliance: "oneworld", fleet_size: 250, founded_year: 1993, slug: "qatar-airways" },
  { iata_code: "EY", icao_code: "ETD", name: "Etihad Airways", callsign: "ETIHAD", country: "United Arab Emirates", country_code: "AE", is_active: true, logo_url: airlineLogoUrl("EY"), website: "https://www.etihad.com", hub_airports: ["AUH"], alliance: null, fleet_size: 100, founded_year: 2003, slug: "etihad-airways" },
  { iata_code: "FZ", icao_code: "FDB", name: "flydubai", callsign: "SKYDUBAI", country: "United Arab Emirates", country_code: "AE", is_active: true, logo_url: airlineLogoUrl("FZ"), website: "https://www.flydubai.com", hub_airports: ["DXB"], alliance: null, fleet_size: 79, founded_year: 2008, slug: "flydubai" },
  { iata_code: "G9", icao_code: "ABY", name: "Air Arabia", callsign: "ARABIA", country: "United Arab Emirates", country_code: "AE", is_active: true, logo_url: airlineLogoUrl("G9"), website: "https://www.airarabia.com", hub_airports: ["SHJ"], alliance: null, fleet_size: 60, founded_year: 2003, slug: "air-arabia" },
  { iata_code: "SV", icao_code: "SVA", name: "Saudia", callsign: "SAUDIA", country: "Saudi Arabia", country_code: "SA", is_active: true, logo_url: airlineLogoUrl("SV"), website: "https://www.saudia.com", hub_airports: ["JED", "RUH"], alliance: "SkyTeam", fleet_size: 150, founded_year: 1945, slug: "saudia" },
  { iata_code: "WY", icao_code: "OMA", name: "Oman Air", callsign: "OMAN AIR", country: "Oman", country_code: "OM", is_active: true, logo_url: airlineLogoUrl("WY"), website: "https://www.omanair.com", hub_airports: ["MCT"], alliance: null, fleet_size: 50, founded_year: 1993, slug: "oman-air" },
  { iata_code: "GF", icao_code: "GFA", name: "Gulf Air", callsign: "GULF AIR", country: "Bahrain", country_code: "BH", is_active: true, logo_url: airlineLogoUrl("GF"), website: "https://www.gulfair.com", hub_airports: ["BAH"], alliance: null, fleet_size: 35, founded_year: 1950, slug: "gulf-air" },
  { iata_code: "RJ", icao_code: "RJA", name: "Royal Jordanian", callsign: "JORDANIAN", country: "Jordan", country_code: "JO", is_active: true, logo_url: airlineLogoUrl("RJ"), website: "https://www.rj.com", hub_airports: ["AMM"], alliance: "oneworld", fleet_size: 25, founded_year: 1963, slug: "royal-jordanian" },

  // ── United States ──
  { iata_code: "AA", icao_code: "AAL", name: "American Airlines", callsign: "AMERICAN", country: "United States", country_code: "US", is_active: true, logo_url: airlineLogoUrl("AA"), website: "https://www.aa.com", hub_airports: ["DFW", "CLT", "MIA", "PHL", "PHX"], alliance: "oneworld", fleet_size: 950, founded_year: 1930, slug: "american-airlines" },
  { iata_code: "DL", icao_code: "DAL", name: "Delta Air Lines", callsign: "DELTA", country: "United States", country_code: "US", is_active: true, logo_url: airlineLogoUrl("DL"), website: "https://www.delta.com", hub_airports: ["ATL", "DTW", "MSP", "SEA", "LAX", "JFK"], alliance: "SkyTeam", fleet_size: 900, founded_year: 1929, slug: "delta-air-lines" },
  { iata_code: "UA", icao_code: "UAL", name: "United Airlines", callsign: "UNITED", country: "United States", country_code: "US", is_active: true, logo_url: airlineLogoUrl("UA"), website: "https://www.united.com", hub_airports: ["ORD", "IAH", "DEN", "SFO", "EWR", "IAD"], alliance: "Star Alliance", fleet_size: 900, founded_year: 1926, slug: "united-airlines" },
  { iata_code: "WN", icao_code: "SWA", name: "Southwest Airlines", callsign: "SOUTHWEST", country: "United States", country_code: "US", is_active: true, logo_url: airlineLogoUrl("WN"), website: "https://www.southwest.com", hub_airports: ["MDW", "BWI", "DEN"], alliance: null, fleet_size: 800, founded_year: 1967, slug: "southwest-airlines" },
  { iata_code: "B6", icao_code: "JBU", name: "JetBlue Airways", callsign: "JETBLUE", country: "United States", country_code: "US", is_active: true, logo_url: airlineLogoUrl("B6"), website: "https://www.jetblue.com", hub_airports: ["JFK", "BOS", "FLL"], alliance: null, fleet_size: 280, founded_year: 1998, slug: "jetblue-airways" },
  { iata_code: "NK", icao_code: "NKS", name: "Spirit Airlines", callsign: "SPIRIT WINGS", country: "United States", country_code: "US", is_active: true, logo_url: airlineLogoUrl("NK"), website: "https://www.spirit.com", hub_airports: ["FLL"], alliance: null, fleet_size: 190, founded_year: 1983, slug: "spirit-airlines" },
  { iata_code: "F9", icao_code: "FFT", name: "Frontier Airlines", callsign: "FRONTIER", country: "United States", country_code: "US", is_active: true, logo_url: airlineLogoUrl("F9"), website: "https://www.flyfrontier.com", hub_airports: ["DEN"], alliance: null, fleet_size: 120, founded_year: 1994, slug: "frontier-airlines" },
  { iata_code: "AS", icao_code: "ASA", name: "Alaska Airlines", callsign: "ALASKA", country: "United States", country_code: "US", is_active: true, logo_url: airlineLogoUrl("AS"), website: "https://www.alaskaair.com", hub_airports: ["SEA", "PDX", "SFO"], alliance: "oneworld", fleet_size: 330, founded_year: 1932, slug: "alaska-airlines" },
  { iata_code: "HA", icao_code: "HAL", name: "Hawaiian Airlines", callsign: "HAWAIIAN", country: "United States", country_code: "US", is_active: true, logo_url: airlineLogoUrl("HA"), website: "https://www.hawaiianairlines.com", hub_airports: ["HNL"], alliance: null, fleet_size: 60, founded_year: 1929, slug: "hawaiian-airlines" },
  { iata_code: "G4", icao_code: "AAY", name: "Allegiant Air", callsign: "ALLEGIANT", country: "United States", country_code: "US", is_active: true, logo_url: airlineLogoUrl("G4"), website: "https://www.allegiantair.com", hub_airports: ["LAS"], alliance: null, fleet_size: 120, founded_year: 1997, slug: "allegiant-air" },
  { iata_code: "MX", icao_code: "MXY", name: "Breeze Airways", callsign: "BREEZE", country: "United States", country_code: "US", is_active: true, logo_url: airlineLogoUrl("MX"), website: "https://www.flybreeze.com", hub_airports: [], alliance: null, fleet_size: 30, founded_year: 2021, slug: "breeze-airways" },
  { iata_code: "SY", icao_code: "SCX", name: "Sun Country Airlines", callsign: "SUN COUNTRY", country: "United States", country_code: "US", is_active: true, logo_url: airlineLogoUrl("SY"), website: "https://www.suncountry.com", hub_airports: ["MSP"], alliance: null, fleet_size: 50, founded_year: 1983, slug: "sun-country-airlines" },

  // ── Canada ──
  { iata_code: "AC", icao_code: "ACA", name: "Air Canada", callsign: "CANAIR", country: "Canada", country_code: "CA", is_active: true, logo_url: airlineLogoUrl("AC"), website: "https://www.aircanada.com", hub_airports: ["YYZ", "YVR", "YUL"], alliance: "Star Alliance", fleet_size: 200, founded_year: 1937, slug: "air-canada" },
  { iata_code: "WS", icao_code: "WJA", name: "WestJet", callsign: "WESTJET", country: "Canada", country_code: "CA", is_active: true, logo_url: airlineLogoUrl("WS"), website: "https://www.westjet.com", hub_airports: ["YYC"], alliance: null, fleet_size: 180, founded_year: 1996, slug: "westjet" },
  { iata_code: "TS", icao_code: "TSC", name: "Air Transat", callsign: "TRANSAT", country: "Canada", country_code: "CA", is_active: true, logo_url: airlineLogoUrl("TS"), website: "https://www.airtransat.com", hub_airports: ["YUL"], alliance: null, fleet_size: 40, founded_year: 1987, slug: "air-transat" },
  { iata_code: "PD", icao_code: "POE", name: "Porter Airlines", callsign: "PORTER", country: "Canada", country_code: "CA", is_active: true, logo_url: airlineLogoUrl("PD"), website: "https://www.flyporter.com", hub_airports: ["YTZ", "YOW"], alliance: null, fleet_size: 40, founded_year: 2006, slug: "porter-airlines" },

  // ── Europe — Major ──
  { iata_code: "BA", icao_code: "BAW", name: "British Airways", callsign: "SPEEDBIRD", country: "United Kingdom", country_code: "GB", is_active: true, logo_url: airlineLogoUrl("BA"), website: "https://www.britishairways.com", hub_airports: ["LHR"], alliance: "oneworld", fleet_size: 270, founded_year: 1974, slug: "british-airways" },
  { iata_code: "LH", icao_code: "DLH", name: "Lufthansa", callsign: "LUFTHANSA", country: "Germany", country_code: "DE", is_active: true, logo_url: airlineLogoUrl("LH"), website: "https://www.lufthansa.com", hub_airports: ["FRA", "MUC"], alliance: "Star Alliance", fleet_size: 280, founded_year: 1953, slug: "lufthansa" },
  { iata_code: "AF", icao_code: "AFR", name: "Air France", callsign: "AIRFRANS", country: "France", country_code: "FR", is_active: true, logo_url: airlineLogoUrl("AF"), website: "https://www.airfrance.com", hub_airports: ["CDG"], alliance: "SkyTeam", fleet_size: 220, founded_year: 1933, slug: "air-france" },
  { iata_code: "KL", icao_code: "KLM", name: "KLM Royal Dutch Airlines", callsign: "KLM", country: "Netherlands", country_code: "NL", is_active: true, logo_url: airlineLogoUrl("KL"), website: "https://www.klm.com", hub_airports: ["AMS"], alliance: "SkyTeam", fleet_size: 170, founded_year: 1919, slug: "klm" },
  { iata_code: "IB", icao_code: "IBE", name: "Iberia", callsign: "IBERIA", country: "Spain", country_code: "ES", is_active: true, logo_url: airlineLogoUrl("IB"), website: "https://www.iberia.com", hub_airports: ["MAD"], alliance: "oneworld", fleet_size: 130, founded_year: 1927, slug: "iberia" },
  { iata_code: "TK", icao_code: "THY", name: "Turkish Airlines", callsign: "TURKISH", country: "Turkey", country_code: "TR", is_active: true, logo_url: airlineLogoUrl("TK"), website: "https://www.turkishairlines.com", hub_airports: ["IST"], alliance: "Star Alliance", fleet_size: 380, founded_year: 1933, slug: "turkish-airlines" },
  { iata_code: "LX", icao_code: "SWR", name: "Swiss International Air Lines", callsign: "SWISS", country: "Switzerland", country_code: "CH", is_active: true, logo_url: airlineLogoUrl("LX"), website: "https://www.swiss.com", hub_airports: ["ZRH"], alliance: "Star Alliance", fleet_size: 90, founded_year: 2002, slug: "swiss" },
  { iata_code: "OS", icao_code: "AUA", name: "Austrian Airlines", callsign: "AUSTRIAN", country: "Austria", country_code: "AT", is_active: true, logo_url: airlineLogoUrl("OS"), website: "https://www.austrian.com", hub_airports: ["VIE"], alliance: "Star Alliance", fleet_size: 80, founded_year: 1957, slug: "austrian-airlines" },
  { iata_code: "SN", icao_code: "BEL", name: "Brussels Airlines", callsign: "BEELINE", country: "Belgium", country_code: "BE", is_active: true, logo_url: airlineLogoUrl("SN"), website: "https://www.brusselsairlines.com", hub_airports: ["BRU"], alliance: "Star Alliance", fleet_size: 40, founded_year: 2006, slug: "brussels-airlines" },
  { iata_code: "TP", icao_code: "TAP", name: "TAP Air Portugal", callsign: "AIR PORTUGAL", country: "Portugal", country_code: "PT", is_active: true, logo_url: airlineLogoUrl("TP"), website: "https://www.flytap.com", hub_airports: ["LIS"], alliance: "Star Alliance", fleet_size: 100, founded_year: 1945, slug: "tap-air-portugal" },
  { iata_code: "EI", icao_code: "EIN", name: "Aer Lingus", callsign: "SHAMROCK", country: "Ireland", country_code: "IE", is_active: true, logo_url: airlineLogoUrl("EI"), website: "https://www.aerlingus.com", hub_airports: ["DUB"], alliance: null, fleet_size: 50, founded_year: 1936, slug: "aer-lingus" },
  { iata_code: "FI", icao_code: "ICE", name: "Icelandair", callsign: "ICEAIR", country: "Iceland", country_code: "IS", is_active: true, logo_url: airlineLogoUrl("FI"), website: "https://www.icelandair.com", hub_airports: ["KEF"], alliance: null, fleet_size: 40, founded_year: 1937, slug: "icelandair" },
  { iata_code: "SK", icao_code: "SAS", name: "SAS Scandinavian Airlines", callsign: "SCANDINAVIAN", country: "Sweden", country_code: "SE", is_active: true, logo_url: airlineLogoUrl("SK"), website: "https://www.flysas.com", hub_airports: ["CPH", "ARN", "OSL"], alliance: "SkyTeam", fleet_size: 130, founded_year: 1946, slug: "sas-scandinavian-airlines" },
  { iata_code: "DY", icao_code: "NAX", name: "Norwegian Air Shuttle", callsign: "NOR SHUTTLE", country: "Norway", country_code: "NO", is_active: true, logo_url: airlineLogoUrl("DY"), website: "https://www.norwegian.com", hub_airports: ["OSL"], alliance: null, fleet_size: 80, founded_year: 1993, slug: "norwegian" },
  { iata_code: "AY", icao_code: "FIN", name: "Finnair", callsign: "FINNAIR", country: "Finland", country_code: "FI", is_active: true, logo_url: airlineLogoUrl("AY"), website: "https://www.finnair.com", hub_airports: ["HEL"], alliance: "oneworld", fleet_size: 80, founded_year: 1923, slug: "finnair" },
  { iata_code: "LO", icao_code: "LOT", name: "LOT Polish Airlines", callsign: "LOT", country: "Poland", country_code: "PL", is_active: true, logo_url: airlineLogoUrl("LO"), website: "https://www.lot.com", hub_airports: ["WAW"], alliance: "Star Alliance", fleet_size: 80, founded_year: 1929, slug: "lot-polish-airlines" },

  // ── Europe — Low Cost ──
  { iata_code: "FR", icao_code: "RYR", name: "Ryanair", callsign: "RYANAIR", country: "Ireland", country_code: "IE", is_active: true, logo_url: airlineLogoUrl("FR"), website: "https://www.ryanair.com", hub_airports: ["DUB"], alliance: null, fleet_size: 500, founded_year: 1984, slug: "ryanair" },
  { iata_code: "U2", icao_code: "EZY", name: "easyJet", callsign: "EASY", country: "United Kingdom", country_code: "GB", is_active: true, logo_url: airlineLogoUrl("U2"), website: "https://www.easyjet.com", hub_airports: ["LTN", "LGW"], alliance: null, fleet_size: 340, founded_year: 1995, slug: "easyjet" },
  { iata_code: "W6", icao_code: "WZZ", name: "Wizz Air", callsign: "WIZZAIR", country: "Hungary", country_code: "HU", is_active: true, logo_url: airlineLogoUrl("W6"), website: "https://www.wizzair.com", hub_airports: ["BUD"], alliance: null, fleet_size: 200, founded_year: 2003, slug: "wizz-air" },
  { iata_code: "VY", icao_code: "VLG", name: "Vueling", callsign: "VUELING", country: "Spain", country_code: "ES", is_active: true, logo_url: airlineLogoUrl("VY"), website: "https://www.vueling.com", hub_airports: ["BCN"], alliance: null, fleet_size: 130, founded_year: 2004, slug: "vueling" },
  { iata_code: "PC", icao_code: "PGT", name: "Pegasus Airlines", callsign: "SUNTURK", country: "Turkey", country_code: "TR", is_active: true, logo_url: airlineLogoUrl("PC"), website: "https://www.flypgs.com", hub_airports: ["SAW"], alliance: null, fleet_size: 100, founded_year: 1990, slug: "pegasus-airlines" },
  { iata_code: "A3", icao_code: "AEE", name: "Aegean Airlines", callsign: "AEGEAN", country: "Greece", country_code: "GR", is_active: true, logo_url: airlineLogoUrl("A3"), website: "https://www.aegeanair.com", hub_airports: ["ATH"], alliance: "Star Alliance", fleet_size: 60, founded_year: 1999, slug: "aegean-airlines" },
  { iata_code: "DE", icao_code: "CFG", name: "Condor", callsign: "CONDOR", country: "Germany", country_code: "DE", is_active: true, logo_url: airlineLogoUrl("DE"), website: "https://www.condor.com", hub_airports: ["FRA"], alliance: null, fleet_size: 50, founded_year: 1955, slug: "condor" },
  { iata_code: "EW", icao_code: "EWG", name: "Eurowings", callsign: "EUROWINGS", country: "Germany", country_code: "DE", is_active: true, logo_url: airlineLogoUrl("EW"), website: "https://www.eurowings.com", hub_airports: ["CGN", "DUS"], alliance: null, fleet_size: 100, founded_year: 1993, slug: "eurowings" },
  { iata_code: "BT", icao_code: "BTI", name: "airBaltic", callsign: "AIRBALTIC", country: "Latvia", country_code: "LV", is_active: true, logo_url: airlineLogoUrl("BT"), website: "https://www.airbaltic.com", hub_airports: ["RIX"], alliance: null, fleet_size: 45, founded_year: 1995, slug: "airbaltic" },
  { iata_code: "OU", icao_code: "CTN", name: "Croatia Airlines", callsign: "CROATIA", country: "Croatia", country_code: "HR", is_active: true, logo_url: airlineLogoUrl("OU"), website: "https://www.croatiaairlines.com", hub_airports: ["ZAG"], alliance: "Star Alliance", fleet_size: 12, founded_year: 1989, slug: "croatia-airlines" },
  { iata_code: "RO", icao_code: "ROT", name: "TAROM", callsign: "TAROM", country: "Romania", country_code: "RO", is_active: true, logo_url: airlineLogoUrl("RO"), website: "https://www.tarom.ro", hub_airports: ["OTP"], alliance: "SkyTeam", fleet_size: 25, founded_year: 1954, slug: "tarom" },
  { iata_code: "HV", icao_code: "TRA", name: "Transavia", callsign: "TRANSAVIA", country: "Netherlands", country_code: "NL", is_active: true, logo_url: airlineLogoUrl("HV"), website: "https://www.transavia.com", hub_airports: ["AMS"], alliance: null, fleet_size: 50, founded_year: 1966, slug: "transavia" },

  // ── Asia-Pacific ──
  { iata_code: "SQ", icao_code: "SIA", name: "Singapore Airlines", callsign: "SINGAPORE", country: "Singapore", country_code: "SG", is_active: true, logo_url: airlineLogoUrl("SQ"), website: "https://www.singaporeair.com", hub_airports: ["SIN"], alliance: "Star Alliance", fleet_size: 150, founded_year: 1947, slug: "singapore-airlines" },
  { iata_code: "CX", icao_code: "CPA", name: "Cathay Pacific", callsign: "CATHAY", country: "Hong Kong", country_code: "HK", is_active: true, logo_url: airlineLogoUrl("CX"), website: "https://www.cathaypacific.com", hub_airports: ["HKG"], alliance: "oneworld", fleet_size: 200, founded_year: 1946, slug: "cathay-pacific" },
  { iata_code: "JL", icao_code: "JAL", name: "Japan Airlines", callsign: "JAPANAIR", country: "Japan", country_code: "JP", is_active: true, logo_url: airlineLogoUrl("JL"), website: "https://www.jal.co.jp", hub_airports: ["NRT", "HND"], alliance: "oneworld", fleet_size: 230, founded_year: 1951, slug: "japan-airlines" },
  { iata_code: "NH", icao_code: "ANA", name: "All Nippon Airways", callsign: "ALL NIPPON", country: "Japan", country_code: "JP", is_active: true, logo_url: airlineLogoUrl("NH"), website: "https://www.ana.co.jp", hub_airports: ["NRT", "HND"], alliance: "Star Alliance", fleet_size: 220, founded_year: 1952, slug: "all-nippon-airways" },
  { iata_code: "KE", icao_code: "KAL", name: "Korean Air", callsign: "KOREANAIR", country: "South Korea", country_code: "KR", is_active: true, logo_url: airlineLogoUrl("KE"), website: "https://www.koreanair.com", hub_airports: ["ICN"], alliance: "SkyTeam", fleet_size: 160, founded_year: 1969, slug: "korean-air" },
  { iata_code: "OZ", icao_code: "AAR", name: "Asiana Airlines", callsign: "ASIANA", country: "South Korea", country_code: "KR", is_active: true, logo_url: airlineLogoUrl("OZ"), website: "https://www.flyasiana.com", hub_airports: ["ICN"], alliance: "Star Alliance", fleet_size: 80, founded_year: 1988, slug: "asiana-airlines" },
  { iata_code: "TG", icao_code: "THA", name: "Thai Airways", callsign: "THAI", country: "Thailand", country_code: "TH", is_active: true, logo_url: airlineLogoUrl("TG"), website: "https://www.thaiairways.com", hub_airports: ["BKK"], alliance: "Star Alliance", fleet_size: 80, founded_year: 1960, slug: "thai-airways" },
  { iata_code: "MH", icao_code: "MAS", name: "Malaysia Airlines", callsign: "MALAYSIAN", country: "Malaysia", country_code: "MY", is_active: true, logo_url: airlineLogoUrl("MH"), website: "https://www.malaysiaairlines.com", hub_airports: ["KUL"], alliance: "oneworld", fleet_size: 80, founded_year: 1947, slug: "malaysia-airlines" },
  { iata_code: "AK", icao_code: "AXM", name: "AirAsia", callsign: "RED CAP", country: "Malaysia", country_code: "MY", is_active: true, logo_url: airlineLogoUrl("AK"), website: "https://www.airasia.com", hub_airports: ["KUL"], alliance: null, fleet_size: 100, founded_year: 1993, slug: "airasia" },
  { iata_code: "GA", icao_code: "GIA", name: "Garuda Indonesia", callsign: "INDONESIA", country: "Indonesia", country_code: "ID", is_active: true, logo_url: airlineLogoUrl("GA"), website: "https://www.garuda-indonesia.com", hub_airports: ["CGK"], alliance: "SkyTeam", fleet_size: 60, founded_year: 1949, slug: "garuda-indonesia" },
  { iata_code: "JT", icao_code: "LNI", name: "Lion Air", callsign: "LION INTER", country: "Indonesia", country_code: "ID", is_active: true, logo_url: airlineLogoUrl("JT"), website: "https://www.lionair.co.id", hub_airports: ["CGK"], alliance: null, fleet_size: 100, founded_year: 1999, slug: "lion-air" },
  { iata_code: "ID", icao_code: "BTK", name: "Batik Air", callsign: "BATIK", country: "Indonesia", country_code: "ID", is_active: true, logo_url: airlineLogoUrl("ID"), website: "https://www.batikair.com", hub_airports: ["CGK"], alliance: null, fleet_size: 80, founded_year: 2013, slug: "batik-air" },
  { iata_code: "PR", icao_code: "PAL", name: "Philippine Airlines", callsign: "PHILIPPINE", country: "Philippines", country_code: "PH", is_active: true, logo_url: airlineLogoUrl("PR"), website: "https://www.philippineairlines.com", hub_airports: ["MNL"], alliance: null, fleet_size: 70, founded_year: 1941, slug: "philippine-airlines" },
  { iata_code: "5J", icao_code: "CEB", name: "Cebu Pacific", callsign: "CEBU", country: "Philippines", country_code: "PH", is_active: true, logo_url: airlineLogoUrl("5J"), website: "https://www.cebupacificair.com", hub_airports: ["MNL"], alliance: null, fleet_size: 80, founded_year: 1988, slug: "cebu-pacific" },
  { iata_code: "VN", icao_code: "HVN", name: "Vietnam Airlines", callsign: "VIETNAM AIRLINES", country: "Vietnam", country_code: "VN", is_active: true, logo_url: airlineLogoUrl("VN"), website: "https://www.vietnamairlines.com", hub_airports: ["HAN", "SGN"], alliance: "SkyTeam", fleet_size: 100, founded_year: 1956, slug: "vietnam-airlines" },
  { iata_code: "VJ", icao_code: "VJC", name: "Vietjet Air", callsign: "VIETJETAIR", country: "Vietnam", country_code: "VN", is_active: true, logo_url: airlineLogoUrl("VJ"), website: "https://www.vietjetair.com", hub_airports: ["HAN", "SGN"], alliance: null, fleet_size: 100, founded_year: 2007, slug: "vietjet-air" },
  { iata_code: "CI", icao_code: "CAL", name: "China Airlines", callsign: "DYNASTY", country: "Taiwan", country_code: "TW", is_active: true, logo_url: airlineLogoUrl("CI"), website: "https://www.china-airlines.com", hub_airports: ["TPE"], alliance: "SkyTeam", fleet_size: 80, founded_year: 1959, slug: "china-airlines" },
  { iata_code: "BR", icao_code: "EVA", name: "EVA Air", callsign: "EVA", country: "Taiwan", country_code: "TW", is_active: true, logo_url: airlineLogoUrl("BR"), website: "https://www.evaair.com", hub_airports: ["TPE"], alliance: "Star Alliance", fleet_size: 80, founded_year: 1989, slug: "eva-air" },
  { iata_code: "CZ", icao_code: "CSN", name: "China Southern Airlines", callsign: "CHINA SOUTHERN", country: "China", country_code: "CN", is_active: true, logo_url: airlineLogoUrl("CZ"), website: "https://www.csair.com", hub_airports: ["CAN", "PEK"], alliance: "SkyTeam", fleet_size: 600, founded_year: 1988, slug: "china-southern-airlines" },
  { iata_code: "MU", icao_code: "CES", name: "China Eastern Airlines", callsign: "CHINA EASTERN", country: "China", country_code: "CN", is_active: true, logo_url: airlineLogoUrl("MU"), website: "https://www.ceair.com", hub_airports: ["PVG", "PEK"], alliance: "SkyTeam", fleet_size: 600, founded_year: 1988, slug: "china-eastern-airlines" },
  { iata_code: "CA", icao_code: "CCA", name: "Air China", callsign: "AIR CHINA", country: "China", country_code: "CN", is_active: true, logo_url: airlineLogoUrl("CA"), website: "https://www.airchina.com", hub_airports: ["PEK"], alliance: "Star Alliance", fleet_size: 450, founded_year: 1988, slug: "air-china" },
  { iata_code: "HU", icao_code: "CHH", name: "Hainan Airlines", callsign: "HAINAN", country: "China", country_code: "CN", is_active: true, logo_url: airlineLogoUrl("HU"), website: "https://www.hainanairlines.com", hub_airports: ["HAK", "PEK"], alliance: null, fleet_size: 200, founded_year: 1993, slug: "hainan-airlines" },
  { iata_code: "9C", icao_code: "CQH", name: "Spring Airlines", callsign: "AIR SPRING", country: "China", country_code: "CN", is_active: true, logo_url: airlineLogoUrl("9C"), website: "https://www.ch.com", hub_airports: ["PVG"], alliance: null, fleet_size: 110, founded_year: 2004, slug: "spring-airlines" },
  { iata_code: "MF", icao_code: "CXA", name: "Xiamen Airlines", callsign: "XIAMEN AIR", country: "China", country_code: "CN", is_active: true, logo_url: airlineLogoUrl("MF"), website: "https://www.xiamenair.com", hub_airports: ["XMN"], alliance: "SkyTeam", fleet_size: 200, founded_year: 1984, slug: "xiamen-airlines" },
  { iata_code: "TR", icao_code: "TGW", name: "Scoot", callsign: "SCOOTER", country: "Singapore", country_code: "SG", is_active: true, logo_url: airlineLogoUrl("TR"), website: "https://www.flyscoot.com", hub_airports: ["SIN"], alliance: null, fleet_size: 50, founded_year: 2011, slug: "scoot" },
  { iata_code: "MM", icao_code: "APJ", name: "Peach Aviation", callsign: "AIR PEACH", country: "Japan", country_code: "JP", is_active: true, logo_url: airlineLogoUrl("MM"), website: "https://www.flypeach.com", hub_airports: ["KIX"], alliance: null, fleet_size: 35, founded_year: 2011, slug: "peach-aviation" },
  { iata_code: "JQ", icao_code: "JST", name: "Jetstar Airways", callsign: "JETSTAR", country: "Australia", country_code: "AU", is_active: true, logo_url: airlineLogoUrl("JQ"), website: "https://www.jetstar.com", hub_airports: ["MEL", "SYD"], alliance: null, fleet_size: 70, founded_year: 2003, slug: "jetstar-airways" },

  // ── India & South Asia ──
  { iata_code: "AI", icao_code: "AIC", name: "Air India", callsign: "AIRINDIA", country: "India", country_code: "IN", is_active: true, logo_url: airlineLogoUrl("AI"), website: "https://www.airindia.com", hub_airports: ["DEL", "BOM"], alliance: "Star Alliance", fleet_size: 150, founded_year: 1932, slug: "air-india" },
  { iata_code: "6E", icao_code: "IGO", name: "IndiGo", callsign: "IFLY", country: "India", country_code: "IN", is_active: true, logo_url: airlineLogoUrl("6E"), website: "https://www.goindigo.in", hub_airports: ["DEL", "BOM"], alliance: null, fleet_size: 350, founded_year: 2006, slug: "indigo" },
  { iata_code: "SG", icao_code: "SEJ", name: "SpiceJet", callsign: "SPICEJET", country: "India", country_code: "IN", is_active: true, logo_url: airlineLogoUrl("SG"), website: "https://www.spicejet.com", hub_airports: ["DEL"], alliance: null, fleet_size: 50, founded_year: 2005, slug: "spicejet" },
  { iata_code: "UL", icao_code: "ALK", name: "SriLankan Airlines", callsign: "SRILANKAN", country: "Sri Lanka", country_code: "LK", is_active: true, logo_url: airlineLogoUrl("UL"), website: "https://www.srilankan.com", hub_airports: ["CMB"], alliance: "oneworld", fleet_size: 25, founded_year: 1979, slug: "srilankan-airlines" },
  { iata_code: "PK", icao_code: "PIA", name: "Pakistan International Airlines", callsign: "PAKISTAN", country: "Pakistan", country_code: "PK", is_active: true, logo_url: airlineLogoUrl("PK"), website: "https://www.piac.com.pk", hub_airports: ["ISB", "KHI"], alliance: null, fleet_size: 30, founded_year: 1946, slug: "pakistan-international-airlines" },

  // ── Oceania ──
  { iata_code: "QF", icao_code: "QFA", name: "Qantas", callsign: "QANTAS", country: "Australia", country_code: "AU", is_active: true, logo_url: airlineLogoUrl("QF"), website: "https://www.qantas.com", hub_airports: ["SYD", "MEL"], alliance: "oneworld", fleet_size: 130, founded_year: 1920, slug: "qantas" },
  { iata_code: "NZ", icao_code: "ANZ", name: "Air New Zealand", callsign: "NEW ZEALAND", country: "New Zealand", country_code: "NZ", is_active: true, logo_url: airlineLogoUrl("NZ"), website: "https://www.airnewzealand.co.nz", hub_airports: ["AKL"], alliance: "Star Alliance", fleet_size: 110, founded_year: 1940, slug: "air-new-zealand" },

  // ── Africa ──
  { iata_code: "MS", icao_code: "MSR", name: "EgyptAir", callsign: "EGYPTAIR", country: "Egypt", country_code: "EG", is_active: true, logo_url: airlineLogoUrl("MS"), website: "https://www.egyptair.com", hub_airports: ["CAI"], alliance: "Star Alliance", fleet_size: 70, founded_year: 1932, slug: "egyptair" },
  { iata_code: "ET", icao_code: "ETH", name: "Ethiopian Airlines", callsign: "ETHIOPIAN", country: "Ethiopia", country_code: "ET", is_active: true, logo_url: airlineLogoUrl("ET"), website: "https://www.ethiopianairlines.com", hub_airports: ["ADD"], alliance: "Star Alliance", fleet_size: 130, founded_year: 1945, slug: "ethiopian-airlines" },
  { iata_code: "KQ", icao_code: "KQA", name: "Kenya Airways", callsign: "KENYA", country: "Kenya", country_code: "KE", is_active: true, logo_url: airlineLogoUrl("KQ"), website: "https://www.kenya-airways.com", hub_airports: ["NBO"], alliance: "SkyTeam", fleet_size: 35, founded_year: 1977, slug: "kenya-airways" },
  { iata_code: "SA", icao_code: "SAA", name: "South African Airways", callsign: "SPRINGBOK", country: "South Africa", country_code: "ZA", is_active: true, logo_url: airlineLogoUrl("SA"), website: "https://www.flysaa.com", hub_airports: ["JNB"], alliance: "Star Alliance", fleet_size: 20, founded_year: 1934, slug: "south-african-airways" },
  { iata_code: "AT", icao_code: "RAM", name: "Royal Air Maroc", callsign: "ROYAL AIR MAROC", country: "Morocco", country_code: "MA", is_active: true, logo_url: airlineLogoUrl("AT"), website: "https://www.royalairmaroc.com", hub_airports: ["CMN"], alliance: "oneworld", fleet_size: 50, founded_year: 1957, slug: "royal-air-maroc" },

  // ── Latin America ──
  { iata_code: "LA", icao_code: "LAN", name: "LATAM Airlines", callsign: "LAN", country: "Chile", country_code: "CL", is_active: true, logo_url: airlineLogoUrl("LA"), website: "https://www.latamairlines.com", hub_airports: ["SCL", "GRU"], alliance: null, fleet_size: 320, founded_year: 1929, slug: "latam-airlines" },
  { iata_code: "AV", icao_code: "AVA", name: "Avianca", callsign: "AVIANCA", country: "Colombia", country_code: "CO", is_active: true, logo_url: airlineLogoUrl("AV"), website: "https://www.avianca.com", hub_airports: ["BOG"], alliance: "Star Alliance", fleet_size: 130, founded_year: 1919, slug: "avianca" },
  { iata_code: "CM", icao_code: "CMP", name: "Copa Airlines", callsign: "COPA", country: "Panama", country_code: "PA", is_active: true, logo_url: airlineLogoUrl("CM"), website: "https://www.copaair.com", hub_airports: ["PTY"], alliance: "Star Alliance", fleet_size: 100, founded_year: 1947, slug: "copa-airlines" },
  { iata_code: "AR", icao_code: "ARG", name: "Aerolíneas Argentinas", callsign: "ARGENTINA", country: "Argentina", country_code: "AR", is_active: true, logo_url: airlineLogoUrl("AR"), website: "https://www.aerolineas.com.ar", hub_airports: ["EZE"], alliance: "SkyTeam", fleet_size: 80, founded_year: 1950, slug: "aerolineas-argentinas" },
  { iata_code: "AD", icao_code: "AZU", name: "Azul Brazilian Airlines", callsign: "AZUL", country: "Brazil", country_code: "BR", is_active: true, logo_url: airlineLogoUrl("AD"), website: "https://www.voeazul.com.br", hub_airports: ["VCP", "CNF"], alliance: null, fleet_size: 180, founded_year: 2008, slug: "azul-brazilian-airlines" },
  { iata_code: "G3", icao_code: "GLO", name: "GOL Linhas Aéreas", callsign: "GOL TRANSPORTE", country: "Brazil", country_code: "BR", is_active: true, logo_url: airlineLogoUrl("G3"), website: "https://www.voegol.com.br", hub_airports: ["GRU", "CGH"], alliance: null, fleet_size: 130, founded_year: 2000, slug: "gol-linhas-aereas" },
  { iata_code: "Y4", icao_code: "VOI", name: "Volaris", callsign: "VOLARIS", country: "Mexico", country_code: "MX", is_active: true, logo_url: airlineLogoUrl("Y4"), website: "https://www.volaris.com", hub_airports: ["MEX", "TLC"], alliance: null, fleet_size: 120, founded_year: 2006, slug: "volaris" },
  { iata_code: "VB", icao_code: "VIV", name: "VivaAerobus", callsign: "AEROENLACES", country: "Mexico", country_code: "MX", is_active: true, logo_url: airlineLogoUrl("VB"), website: "https://www.vivaaerobus.com", hub_airports: ["MTY"], alliance: null, fleet_size: 70, founded_year: 2006, slug: "vivaaerobus" },
];

// ---------------------------------------------------------------------------
// AIRPORT ↔ AIRLINE relationships (200+)
// Key: airline IATA → { airports it operates at, which ones are hubs }
// ---------------------------------------------------------------------------
const airlinePresence: Record<string, { hubs: string[]; airports: string[] }> = {
  EK: { hubs: ["DXB"], airports: ["JFK", "LAX", "SFO", "ORD", "DFW", "BOS", "IAD", "MIA", "SEA", "LHR", "CDG", "FRA", "AMS", "MUC", "ZRH", "IST", "BCN", "MAD", "FCO", "SIN", "BKK", "HKG", "ICN", "NRT", "DEL", "BOM", "SYD", "MEL", "AKL", "DOH", "CAI", "JNB", "NBO", "ADD", "GRU", "EZE", "GIG"] },
  QR: { hubs: ["DOH"], airports: ["LHR", "CDG", "FRA", "AMS", "IST", "JFK", "LAX", "ORD", "MIA", "DFW", "SIN", "BKK", "HKG", "ICN", "NRT", "DEL", "BOM", "SYD", "MEL", "DXB", "CAI", "JNB", "NBO", "ADD", "GRU", "ATH", "FCO", "MAD", "BCN", "MNL", "CGK", "KUL"] },
  EY: { hubs: ["AUH"], airports: ["LHR", "CDG", "FRA", "JFK", "ORD", "LAX", "SIN", "BKK", "HKG", "DEL", "BOM", "SYD", "MEL", "CAI", "IST", "FCO", "AMS", "MUC"] },
  AA: { hubs: ["DFW", "CLT", "MIA", "PHL", "PHX"], airports: ["JFK", "LAX", "SFO", "ORD", "BOS", "SEA", "DEN", "EWR", "IAD", "IAH", "MCO", "SAN", "TPA", "FLL", "HNL", "LHR", "CDG", "NRT", "GRU", "EZE", "MEX", "CUN"] },
  DL: { hubs: ["ATL", "DTW", "MSP", "SEA", "LAX", "JFK"], airports: ["SFO", "BOS", "SLC", "EWR", "LHR", "CDG", "AMS", "FRA", "NRT", "ICN", "HND", "SIN", "SYD", "GRU", "MEX", "CUN", "MIA", "ORD", "DEN", "MCO", "FLL", "TPA", "PDX", "HNL"] },
  UA: { hubs: ["ORD", "IAH", "DEN", "SFO", "EWR", "IAD"], airports: ["JFK", "LAX", "BOS", "SEA", "PHX", "MCO", "SAN", "PDX", "SLC", "HNL", "ANC", "LHR", "FRA", "NRT", "HND", "ICN", "SIN", "SYD", "DEL", "BOM", "GRU", "MEX", "CUN", "PTY", "BOG"] },
  WN: { hubs: ["MDW", "BWI", "DEN"], airports: ["LAX", "PHX", "SFO", "SAN", "MCO", "FLL", "TPA", "ATL", "DFW", "IAH", "SEA", "PDX", "SLC", "BOS", "PHL", "CLT", "MSP", "DTW", "HNL"] },
  BA: { hubs: ["LHR"], airports: ["JFK", "LAX", "SFO", "ORD", "BOS", "MIA", "DFW", "CDG", "AMS", "FRA", "MUC", "MAD", "BCN", "FCO", "ATH", "IST", "DXB", "DOH", "SIN", "BKK", "HKG", "NRT", "DEL", "BOM", "SYD", "JNB", "CAI", "DUB", "EDI", "GRU"] },
  LH: { hubs: ["FRA", "MUC"], airports: ["LHR", "CDG", "AMS", "ZRH", "VIE", "IST", "MAD", "BCN", "FCO", "ATH", "JFK", "LAX", "SFO", "ORD", "MIA", "IAD", "DFW", "BOS", "SIN", "BKK", "HKG", "NRT", "HND", "DEL", "BOM", "DXB", "DOH", "JNB", "GRU", "EZE", "MEX", "WAW", "BUD", "PRG"] },
  AF: { hubs: ["CDG"], airports: ["LHR", "AMS", "FRA", "MUC", "FCO", "MAD", "BCN", "ATH", "IST", "JFK", "LAX", "SFO", "MIA", "ORD", "IAD", "SIN", "BKK", "HKG", "NRT", "DEL", "BOM", "DXB", "DOH", "CAI", "JNB", "GRU", "EZE", "MEX", "DUB", "LIS", "WAW", "BUD", "PRG"] },
  KL: { hubs: ["AMS"], airports: ["LHR", "CDG", "FRA", "MUC", "FCO", "MAD", "BCN", "ATH", "IST", "JFK", "LAX", "SFO", "ORD", "MIA", "IAH", "SIN", "BKK", "HKG", "NRT", "DEL", "BOM", "DXB", "DOH", "CAI", "JNB", "NBO", "GRU", "LIS", "DUB", "CPH", "OSL", "ARN", "HEL"] },
  SQ: { hubs: ["SIN"], airports: ["LHR", "CDG", "FRA", "AMS", "MUC", "ZRH", "JFK", "LAX", "SFO", "IAH", "SEA", "BKK", "HKG", "ICN", "NRT", "HND", "DEL", "BOM", "SYD", "MEL", "PER", "AKL", "DXB", "DOH", "CGK", "KUL", "MNL"] },
  CX: { hubs: ["HKG"], airports: ["LHR", "CDG", "FRA", "AMS", "JFK", "LAX", "SFO", "ORD", "BOS", "SIN", "BKK", "ICN", "NRT", "HND", "DEL", "BOM", "SYD", "MEL", "AKL", "DXB", "MNL", "CGK", "KUL"] },
  TK: { hubs: ["IST"], airports: ["LHR", "CDG", "FRA", "AMS", "MUC", "ZRH", "VIE", "MAD", "BCN", "FCO", "ATH", "JFK", "LAX", "SFO", "ORD", "MIA", "IAD", "IAH", "SIN", "BKK", "HKG", "ICN", "NRT", "DEL", "BOM", "DXB", "DOH", "CAI", "JNB", "NBO", "ADD", "GRU", "EZE", "BOG", "WAW", "BUD", "PRG", "CPH", "OSL", "ARN", "HEL", "DUB", "LIS"] },
  JL: { hubs: ["NRT", "HND"], airports: ["LAX", "SFO", "ORD", "JFK", "BOS", "SEA", "DFW", "LHR", "CDG", "FRA", "HEL", "SIN", "BKK", "HKG", "ICN", "DEL", "SYD", "MEL", "DXB", "DOH", "HNL"] },
  NH: { hubs: ["NRT", "HND"], airports: ["LAX", "SFO", "ORD", "JFK", "IAH", "SEA", "IAD", "LHR", "FRA", "MUC", "SIN", "BKK", "HKG", "ICN", "DEL", "SYD", "MEL", "DXB", "HNL"] },
  KE: { hubs: ["ICN"], airports: ["JFK", "LAX", "SFO", "ORD", "SEA", "DFW", "IAD", "ATL", "LHR", "CDG", "FRA", "AMS", "FCO", "NRT", "HND", "SIN", "BKK", "HKG", "DEL", "SYD"] },
  QF: { hubs: ["SYD", "MEL"], airports: ["LAX", "SFO", "DFW", "JFK", "LHR", "SIN", "HKG", "NRT", "AKL", "PER", "DXB", "DOH", "HNL"] },
  NZ: { hubs: ["AKL"], airports: ["LAX", "SFO", "ORD", "LHR", "SIN", "HKG", "NRT", "SYD", "MEL", "PER", "HNL"] },
  AC: { hubs: ["YYZ"], airports: ["JFK", "LAX", "SFO", "ORD", "MIA", "DEN", "LHR", "CDG", "FRA", "AMS", "MUC", "ZRH", "NRT", "HND", "HKG", "SIN", "DEL", "BOM", "SYD", "DXB", "DOH", "GRU", "EZE", "MEX", "BOG", "LIM"] },
  LA: { hubs: ["SCL", "GRU"], airports: ["JFK", "MIA", "LAX", "ORD", "MAD", "CDG", "FRA", "LHR", "EZE", "BOG", "LIM", "MEX", "CUN", "GIG", "AKL", "SYD"] },
  ET: { hubs: ["ADD"], airports: ["LHR", "CDG", "FRA", "JFK", "IAD", "LAX", "ORD", "DXB", "DOH", "SIN", "BKK", "HKG", "DEL", "BOM", "NBO", "JNB", "CAI", "LOS", "GRU"] },
  AI: { hubs: ["DEL", "BOM"], airports: ["LHR", "CDG", "FRA", "JFK", "ORD", "SFO", "EWR", "IAD", "SIN", "BKK", "HKG", "NRT", "SYD", "MEL", "DXB", "DOH", "CAI"] },
  IB: { hubs: ["MAD"], airports: ["LHR", "CDG", "FRA", "AMS", "FCO", "BCN", "LIS", "ATH", "JFK", "MIA", "ORD", "LAX", "BOS", "GRU", "EZE", "BOG", "MEX", "SCL"] },
  FR: { hubs: ["DUB"], airports: ["LHR", "CDG", "FRA", "AMS", "MAD", "BCN", "FCO", "ATH", "LIS", "IST", "EDI", "CPH", "OSL", "ARN", "WAW", "BUD", "PRG", "LCA"] },
  SK: { hubs: ["CPH", "ARN", "OSL"], airports: ["LHR", "CDG", "FRA", "AMS", "JFK", "EWR", "ORD", "SFO", "LAX", "MIA", "IST", "ATH", "WAW", "BUD", "PRG", "HEL", "DUB"] },
  AY: { hubs: ["HEL"], airports: ["LHR", "CDG", "FRA", "AMS", "JFK", "ORD", "LAX", "MIA", "NRT", "HND", "ICN", "SIN", "BKK", "HKG", "DEL", "ARN", "CPH", "OSL", "WAW", "PRG", "BUD"] },
  LO: { hubs: ["WAW"], airports: ["LHR", "CDG", "FRA", "AMS", "JFK", "ORD", "LAX", "MIA", "NRT", "ICN", "SIN", "BKK", "DEL", "DXB", "IST", "ATH", "FCO", "MAD", "BUD", "PRG"] },
  MS: { hubs: ["CAI"], airports: ["LHR", "CDG", "FRA", "AMS", "JFK", "IAD", "ORD", "NRT", "SIN", "BKK", "DXB", "DOH", "IST", "ATH", "FCO", "NBO", "JNB", "ADD"] },
  KQ: { hubs: ["NBO"], airports: ["LHR", "CDG", "AMS", "JFK", "BKK", "DXB", "DOH", "CAI", "ADD", "JNB", "BOM", "DEL"] },
  SA: { hubs: ["JNB"], airports: ["LHR", "FRA", "DXB", "NBO", "CAI", "ADD", "LOS", "PER", "SYD"] },
  AV: { hubs: ["BOG"], airports: ["MIA", "JFK", "LAX", "ORD", "DFW", "IAH", "MAD", "BCN", "LHR", "GRU", "EZE", "SCL", "LIM", "MEX", "CUN", "PTY"] },
  CM: { hubs: ["PTY"], airports: ["MIA", "JFK", "LAX", "ORD", "IAH", "DFW", "BOG", "GRU", "EZE", "SCL", "LIM", "MEX", "CUN"] },
  MH: { hubs: ["KUL"], airports: ["LHR", "CDG", "AMS", "IST", "SIN", "BKK", "HKG", "NRT", "ICN", "DEL", "BOM", "SYD", "MEL", "AKL", "DXB", "DOH", "CGK", "MNL"] },
  GA: { hubs: ["CGK"], airports: ["SIN", "KUL", "BKK", "HKG", "NRT", "ICN", "SYD", "MEL", "AMS", "LHR", "DOH", "JED", "MNL"] },
  TG: { hubs: ["BKK"], airports: ["LHR", "CDG", "FRA", "MUC", "ZRH", "JFK", "LAX", "SIN", "HKG", "NRT", "ICN", "DEL", "SYD", "MEL", "DXB"] },
  SV: { hubs: ["JED", "RUH"], airports: ["LHR", "CDG", "FRA", "JFK", "IAD", "LAX", "DXB", "CAI", "IST", "KUL", "SIN", "DEL", "BOM", "MNL", "CGK"] },
  "6E": { hubs: ["DEL", "BOM"], airports: ["SIN", "BKK", "KUL", "DXB", "DOH", "RUH", "JED", "KTM", "DAC", "CMB", "BLR", "HYD", "MAA", "CCU"] },
  W6: { hubs: ["BUD"], airports: ["LHR", "CDG", "FRA", "FCO", "BCN", "WAW", "PRG", "VIE", "ATH", "IST", "DXB", "AUH"] },
  VY: { hubs: ["BCN"], airports: ["MAD", "LHR", "CDG", "FRA", "AMS", "FCO", "ATH", "LIS"] },
};

// ---------------------------------------------------------------------------
// ~50 ROUTES — real flight numbers, aircraft, distances, durations
// days_of_week: 1=Mon … 7=Sun
// ---------------------------------------------------------------------------
const routeData: RouteSeed[] = [
  { airline_iata: "EK", dep_iata: "DXB", arr_iata: "JFK", flight_number: "EK201", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 11022, avg_duration_minutes: 840 },
  { airline_iata: "EK", dep_iata: "DXB", arr_iata: "LHR", flight_number: "EK001", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A380-800", distance_km: 5477, avg_duration_minutes: 420 },
  { airline_iata: "EK", dep_iata: "DXB", arr_iata: "SYD", flight_number: "EK414", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A380-800", distance_km: 12046, avg_duration_minutes: 870 },
  { airline_iata: "QR", dep_iata: "DOH", arr_iata: "LHR", flight_number: "QR001", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 5240, avg_duration_minutes: 420 },
  { airline_iata: "QR", dep_iata: "DOH", arr_iata: "JFK", flight_number: "QR701", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 10830, avg_duration_minutes: 840 },
  { airline_iata: "BA", dep_iata: "LHR", arr_iata: "JFK", flight_number: "BA115", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 5540, avg_duration_minutes: 480 },
  { airline_iata: "BA", dep_iata: "LHR", arr_iata: "LAX", flight_number: "BA269", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A380-800", distance_km: 8756, avg_duration_minutes: 660 },
  { airline_iata: "SQ", dep_iata: "SIN", arr_iata: "LHR", flight_number: "SQ317", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A380-800", distance_km: 10846, avg_duration_minutes: 780 },
  { airline_iata: "SQ", dep_iata: "SIN", arr_iata: "JFK", flight_number: "SQ21", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A350-900ULR", distance_km: 15332, avg_duration_minutes: 1080 },
  { airline_iata: "SQ", dep_iata: "SIN", arr_iata: "SYD", flight_number: "SQ231", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 6305, avg_duration_minutes: 480 },
  { airline_iata: "DL", dep_iata: "JFK", arr_iata: "LAX", flight_number: "DL1", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 767-400ER", distance_km: 3978, avg_duration_minutes: 330 },
  { airline_iata: "DL", dep_iata: "ATL", arr_iata: "AMS", flight_number: "DL72", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A330-300", distance_km: 7405, avg_duration_minutes: 540 },
  { airline_iata: "DL", dep_iata: "ATL", arr_iata: "LHR", flight_number: "DL30", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 767-400ER", distance_km: 6764, avg_duration_minutes: 510 },
  { airline_iata: "AA", dep_iata: "DFW", arr_iata: "LHR", flight_number: "AA50", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 7760, avg_duration_minutes: 570 },
  { airline_iata: "AA", dep_iata: "JFK", arr_iata: "LAX", flight_number: "AA1", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A321neo", distance_km: 3978, avg_duration_minutes: 330 },
  { airline_iata: "UA", dep_iata: "SFO", arr_iata: "EWR", flight_number: "UA1", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-200", distance_km: 4154, avg_duration_minutes: 320 },
  { airline_iata: "UA", dep_iata: "EWR", arr_iata: "LHR", flight_number: "UA14", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-200", distance_km: 5540, avg_duration_minutes: 420 },
  { airline_iata: "UA", dep_iata: "SFO", arr_iata: "NRT", flight_number: "UA837", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 8267, avg_duration_minutes: 660 },
  { airline_iata: "LH", dep_iata: "FRA", arr_iata: "JFK", flight_number: "LH400", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A340-600", distance_km: 6191, avg_duration_minutes: 510 },
  { airline_iata: "LH", dep_iata: "FRA", arr_iata: "SIN", flight_number: "LH778", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A380-800", distance_km: 10254, avg_duration_minutes: 720 },
  { airline_iata: "AF", dep_iata: "CDG", arr_iata: "JFK", flight_number: "AF006", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 5834, avg_duration_minutes: 480 },
  { airline_iata: "KL", dep_iata: "AMS", arr_iata: "JFK", flight_number: "KL641", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-200ER", distance_km: 5857, avg_duration_minutes: 480 },
  { airline_iata: "TK", dep_iata: "IST", arr_iata: "JFK", flight_number: "TK1", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 8054, avg_duration_minutes: 660 },
  { airline_iata: "TK", dep_iata: "IST", arr_iata: "LHR", flight_number: "TK1981", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A330-300", distance_km: 2498, avg_duration_minutes: 240 },
  { airline_iata: "CX", dep_iata: "HKG", arr_iata: "LHR", flight_number: "CX251", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A350-1000", distance_km: 9651, avg_duration_minutes: 720 },
  { airline_iata: "JL", dep_iata: "NRT", arr_iata: "LAX", flight_number: "JL62", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 787-9", distance_km: 8767, avg_duration_minutes: 600 },
  { airline_iata: "NH", dep_iata: "NRT", arr_iata: "ORD", flight_number: "NH12", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 10137, avg_duration_minutes: 720 },
  { airline_iata: "KE", dep_iata: "ICN", arr_iata: "LAX", flight_number: "KE17", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A380-800", distance_km: 9580, avg_duration_minutes: 660 },
  { airline_iata: "QF", dep_iata: "SYD", arr_iata: "LAX", flight_number: "QF11", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A380-800", distance_km: 12051, avg_duration_minutes: 810 },
  { airline_iata: "QF", dep_iata: "SYD", arr_iata: "SIN", flight_number: "QF1", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A380-800", distance_km: 6305, avg_duration_minutes: 480 },
  { airline_iata: "EY", dep_iata: "AUH", arr_iata: "LHR", flight_number: "EY11", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 787-9", distance_km: 5474, avg_duration_minutes: 420 },
  { airline_iata: "AC", dep_iata: "YYZ", arr_iata: "LHR", flight_number: "AC848", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 5713, avg_duration_minutes: 420 },
  { airline_iata: "AC", dep_iata: "YYZ", arr_iata: "FRA", flight_number: "AC836", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 6343, avg_duration_minutes: 480 },
  { airline_iata: "LA", dep_iata: "SCL", arr_iata: "GRU", flight_number: "LA600", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 787-9", distance_km: 2572, avg_duration_minutes: 240 },
  { airline_iata: "LA", dep_iata: "SCL", arr_iata: "JFK", flight_number: "LA602", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 787-9", distance_km: 8249, avg_duration_minutes: 660 },
  { airline_iata: "AV", dep_iata: "BOG", arr_iata: "MIA", flight_number: "AV20", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A320neo", distance_km: 2208, avg_duration_minutes: 210 },
  { airline_iata: "CM", dep_iata: "PTY", arr_iata: "MIA", flight_number: "CM440", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 737-800", distance_km: 2108, avg_duration_minutes: 180 },
  { airline_iata: "ET", dep_iata: "ADD", arr_iata: "LHR", flight_number: "ET700", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 787-9", distance_km: 5957, avg_duration_minutes: 480 },
  { airline_iata: "ET", dep_iata: "ADD", arr_iata: "DXB", flight_number: "ET600", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 787-8", distance_km: 2931, avg_duration_minutes: 240 },
  { airline_iata: "KQ", dep_iata: "NBO", arr_iata: "LHR", flight_number: "KQ100", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 787-8", distance_km: 6848, avg_duration_minutes: 510 },
  { airline_iata: "MS", dep_iata: "CAI", arr_iata: "LHR", flight_number: "MS777", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 737-800", distance_km: 3518, avg_duration_minutes: 300 },
  { airline_iata: "TG", dep_iata: "BKK", arr_iata: "LHR", flight_number: "TG910", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A350-900", distance_km: 9560, avg_duration_minutes: 720 },
  { airline_iata: "MH", dep_iata: "KUL", arr_iata: "LHR", flight_number: "MH2", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A350-900", distance_km: 10555, avg_duration_minutes: 780 },
  { airline_iata: "GA", dep_iata: "CGK", arr_iata: "SIN", flight_number: "GA838", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A330-300", distance_km: 886, avg_duration_minutes: 105 },
  { airline_iata: "AI", dep_iata: "DEL", arr_iata: "JFK", flight_number: "AI101", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 777-300ER", distance_km: 11770, avg_duration_minutes: 930 },
  { airline_iata: "AI", dep_iata: "DEL", arr_iata: "LHR", flight_number: "AI111", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 787-8", distance_km: 6714, avg_duration_minutes: 540 },
  { airline_iata: "SV", dep_iata: "JED", arr_iata: "LHR", flight_number: "SV111", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 787-9", distance_km: 4784, avg_duration_minutes: 390 },
  { airline_iata: "FR", dep_iata: "DUB", arr_iata: "LHR", flight_number: "FR200", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 737-800", distance_km: 447, avg_duration_minutes: 75 },
  { airline_iata: "SK", dep_iata: "CPH", arr_iata: "EWR", flight_number: "SK901", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A330-300", distance_km: 6164, avg_duration_minutes: 510 },
  { airline_iata: "AY", dep_iata: "HEL", arr_iata: "JFK", flight_number: "AY5", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A350-900", distance_km: 6604, avg_duration_minutes: 540 },
  { airline_iata: "LO", dep_iata: "WAW", arr_iata: "ORD", flight_number: "LO3", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 787-8", distance_km: 7471, avg_duration_minutes: 600 },
  { airline_iata: "TP", dep_iata: "LIS", arr_iata: "EWR", flight_number: "TP200", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A330-200", distance_km: 5413, avg_duration_minutes: 480 },
  { airline_iata: "IB", dep_iata: "MAD", arr_iata: "JFK", flight_number: "IB6251", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A330-200", distance_km: 5752, avg_duration_minutes: 510 },
  { airline_iata: "LX", dep_iata: "ZRH", arr_iata: "JFK", flight_number: "LX14", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Airbus A330-300", distance_km: 6324, avg_duration_minutes: 540 },
  { airline_iata: "WN", dep_iata: "MDW", arr_iata: "DEN", flight_number: "WN100", days_of_week: [1,2,3,4,5,6,7], aircraft_type: "Boeing 737-800", distance_km: 1413, avg_duration_minutes: 150 },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function clearData() {
  console.log("Clearing airline-dependent data (keeps airports intact)...");
  const tables = [
    "routes",
    "airport_airlines",
    "flight_schedules",
    "airlines",
  ];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.warn(`  Warning clearing ${table}: ${error.message}`);
    } else {
      console.log(`  Cleared ${table}`);
    }
  }
}

async function seedAirports(): Promise<Map<string, string>> {
  console.log(`\nSeeding ${airports.length} airports...`);
  const map = new Map<string, string>();
  const batchSize = 25;

  for (let i = 0; i < airports.length; i += batchSize) {
    const batch = airports.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from("airports")
      .upsert(batch, { onConflict: "iata_code" })
      .select("id, iata_code");

    if (error) {
      console.error(`  Error inserting airports batch ${i / batchSize + 1}: ${error.message}`);
      continue;
    }
    for (const row of data ?? []) {
      map.set(row.iata_code, row.id);
    }
    console.log(`  Inserted airports ${i + 1}–${Math.min(i + batchSize, airports.length)}`);
  }

  console.log(`  Airport map: ${map.size} entries`);
  return map;
}

async function seedAirlines(): Promise<Map<string, string>> {
  const resolved = resolveAirlineLogos(airlines);
  console.log(`\nSeeding ${resolved.length} airlines...`);
  const map = new Map<string, string>();
  const batchSize = 25;

  for (let i = 0; i < resolved.length; i += batchSize) {
    const batch = resolved.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from("airlines")
      .upsert(batch, { onConflict: "iata_code" })
      .select("id, iata_code");

    if (error) {
      console.error(`  Error inserting airlines batch ${i / batchSize + 1}: ${error.message}`);
      continue;
    }
    for (const row of data ?? []) {
      map.set(row.iata_code, row.id);
    }
    console.log(`  Inserted airlines ${i + 1}–${Math.min(i + batchSize, resolved.length)}`);
  }

  console.log(`  Airline map: ${map.size} entries`);
  return map;
}

async function seedAirportAirlines(
  airportMap: Map<string, string>,
  airlineMap: Map<string, string>
) {
  console.log("\nBuilding airport–airline relationships...");
  const rows: Array<{
    airport_id: string;
    airline_id: string;
    is_hub: boolean;
  }> = [];

  for (const [airlineIata, presence] of Object.entries(airlinePresence)) {
    const airlineId = airlineMap.get(airlineIata);
    if (!airlineId) continue;

    const allAirports = Array.from(new Set([...presence.hubs, ...presence.airports]));
    for (const apIata of allAirports) {
      const airportId = airportMap.get(apIata);
      if (!airportId) continue;
      rows.push({
        airport_id: airportId,
        airline_id: airlineId,
        is_hub: presence.hubs.includes(apIata),
      });
    }
  }

  console.log(`  Generated ${rows.length} relationships`);

  const batchSize = 50;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase
      .from("airport_airlines")
      .upsert(batch, { onConflict: "airport_id,airline_id" });

    if (error) {
      console.error(`  Error inserting airport_airlines batch ${i / batchSize + 1}: ${error.message}`);
      continue;
    }
    console.log(`  Inserted relationships ${i + 1}–${Math.min(i + batchSize, rows.length)}`);
  }
}

async function seedRoutes(
  airportMap: Map<string, string>,
  airlineMap: Map<string, string>
) {
  console.log(`\nSeeding ${routeData.length} routes...`);
  const rows = routeData
    .map((r) => {
      const airlineId = airlineMap.get(r.airline_iata);
      const depId = airportMap.get(r.dep_iata);
      const arrId = airportMap.get(r.arr_iata);
      if (!airlineId || !depId || !arrId) {
        console.warn(`  Skipping route ${r.flight_number}: missing ID`);
        return null;
      }
      return {
        airline_id: airlineId,
        departure_airport_id: depId,
        arrival_airport_id: arrId,
        flight_number: r.flight_number,
        days_of_week: r.days_of_week,
        aircraft_type: r.aircraft_type,
        distance_km: r.distance_km,
        avg_duration_minutes: r.avg_duration_minutes,
      };
    })
    .filter(Boolean);

  const batchSize = 25;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from("routes").insert(batch);
    if (error) {
      console.error(`  Error inserting routes batch ${i / batchSize + 1}: ${error.message}`);
      continue;
    }
    console.log(`  Inserted routes ${i + 1}–${Math.min(i + batchSize, rows.length)}`);
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("===========================================");
  console.log("  SkyPortal Database Seed");
  console.log("===========================================\n");

  await clearData();

  // Load airport map from existing DB data (seeded via seed-airports-api.ts)
  console.log("\nLoading airport map from database...");
  const airportMap = new Map<string, string>();
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data: batch } = await supabase
      .from("airports")
      .select("id, iata_code")
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (!batch || batch.length === 0) break;
    for (const a of batch) {
      airportMap.set((a as { id: string; iata_code: string }).iata_code, (a as { id: string; iata_code: string }).id);
    }
    page++;
    if (batch.length < pageSize) break;
  }
  console.log(`  Loaded ${airportMap.size} airports from DB`);

  const airlineMap = await seedAirlines();
  await seedAirportAirlines(airportMap, airlineMap);
  await seedRoutes(airportMap, airlineMap);

  console.log("\n===========================================");
  console.log("  Seed complete!");
  console.log(`  ${airportMap.size} airports`);
  console.log(`  ${airlineMap.size} airlines`);
  console.log(`  ${routeData.length} routes`);
  console.log("===========================================");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
