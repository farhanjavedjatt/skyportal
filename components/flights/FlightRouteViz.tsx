import { cn, type FlightStatus } from "@/lib/utils";

interface FlightRouteVizProps {
  departureCode: string;
  departureName: string;
  arrivalCode: string;
  arrivalName: string;
  status: FlightStatus;
  progress?: number;
}

export function FlightRouteViz({
  departureCode,
  departureName,
  arrivalCode,
  arrivalName,
  status,
  progress = 0,
}: FlightRouteVizProps) {
  const isActive = status === "active";
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const dotStartX = 60;
  const dotEndX = 540;
  const lineY = 45;
  const planeX = dotStartX + (dotEndX - dotStartX) * clampedProgress;

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 600 120"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <line
          x1={dotStartX}
          y1={lineY}
          x2={dotEndX}
          y2={lineY}
          stroke="currentColor"
          strokeWidth="2"
          className="text-border-subtle"
        />

        {isActive && (
          <line
            x1={dotStartX}
            y1={lineY}
            x2={planeX}
            y2={lineY}
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent-blue"
          />
        )}

        {!isActive && (status === "landed" || status === "departed") && (
          <line
            x1={dotStartX}
            y1={lineY}
            x2={dotEndX}
            y2={lineY}
            stroke="currentColor"
            strokeWidth="2"
            className={cn(
              status === "landed" ? "text-accent-green" : "text-accent-blue"
            )}
          />
        )}

        <circle cx={dotStartX} cy={lineY} r="6" fill="currentColor" className="text-accent-blue" />
        <circle cx={dotEndX} cy={lineY} r="6" fill="currentColor" className="text-accent-blue" />

        {isActive && (
          <g transform={`translate(${planeX}, ${lineY})`}>
            <path
              d="M-8,-4 L4,0 L-8,4 L-6,0 Z"
              fill="currentColor"
              className="text-accent-blue"
            />
            <circle r="3" fill="currentColor" className="text-accent-blue" />
          </g>
        )}

        <text x={dotStartX} y={lineY + 22} textAnchor="middle" className="fill-text-primary text-[14px] font-bold" fontFamily="monospace">
          {departureCode}
        </text>
        <text x={dotStartX} y={lineY + 38} textAnchor="middle" className="fill-text-secondary text-[11px]">
          {departureName}
        </text>

        <text x={dotEndX} y={lineY + 22} textAnchor="middle" className="fill-text-primary text-[14px] font-bold" fontFamily="monospace">
          {arrivalCode}
        </text>
        <text x={dotEndX} y={lineY + 38} textAnchor="middle" className="fill-text-secondary text-[11px]">
          {arrivalName}
        </text>
      </svg>
    </div>
  );
}
