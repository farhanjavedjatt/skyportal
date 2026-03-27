import { Phone, Globe, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Airport } from "@/lib/supabase/types";

interface AirportContactCardProps {
  airport: Airport;
}

export function AirportContactCard({ airport }: AirportContactCardProps) {
  const hasContact = airport.phone_local || airport.phone_intl || airport.website || airport.address;
  if (!hasContact) return null;

  return (
    <div className={cn("rounded-2xl bg-bg-secondary border border-border-subtle p-5")}>
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Contact Information
      </h3>
      <div className="flex flex-col gap-3">
        {airport.phone_local && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-text-tertiary shrink-0" />
            <a
              href={`tel:${airport.phone_local}`}
              className="text-sm text-text-secondary hover:text-accent-blue transition-colors"
            >
              {airport.phone_local}
              <span className="text-xs text-text-tertiary ml-1">(Local)</span>
            </a>
          </div>
        )}

        {airport.phone_intl && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-text-tertiary shrink-0" />
            <a
              href={`tel:${airport.phone_intl}`}
              className="text-sm text-text-secondary hover:text-accent-blue transition-colors"
            >
              {airport.phone_intl}
              <span className="text-xs text-text-tertiary ml-1">(Intl)</span>
            </a>
          </div>
        )}

        {airport.website && (
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-text-tertiary shrink-0" />
            <a
              href={airport.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent-blue hover:underline truncate"
            >
              {airport.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}

        {airport.address && (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-text-tertiary shrink-0 mt-0.5" />
            <span className="text-sm text-text-secondary">{airport.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
