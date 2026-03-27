"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SearchBar } from "@/components/ui/SearchBar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/airports", label: "Airports" },
  { href: "/airlines", label: "Airlines" },
  { href: "/flights", label: "Flights" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle backdrop-blur-xl bg-bg-primary/80 supports-[backdrop-filter]:bg-bg-primary/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-blue text-white transition-transform duration-200 group-hover:scale-105">
              <Plane className="h-5 w-5" />
            </div>
            <span className="font-heading text-xl font-bold text-text-primary tracking-tight">
              SkyPortal
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                  pathname.startsWith(link.href)
                    ? "text-accent-blue bg-accent-blue/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md ml-8">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border-subtle bg-bg-secondary/95 backdrop-blur-xl">
          <div className="px-4 py-3">
            <SearchBar />
          </div>
          <nav className="px-4 pb-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  pathname.startsWith(link.href)
                    ? "text-accent-blue bg-accent-blue/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
