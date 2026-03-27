import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, message, icon, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-tertiary text-text-tertiary mb-4">
        {icon ?? <Search className="h-7 w-7" />}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-text-secondary text-center max-w-sm">{message}</p>
      )}
    </div>
  );
}
