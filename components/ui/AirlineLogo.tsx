"use client";

import { useState } from "react";
import Image from "next/image";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface AirlineLogoProps {
  src: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export function AirlineLogo({
  src,
  alt,
  size = 40,
  className,
}: AirlineLogoProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const iconSize = size <= 40 ? "h-5 w-5" : "h-10 w-10";
    return (
      <div
        className={cn(
          "rounded-lg bg-bg-tertiary flex items-center justify-center overflow-hidden shrink-0",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Plane className={cn(iconSize, "text-text-tertiary")} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-lg bg-bg-tertiary flex items-center justify-center overflow-hidden shrink-0",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-1"
        sizes={`${size}px`}
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}
