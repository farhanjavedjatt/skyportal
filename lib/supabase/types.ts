import type { FlightStatus } from "@/lib/utils";

export type Airport = {
  id: string;
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
  address: string | null;
  total_terminals: number | null;
  is_major: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  search_vector?: string;
};

export type Airline = {
  id: string;
  iata_code: string;
  icao_code: string;
  name: string;
  callsign: string | null;
  country: string;
  country_code: string;
  is_active: boolean;
  logo_url: string | null;
  website: string | null;
  hub_airports: string[];
  alliance: string | null;
  fleet_size: number | null;
  founded_year: number | null;
  slug: string;
  created_at: string;
  updated_at: string;
  search_vector?: string;
};

export type AirportAirline = {
  id: string;
  airport_id: string;
  airline_id: string;
  terminal: string | null;
  is_hub: boolean;
};

export type Route = {
  id: string;
  airline_id: string;
  departure_airport_id: string;
  arrival_airport_id: string;
  flight_number: string;
  days_of_week: number[];
  aircraft_type: string | null;
  distance_km: number | null;
  avg_duration_minutes: number | null;
};

export type FlightSchedule = {
  id: string;
  flight_iata: string;
  flight_icao: string | null;
  airline_iata: string;
  airline_name: string | null;
  dep_iata: string;
  dep_icao: string | null;
  dep_terminal: string | null;
  dep_gate: string | null;
  dep_scheduled: string | null;
  dep_estimated: string | null;
  dep_actual: string | null;
  dep_delay_minutes: number | null;
  arr_iata: string;
  arr_icao: string | null;
  arr_terminal: string | null;
  arr_gate: string | null;
  arr_baggage: string | null;
  arr_scheduled: string | null;
  arr_estimated: string | null;
  arr_actual: string | null;
  arr_delay_minutes: number | null;
  status: FlightStatus;
  aircraft_icao: string | null;
  aircraft_registration: string | null;
  codeshare_flight: string | null;
  flight_date: string;
  fetched_at: string;
};

type TableDef<Row, Insert = Row, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
};

type AirportInsert = Omit<Airport, "id" | "created_at" | "updated_at" | "search_vector"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

type AirlineInsert = Omit<Airline, "id" | "created_at" | "updated_at" | "search_vector"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

type FlightScheduleInsert = Omit<FlightSchedule, "id" | "fetched_at"> & {
  id?: string;
  fetched_at?: string;
};

type AirportAirlineInsert = Omit<AirportAirline, "id"> & { id?: string };
type RouteInsert = Omit<Route, "id"> & { id?: string };

export type Database = {
  public: {
    Tables: {
      airports: TableDef<Airport, AirportInsert>;
      airlines: TableDef<Airline, AirlineInsert>;
      airport_airlines: TableDef<AirportAirline, AirportAirlineInsert>;
      routes: TableDef<Route, RouteInsert>;
      flight_schedules: TableDef<FlightSchedule, FlightScheduleInsert>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      flight_status: FlightStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
