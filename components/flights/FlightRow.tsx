"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn, formatTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { FlightSchedule } from "@/lib/supabase/types";
import type { FlightStatus } from "@/lib/utils";

interface FlightRowProps {
  flight: FlightSchedule;
  type: "departures" | "arrivals";
  timezone: string;
}

export function FlightRow({ flight, type, timezone }: FlightRowProps) {
  const isCancelled = flight.status === "cancelled";
  const time =
    type === "departures" ? flight.dep_scheduled : flight.arr_scheduled;
  const delay =
    type === "departures" ? flight.dep_delay_minutes : flight.arr_delay_minutes;

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isCancelled ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "border-b border-border-subtle/50 transition-colors hover:bg-bg-hover/50",
        isCancelled && "opacity-50"
      )}
    >
      <td className={cn("px-4 py-3 font-mono text-sm tabular-nums", isCancelled && "line-through")}>
        {formatTime(time, timezone)}
      </td>

      <td className="px-4 py-3">
        <Link
          href={`/flights/${flight.flight_iata}`}
          className={cn(
            "font-mono text-sm font-medium text-accent-blue hover:underline",
            isCancelled && "line-through"
          )}
        >
          {flight.flight_iata}
        </Link>
      </td>

      <td className={cn("px-4 py-3 text-sm text-text-primary", isCancelled && "line-through")}>
        {flight.airline_name ?? flight.airline_iata}
      </td>

      <td className="px-4 py-3">
        <Link
          href={`/airports/${(type === "departures" ? flight.arr_iata : flight.dep_iata).toLowerCase()}`}
          className={cn(
            "text-sm text-text-primary hover:text-accent-blue transition-colors",
            isCancelled && "line-through"
          )}
        >
          <span className="font-mono font-medium">
            {type === "departures" ? flight.arr_iata : flight.dep_iata}
          </span>
        </Link>
      </td>

      <td className={cn("px-4 py-3 font-mono text-sm text-text-secondary", isCancelled && "line-through")}>
        {(type === "departures" ? flight.dep_gate : flight.arr_gate) ?? "—"}
      </td>

      <td className={cn("px-4 py-3 font-mono text-sm text-text-secondary", isCancelled && "line-through")}>
        {(type === "departures" ? flight.dep_terminal : flight.arr_terminal) ?? "—"}
      </td>

      {type === "arrivals" && (
        <td className={cn("px-4 py-3 font-mono text-sm text-text-secondary", isCancelled && "line-through")}>
          {flight.arr_baggage ?? "—"}
        </td>
      )}

      <td className="px-4 py-3">
        <StatusBadge
          status={flight.status as FlightStatus}
          delay={delay ?? undefined}
        />
      </td>
    </motion.tr>
  );
}
