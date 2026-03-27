"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useTransition } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ALLIANCES = ["Star Alliance", "oneworld", "SkyTeam"] as const;

export function AirlinesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const q = searchParams.get("q") ?? "";
  const alliance = searchParams.get("alliance") ?? "";
  const country = searchParams.get("country") ?? "";
  const active = searchParams.get("active") ?? "";

  const hasFilters = q || alliance || country || active;

  const navigate = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/airlines?${qs}` : "/airlines");
      });
    },
    [router]
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      navigate(params);
    },
    [searchParams, navigate]
  );

  const setParamDebounced = useCallback(
    (key: string, value: string) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setParam(key, value), 300);
    },
    [setParam]
  );

  const clearAll = useCallback(() => {
    navigate(new URLSearchParams());
  }, [navigate]);

  return (
    <div className="rounded-2xl bg-bg-secondary border border-border-subtle p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            defaultValue={q}
            key={q}
            placeholder="Search airlines..."
            onChange={(e) => setParamDebounced("q", e.target.value)}
            className={cn(
              "w-full h-10 pl-10 pr-4 rounded-xl bg-bg-tertiary text-sm text-text-primary",
              "placeholder:text-text-tertiary border border-border-subtle",
              "focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/30 outline-none transition-all"
            )}
            aria-label="Search airlines"
          />
        </div>

        <select
          value={alliance}
          onChange={(e) => setParam("alliance", e.target.value)}
          className={cn(
            "h-10 px-3 rounded-xl bg-bg-tertiary text-sm text-text-primary",
            "border border-border-subtle focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/30",
            "outline-none transition-all cursor-pointer [color-scheme:dark]"
          )}
          aria-label="Filter by alliance"
        >
          <option value="">All Alliances</option>
          {ALLIANCES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <input
          type="text"
          defaultValue={country}
          key={country}
          placeholder="Country..."
          onChange={(e) => setParamDebounced("country", e.target.value)}
          className={cn(
            "h-10 px-3 rounded-xl bg-bg-tertiary text-sm text-text-primary w-full sm:w-36",
            "placeholder:text-text-tertiary border border-border-subtle",
            "focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/30 outline-none transition-all"
          )}
          aria-label="Filter by country"
        />

        <select
          value={active}
          onChange={(e) => setParam("active", e.target.value)}
          className={cn(
            "h-10 px-3 rounded-xl bg-bg-tertiary text-sm text-text-primary",
            "border border-border-subtle focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/30",
            "outline-none transition-all cursor-pointer [color-scheme:dark]"
          )}
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 h-10 px-3 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors shrink-0"
            aria-label="Clear all filters"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}

        {isPending && (
          <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
        )}
      </div>
    </div>
  );
}
