"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AirportsFilterProps {
  countries: { code: string; name: string }[];
  initialQuery: string;
  initialCountry: string;
  initialMajor: boolean;
}

export function AirportsFilter({
  countries,
  initialQuery,
  initialCountry,
  initialMajor,
}: AirportsFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [countryFilter, setCountryFilter] = useState(initialCountry);
  const [majorFilter, setMajorFilter] = useState(initialMajor);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function buildUrl(q: string, country: string, major: boolean) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (country) params.set("country", country);
    if (major) params.set("major", "true");
    const qs = params.toString();
    return `/airports${qs ? `?${qs}` : ""}`;
  }

  function navigate(q: string, country: string, major: boolean) {
    startTransition(() => {
      router.replace(buildUrl(q, country, major));
    });
  }

  function handleSearchChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate(value, countryFilter, majorFilter);
    }, 350);
  }

  function handleCountryChange(value: string) {
    setCountryFilter(value);
    navigate(query, value, majorFilter);
  }

  function handleMajorToggle() {
    const next = !majorFilter;
    setMajorFilter(next);
    navigate(query, countryFilter, next);
  }

  function handleClear() {
    setQuery("");
    setCountryFilter("");
    setMajorFilter(false);
    navigate("", "", false);
  }

  const hasFilters = query || countryFilter || majorFilter;

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search airports by name, city, or code…"
          className="w-full h-11 pl-9 pr-4 rounded-xl bg-bg-tertiary text-sm text-text-primary placeholder:text-text-tertiary border border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50 outline-none transition-all"
          aria-label="Search airports"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
        )}
      </div>

      <select
        value={countryFilter}
        onChange={(e) => handleCountryChange(e.target.value)}
        className="h-11 px-3 rounded-xl bg-bg-tertiary text-sm text-text-primary border border-border-subtle focus:border-accent-blue outline-none min-w-[160px]"
        aria-label="Filter by country"
      >
        <option value="">All Countries</option>
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleMajorToggle}
        className={cn(
          "h-11 px-5 rounded-xl text-sm font-medium border transition-all whitespace-nowrap",
          majorFilter
            ? "bg-accent-blue/10 text-accent-blue border-accent-blue/30"
            : "bg-bg-tertiary text-text-secondary border-border-subtle hover:text-text-primary hover:border-border-hover"
        )}
      >
        Major Hubs
      </button>

      {hasFilters && (
        <button
          onClick={handleClear}
          className="h-11 px-4 rounded-xl bg-bg-tertiary text-sm text-text-secondary border border-border-subtle hover:text-text-primary hover:border-border-hover transition-all flex items-center gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
