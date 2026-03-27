-- 001_initial_schema.sql
-- SkyPortal: airports, airlines, routes, flight schedules

-- ============================================================
-- ENUM
-- ============================================================

CREATE TYPE flight_status AS ENUM (
  'scheduled',
  'active',
  'landed',
  'cancelled',
  'diverted',
  'delayed',
  'boarding',
  'departed'
);

-- ============================================================
-- AIRPORTS
-- ============================================================

CREATE TABLE airports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iata_code     VARCHAR(3)  NOT NULL UNIQUE,
  icao_code     VARCHAR(4)  NOT NULL UNIQUE,
  name          TEXT        NOT NULL,
  city          TEXT        NOT NULL,
  country       TEXT        NOT NULL,
  country_code  VARCHAR(2)  NOT NULL,
  timezone      TEXT        NOT NULL,
  latitude      DOUBLE PRECISION NOT NULL,
  longitude     DOUBLE PRECISION NOT NULL,
  elevation_ft  INTEGER,
  website       TEXT,
  phone_local   TEXT,
  phone_intl    TEXT,
  address       TEXT,
  total_terminals INTEGER,
  is_major      BOOLEAN     NOT NULL DEFAULT FALSE,
  slug          TEXT        NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(city, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(iata_code, '') || ' ' || coalesce(icao_code, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(country, '')), 'C')
  ) STORED
);

CREATE INDEX idx_airports_iata       ON airports (iata_code);
CREATE INDEX idx_airports_icao       ON airports (icao_code);
CREATE INDEX idx_airports_slug       ON airports (slug);
CREATE INDEX idx_airports_country    ON airports (country_code);
CREATE INDEX idx_airports_search_vec ON airports USING GIN (search_vector);

-- ============================================================
-- AIRLINES
-- ============================================================

CREATE TABLE airlines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iata_code     VARCHAR(3)  NOT NULL UNIQUE,
  icao_code     VARCHAR(4)  NOT NULL UNIQUE,
  name          TEXT        NOT NULL,
  callsign      TEXT,
  country       TEXT        NOT NULL,
  country_code  VARCHAR(2)  NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  logo_url      TEXT,
  website       TEXT,
  hub_airports  TEXT[]      NOT NULL DEFAULT '{}',
  alliance      TEXT,
  fleet_size    INTEGER,
  founded_year  INTEGER,
  slug          TEXT        NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(iata_code, '') || ' ' || coalesce(icao_code, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(callsign, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(country, '')), 'C')
  ) STORED
);

CREATE INDEX idx_airlines_iata       ON airlines (iata_code);
CREATE INDEX idx_airlines_icao       ON airlines (icao_code);
CREATE INDEX idx_airlines_slug       ON airlines (slug);
CREATE INDEX idx_airlines_active     ON airlines (is_active);
CREATE INDEX idx_airlines_search_vec ON airlines USING GIN (search_vector);

-- ============================================================
-- AIRPORT ↔ AIRLINE join table
-- ============================================================

CREATE TABLE airport_airlines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id  UUID NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  airline_id  UUID NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
  terminal    TEXT,
  is_hub      BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (airport_id, airline_id)
);

CREATE INDEX idx_aa_airport ON airport_airlines (airport_id);
CREATE INDEX idx_aa_airline ON airport_airlines (airline_id);
CREATE INDEX idx_aa_hub     ON airport_airlines (is_hub) WHERE is_hub = TRUE;

-- ============================================================
-- ROUTES
-- ============================================================

CREATE TABLE routes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airline_id            UUID NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
  departure_airport_id  UUID NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  arrival_airport_id    UUID NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  flight_number         TEXT NOT NULL,
  days_of_week          INTEGER[] NOT NULL DEFAULT '{}',
  aircraft_type         TEXT,
  distance_km           NUMERIC(8,2),
  avg_duration_minutes  INTEGER
);

CREATE INDEX idx_routes_airline   ON routes (airline_id);
CREATE INDEX idx_routes_departure ON routes (departure_airport_id);
CREATE INDEX idx_routes_arrival   ON routes (arrival_airport_id);
CREATE INDEX idx_routes_flight_no ON routes (flight_number);

-- ============================================================
-- FLIGHT SCHEDULES
-- ============================================================

CREATE TABLE flight_schedules (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_iata           TEXT        NOT NULL,
  flight_icao           TEXT,
  airline_iata          TEXT        NOT NULL,
  airline_name          TEXT,
  dep_iata              TEXT        NOT NULL,
  dep_icao              TEXT,
  dep_terminal          TEXT,
  dep_gate              TEXT,
  dep_scheduled         TIMESTAMPTZ,
  dep_estimated         TIMESTAMPTZ,
  dep_actual            TIMESTAMPTZ,
  dep_delay_minutes     INTEGER,
  arr_iata              TEXT        NOT NULL,
  arr_icao              TEXT,
  arr_terminal          TEXT,
  arr_gate              TEXT,
  arr_baggage           TEXT,
  arr_scheduled         TIMESTAMPTZ,
  arr_estimated         TIMESTAMPTZ,
  arr_actual            TIMESTAMPTZ,
  arr_delay_minutes     INTEGER,
  status                flight_status NOT NULL DEFAULT 'scheduled',
  aircraft_icao         TEXT,
  aircraft_registration TEXT,
  codeshare_flight      TEXT,
  flight_date           DATE        NOT NULL,
  fetched_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fs_flight_iata  ON flight_schedules (flight_iata);
CREATE INDEX idx_fs_dep_iata     ON flight_schedules (dep_iata);
CREATE INDEX idx_fs_arr_iata     ON flight_schedules (arr_iata);
CREATE INDEX idx_fs_flight_date  ON flight_schedules (flight_date);
CREATE INDEX idx_fs_status       ON flight_schedules (status);
CREATE INDEX idx_fs_dep_sched    ON flight_schedules (dep_scheduled);
CREATE INDEX idx_fs_airline_iata ON flight_schedules (airline_iata);
CREATE INDEX idx_fs_composite    ON flight_schedules (flight_iata, flight_date);

-- ============================================================
-- ROW LEVEL SECURITY — public read, no anonymous writes
-- ============================================================

ALTER TABLE airports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE airlines          ENABLE ROW LEVEL SECURITY;
ALTER TABLE airport_airlines  ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_schedules  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read airports"
  ON airports FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read airlines"
  ON airlines FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read airport_airlines"
  ON airport_airlines FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read routes"
  ON routes FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public read flight_schedules"
  ON flight_schedules FOR SELECT TO anon, authenticated USING (true);

-- Service-role insert/update/delete (bypasses RLS automatically)
