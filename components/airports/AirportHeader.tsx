import { MapPin, Clock, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeDisplay } from "@/components/ui/CodeDisplay";
import { LiveClock } from "@/components/ui/LiveClock";
import type { Airport } from "@/lib/supabase/types";

interface AirportHeaderProps {
  airport: Airport;
}

function countryFlag(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join("");
}

export function AirportHeader({ airport }: AirportHeaderProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-bg-secondary border border-border-subtle p-6 sm:p-8"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <CodeDisplay code={airport.iata_code} size="lg" />
            <span className="text-text-tertiary">/</span>
            <CodeDisplay code={airport.icao_code} size="sm" className="text-text-secondary [text-shadow:none]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
            {airport.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-text-tertiary" />
              <span>
                {countryFlag(airport.country_code)} {airport.city},{" "}
                {airport.country}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-text-tertiary" />
              <span>{airport.timezone}</span>
            </div>

            {airport.total_terminals && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-text-tertiary" />
                <span>
                  {airport.total_terminals} Terminal
                  {airport.total_terminals > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-text-tertiary uppercase tracking-wider">
            Local Time
          </span>
          <LiveClock
            timezone={airport.timezone}
            className="text-2xl font-semibold"
          />
        </div>
      </div>
    </div>
  );
}
