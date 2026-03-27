import { Globe, Calendar, Hash, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeDisplay } from "@/components/ui/CodeDisplay";
import { AllianceBadge } from "@/components/ui/AllianceBadge";
import { AirlineLogo } from "@/components/ui/AirlineLogo";
import type { Airline } from "@/lib/supabase/types";

interface AirlineHeaderProps {
  airline: Airline;
}

export function AirlineHeader({ airline }: AirlineHeaderProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-bg-secondary border border-border-subtle p-6 sm:p-8"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <AirlineLogo
          src={airline.logo_url}
          alt={airline.name}
          size={80}
          className="rounded-2xl"
        />

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              {airline.name}
            </h1>
            <AllianceBadge alliance={airline.alliance} />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <CodeDisplay code={airline.iata_code} size="md" />
            <span className="text-text-tertiary">/</span>
            <CodeDisplay
              code={airline.icao_code}
              size="sm"
              className="text-text-secondary [text-shadow:none]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
            {airline.callsign && (
              <div className="flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-text-tertiary" />
                <span className="uppercase tracking-wide">
                  {airline.callsign}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-text-tertiary" />
              <span>{airline.country}</span>
            </div>

            {airline.fleet_size && (
              <div className="flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-text-tertiary" />
                <span>{airline.fleet_size} aircraft</span>
              </div>
            )}

            {airline.founded_year && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-text-tertiary" />
                <span>Founded {airline.founded_year}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
