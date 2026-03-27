"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plane, Building2, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "airport" | "airline" | "flight";
  title: string;
  subtitle: string;
  code?: string;
  href: string;
}

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter" && query.length >= 2) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          router.push(results[selectedIndex].href);
          setIsOpen(false);
          setQuery("");
        } else {
          router.push(`/search?q=${encodeURIComponent(query)}`);
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  }

  const iconMap = {
    airport: Building2,
    airline: Plane,
    flight: Navigation,
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search airports, airlines, flights..."
          className="w-full h-11 pl-9 pr-4 rounded-xl bg-bg-tertiary text-sm text-text-primary placeholder:text-text-tertiary border border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50 outline-none transition-all"
          aria-label="Search"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          className="absolute top-full mt-2 w-full rounded-xl bg-bg-secondary border border-border-subtle shadow-2xl overflow-hidden z-50"
          role="listbox"
        >
          {results.map((result, i) => {
            const Icon = iconMap[result.type];
            return (
              <button
                key={`${result.type}-${result.href}`}
                onClick={() => {
                  router.push(result.href);
                  setIsOpen(false);
                  setQuery("");
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 text-left transition-colors",
                  i === selectedIndex
                    ? "bg-bg-hover"
                    : "hover:bg-bg-hover/50"
                )}
                role="option"
                aria-selected={i === selectedIndex}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-tertiary text-text-secondary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {result.title}
                    </span>
                    {result.code && (
                      <span className="text-xs font-mono text-accent-blue font-semibold">
                        {result.code}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-text-tertiary truncate block">
                    {result.subtitle}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
                  {result.type}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
