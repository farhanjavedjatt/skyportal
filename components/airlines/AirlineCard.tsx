import Link from "next/link";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { AllianceBadge } from "@/components/ui/AllianceBadge";
import { AirlineLogo } from "@/components/ui/AirlineLogo";
import type { Airline } from "@/lib/supabase/types";

interface AirlineCardProps {
  airline: Airline;
}

export function AirlineCard({ airline }: AirlineCardProps) {
  return (
    <Link
      href={`/airlines/${airline.slug}`}
      className={cn(
        "group block rounded-2xl bg-bg-secondary border border-border-subtle p-5",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-border-hover hover:shadow-lg hover:shadow-black/10"
      )}
    >
      <div className="flex items-start gap-4 mb-3">
        <AirlineLogo src={airline.logo_url} alt={airline.name} size={40} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-blue transition-colors">
            {airline.name}
          </h3>
          <span className="text-xs font-mono text-accent-blue font-medium">
            {airline.iata_code}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{airline.country}</span>
        </div>
        <AllianceBadge alliance={airline.alliance} />
      </div>
    </Link>
  );
}
