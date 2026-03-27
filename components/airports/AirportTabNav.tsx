import Link from "next/link";
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AirportTabNavProps {
  slug: string;
  activeTab: "overview" | "departures" | "arrivals" | "airlines";
}

const tabs = [
  {
    id: "overview" as const,
    label: "Overview",
    icon: LayoutDashboard,
    path: "",
  },
  {
    id: "departures" as const,
    label: "Departures",
    icon: ArrowUpRight,
    path: "/departures",
  },
  {
    id: "arrivals" as const,
    label: "Arrivals",
    icon: ArrowDownRight,
    path: "/arrivals",
  },
  {
    id: "airlines" as const,
    label: "Airlines",
    icon: Plane,
    path: "/airlines",
  },
];

export function AirportTabNav({ slug, activeTab }: AirportTabNavProps) {
  return (
    <nav className="flex gap-1 border-b border-border-subtle overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            href={`/airports/${slug}${tab.path}`}
            className={cn(
              "relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "text-accent-blue"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-accent-blue rounded-t-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
