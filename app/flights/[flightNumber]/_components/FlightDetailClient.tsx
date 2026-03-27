"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const POLL_INTERVAL_MS = 60_000;

interface FlightDetailClientProps {
  children: React.ReactNode;
  isActive: boolean;
}

export function FlightDetailClient({
  children,
  isActive,
}: FlightDetailClientProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isActive) return;

    const id = setInterval(() => {
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isActive, router]);

  return <>{children}</>;
}
