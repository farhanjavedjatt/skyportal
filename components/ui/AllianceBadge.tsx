import { cn } from "@/lib/utils";

interface AllianceBadgeProps {
  alliance: string | null;
  className?: string;
}

const allianceStyles: Record<string, { bg: string; text: string }> = {
  "Star Alliance": { bg: "bg-amber-400/10", text: "text-amber-400" },
  oneworld: { bg: "bg-red-400/10", text: "text-red-400" },
  SkyTeam: { bg: "bg-blue-400/10", text: "text-blue-400" },
};

export function AllianceBadge({ alliance, className }: AllianceBadgeProps) {
  if (!alliance) return null;

  const style = allianceStyles[alliance] ?? {
    bg: "bg-text-tertiary/10",
    text: "text-text-tertiary",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
        style.bg,
        style.text,
        className
      )}
    >
      {alliance}
    </span>
  );
}
