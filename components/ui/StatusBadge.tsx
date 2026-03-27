import { cn } from "@/lib/utils";
import { getStatusConfig, getDelayLabel, type FlightStatus } from "@/lib/utils";

interface StatusBadgeProps {
  status: FlightStatus;
  delay?: number;
  className?: string;
}

export function StatusBadge({ status, delay, className }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const delayLabel = delay ? getDelayLabel(delay) : null;

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.bg,
        config.color,
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          config.dot,
          status === "boarding" && "animate-pulse"
        )}
      />
      {config.label}
      {delayLabel && (
        <span className="opacity-75">+{delayLabel}</span>
      )}
    </span>
  );
}
