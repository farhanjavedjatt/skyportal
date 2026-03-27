import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FlightStatus =
  | "scheduled"
  | "active"
  | "landed"
  | "cancelled"
  | "diverted"
  | "delayed"
  | "boarding"
  | "departed";

export function getStatusConfig(status: FlightStatus) {
  const configs: Record<
    FlightStatus,
    { label: string; color: string; bg: string; dot: string }
  > = {
    scheduled: {
      label: "Scheduled",
      color: "text-text-secondary",
      bg: "bg-text-secondary/10",
      dot: "bg-text-secondary",
    },
    active: {
      label: "In Flight",
      color: "text-accent-blue",
      bg: "bg-accent-blue/10",
      dot: "bg-accent-blue",
    },
    boarding: {
      label: "Boarding",
      color: "text-accent-blue",
      bg: "bg-accent-blue/10",
      dot: "bg-accent-blue",
    },
    departed: {
      label: "Departed",
      color: "text-text-tertiary",
      bg: "bg-text-tertiary/10",
      dot: "bg-text-tertiary",
    },
    landed: {
      label: "Landed",
      color: "text-accent-green",
      bg: "bg-accent-green/10",
      dot: "bg-accent-green",
    },
    delayed: {
      label: "Delayed",
      color: "text-accent-amber",
      bg: "bg-accent-amber/10",
      dot: "bg-accent-amber",
    },
    cancelled: {
      label: "Cancelled",
      color: "text-accent-red",
      bg: "bg-accent-red/10",
      dot: "bg-accent-red",
    },
    diverted: {
      label: "Diverted",
      color: "text-accent-purple",
      bg: "bg-accent-purple/10",
      dot: "bg-accent-purple",
    },
  };

  return configs[status] || configs.scheduled;
}

export function formatTime(
  date: string | Date | null,
  timezone: string = "UTC"
): string {
  if (!date) return "--:--";
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  });
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return formatDate(date);
}

export function getDelayLabel(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatLocalDateTime(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function getAllianceColor(alliance: string | null): string {
  switch (alliance) {
    case "Star Alliance":
      return "text-amber-400";
    case "oneworld":
      return "text-red-400";
    case "SkyTeam":
      return "text-blue-400";
    default:
      return "text-text-tertiary";
  }
}
