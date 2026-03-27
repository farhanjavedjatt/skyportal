"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { AirportCard } from "@/components/airports/AirportCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { loadMoreAirports } from "@/app/airports/actions";
import type { Airport } from "@/lib/supabase/types";

interface AirportListProps {
  initialAirports: Airport[];
  hasMore: boolean;
  searchQuery?: string;
  country?: string;
  major?: boolean;
}

export function AirportList({
  initialAirports,
  hasMore: initialHasMore,
  searchQuery,
  country,
  major,
}: AirportListProps) {
  const [airports, setAirports] = useState(initialAirports);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    startTransition(async () => {
      const more = await loadMoreAirports(
        airports.length,
        searchQuery,
        country,
        major
      );
      setAirports((prev) => [...prev, ...more]);
      if (more.length < 50) setHasMore(false);
    });
  }

  if (airports.length === 0) {
    return (
      <EmptyState
        title="No airports found"
        message="Try adjusting your search or filters."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {airports.map((airport) => (
          <AirportCard key={airport.id} airport={airport} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-bg-secondary border border-border-subtle text-sm font-medium text-text-primary hover:border-border-hover hover:bg-bg-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading&hellip;
              </>
            ) : (
              "Load More Airports"
            )}
          </button>
        </div>
      )}
    </>
  );
}
