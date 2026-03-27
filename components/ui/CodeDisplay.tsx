import { cn } from "@/lib/utils";

interface CodeDisplayProps {
  code: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
} as const;

export function CodeDisplay({ code, size = "md", className }: CodeDisplayProps) {
  return (
    <span
      className={cn(
        "font-mono font-bold tracking-wider text-accent-blue",
        "[text-shadow:0_0_20px_rgba(59,130,246,0.3)]",
        sizeMap[size],
        className
      )}
    >
      {code}
    </span>
  );
}
