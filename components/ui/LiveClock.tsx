"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LiveClockProps {
  timezone: string;
  className?: string;
}

export function LiveClock({ timezone, className }: LiveClockProps) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone,
    });

    function tick() {
      setTime(formatter.format(new Date()));
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  if (!time) return null;

  return (
    <span className={cn("font-mono tabular-nums text-text-primary", className)}>
      {time}
    </span>
  );
}
