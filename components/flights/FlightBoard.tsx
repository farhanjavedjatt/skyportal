"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Filter, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlightRow } from "@/components/flights/FlightRow";
import { EmptyState } from "@/components/ui/EmptyState";
import type { FlightSchedule } from "@/lib/supabase/types";
import type { FlightStatus } from "@/lib/utils";

interface FlightBoardProps {
  flights: FlightSchedule[];
  type: "departures" | "arrivals";
  airportTimezone: string;
  airportCode: string;
}

const POLL_INTERVAL = 60_000;

const departureHeaders = [
  { key: "time", label: "Time", className: "" },
  { key: "flight", label: "Flight", className: "" },
  { key: "airline", label: "Airline", className: "hidden sm:table-cell" },
  { key: "destination", label: "Destination", className: "" },
  { key: "gate", label: "Gate", className: "hidden md:table-cell" },
  { key: "terminal", label: "Terminal", className: "hidden md:table-cell" },
  { key: "status", label: "Status", className: "" },
];

const arrivalHeaders = [
  { key: "time", label: "Time", className: "" },
  { key: "flight", label: "Flight", className: "" },
  { key: "airline", label: "Airline", className: "hidden sm:table-cell" },
  { key: "origin", label: "Origin", className: "" },
  { key: "gate", label: "Gate", className: "hidden md:table-cell" },
  { key: "terminal", label: "Terminal", className: "hidden md:table-cell" },
  { key: "baggage", label: "Baggage", className: "hidden lg:table-cell" },
  { key: "status", label: "Status", className: "" },
];

export function FlightBoard({
  flights: initialFlights,
  type,
  airportTimezone,
  airportCode,
}: FlightBoardProps) {
  const [flights, setFlights] = useState(initialFlights);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [airlineFilter, setAirlineFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const airlines = useMemo(() => {
    const set = new Set(flights.map((f) => f.airline_name ?? f.airline_iata));
    return Array.from(set).sort();
  }, [flights]);

  const statuses = useMemo(() => {
    const set = new Set(flights.map((f) => f.status));
    return Array.from(set).sort();
  }, [flights]);

  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      if (airlineFilter && (f.airline_name ?? f.airline_iata) !== airlineFilter)
        return false;
      if (statusFilter && f.status !== statusFilter) return false;
      return true;
    });
  }, [flights, airlineFilter, statusFilter]);

  const fetchFlights = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/airports/${airportCode}/${type}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFlights(data);
          setLastUpdated(new Date());
        }
      }
    } catch {
      // Silently fail on poll — keep showing existing data
    }
  }, [airportCode, type]);

  useEffect(() => {
    const interval = setInterval(fetchFlights, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchFlights]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const headers = type === "departures" ? departureHeaders : arrivalHeaders;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              showFilters
                ? "bg-accent-blue/10 text-accent-blue"
                : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>

          {(airlineFilter || statusFilter) && (
            <button
              onClick={() => {
                setAirlineFilter("");
                setStatusFilter("");
              }}
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <Clock className="h-3 w-3" />
          <span>Last updated: {secondsAgo}s ago</span>
          <button
            onClick={fetchFlights}
            className="p-1 rounded hover:bg-bg-hover transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row gap-3 mb-4 pb-4 border-b border-border-subtle">
              <select
                value={airlineFilter}
                onChange={(e) => setAirlineFilter(e.target.value)}
                className="h-9 px-3 rounded-lg bg-bg-tertiary text-sm text-text-primary border border-border-subtle focus:border-accent-blue outline-none"
                aria-label="Filter by airline"
              >
                <option value="">All Airlines</option>
                {airlines.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-lg bg-bg-tertiary text-sm text-text-primary border border-border-subtle focus:border-accent-blue outline-none"
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto rounded-xl border border-border-subtle bg-bg-secondary">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {headers.map((h) => (
                <th
                  key={h.key}
                  className={cn("px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary", h.className)}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.03 } },
            }}
          >
            {filteredFlights.map((flight, idx) => (
              <FlightRow
                key={flight.id || `${flight.flight_iata}-${flight.dep_scheduled ?? idx}`}
                flight={flight}
                type={type}
                timezone={airportTimezone}
              />
            ))}
          </motion.tbody>
        </table>

        {filteredFlights.length === 0 && (
          <EmptyState
            title="No flights found"
            message={
              airlineFilter || statusFilter
                ? "Try adjusting your filters."
                : `No ${type} currently available.`
            }
          />
        )}
      </div>
    </div>
  );
}
