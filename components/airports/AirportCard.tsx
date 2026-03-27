import Link from "next/link";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Airport } from "@/lib/supabase/types";

interface AirportCardProps {
  airport: Airport;
}

export function AirportCard({ airport }: AirportCardProps) {
  return (
    <Link
      href={`/airports/${airport.slug}`}
      className={cn(
        "group block rounded-2xl bg-bg-secondary border border-border-subtle p-5",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-border-hover hover:shadow-lg hover:shadow-black/10"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-2xl font-bold text-accent-blue tracking-wider">
          {airport.iata_code}
        </span>
        <span className="text-xs font-mono text-text-tertiary">
          {airport.icao_code}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-text-primary mb-1.5 line-clamp-2 group-hover:text-accent-blue transition-colors">
        {airport.name}
      </h3>

      <div className="flex items-center gap-1 text-xs text-text-secondary">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">
          {airport.city}, {airport.country}
        </span>
      </div>
    </Link>
  );
}
