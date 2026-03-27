import { Check } from "lucide-react";
import { cn, formatTime, type FlightStatus } from "@/lib/utils";

interface FlightStatusTimelineProps {
  currentStatus: FlightStatus;
  departureTime?: string;
  arrivalTime?: string;
}

const stages = [
  { key: "scheduled", label: "Scheduled" },
  { key: "gate_open", label: "Gate Open" },
  { key: "boarding", label: "Boarding" },
  { key: "departed", label: "Departed" },
  { key: "active", label: "In Flight" },
  { key: "landing", label: "Landing" },
  { key: "landed", label: "Landed" },
  { key: "at_gate", label: "At Gate" },
  { key: "baggage", label: "Baggage" },
] as const;

const statusToStageIndex: Record<FlightStatus, number> = {
  scheduled: 0,
  boarding: 2,
  departed: 3,
  active: 4,
  delayed: 0,
  diverted: 4,
  landed: 6,
  cancelled: -1,
};

export function FlightStatusTimeline({
  currentStatus,
  departureTime,
  arrivalTime,
}: FlightStatusTimelineProps) {
  const currentIndex = statusToStageIndex[currentStatus] ?? 0;
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className="flex flex-col gap-0">
      {stages.map((stage, i) => {
        const isPast = !isCancelled && i < currentIndex;
        const isCurrent = !isCancelled && i === currentIndex;
        const isFuture = isCancelled || i > currentIndex;

        let timeLabel: string | null = null;
        if (stage.key === "departed" && departureTime) {
          timeLabel = formatTime(departureTime);
        } else if (stage.key === "landed" && arrivalTime) {
          timeLabel = formatTime(arrivalTime);
        }

        return (
          <div key={stage.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                  isPast && "border-accent-green bg-accent-green",
                  isCurrent && "border-accent-blue bg-accent-blue",
                  isFuture && "border-border-subtle bg-bg-tertiary"
                )}
              >
                {isPast && <Check className="h-3 w-3 text-white" />}
                {isCurrent && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
              {i < stages.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-6",
                    isPast ? "bg-accent-green" : "bg-border-subtle"
                  )}
                />
              )}
            </div>

            <div className="flex items-baseline gap-2 pb-3 pt-0.5">
              <span
                className={cn(
                  "text-sm font-medium",
                  isPast && "text-accent-green",
                  isCurrent && "text-accent-blue",
                  isFuture && "text-text-tertiary"
                )}
              >
                {stage.label}
              </span>
              {timeLabel && (
                <span className="text-xs font-mono text-text-tertiary">
                  {timeLabel}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div className="mt-2 text-sm font-medium text-accent-red">
          Flight Cancelled
        </div>
      )}
    </div>
  );
}
