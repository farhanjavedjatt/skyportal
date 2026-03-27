"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function FlightSearchForm() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [flightNumber, setFlightNumber] = useState("");
  const [date, setDate] = useState(today);

  const minDate = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = flightNumber.trim().toUpperCase();
    if (!trimmed) return;
    const params = new URLSearchParams();
    if (date && date !== today) params.set("date", date);
    const qs = params.toString();
    router.push(`/flights/${trimmed}${qs ? `?${qs}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Plane className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            placeholder="Enter flight number (e.g. BA123)"
            className="w-full h-14 pl-12 pr-4 rounded-xl bg-bg-secondary text-lg font-mono text-text-primary placeholder:text-text-tertiary border border-border-subtle focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/30 outline-none transition-all"
            aria-label="Flight number"
          />
        </div>

        <div className="flex gap-3">
          <input
            type="date"
            value={date}
            min={minDate}
            max={maxDate}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 h-11 px-4 rounded-xl bg-bg-secondary text-sm text-text-primary border border-border-subtle focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/30 outline-none transition-all [color-scheme:dark]"
            aria-label="Flight date"
          />
          <button
            type="submit"
            disabled={!flightNumber.trim()}
            className={cn(
              "flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-medium transition-all",
              "bg-accent-blue text-white hover:bg-accent-blue/90",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
