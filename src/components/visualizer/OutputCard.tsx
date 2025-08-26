"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OutputCardProps {
  label: string;
  value: number;
  type: "call" | "put";
  isHighlighted?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

export function OutputCard({
  label,
  value,
  type,
  isHighlighted = false,
  onClick,
  isLoading = false,
}: OutputCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-4 border border-[#1a1a1a] bg-[#0a0a0a] cursor-pointer",
        "font-mono transition-all duration-100",
        isHighlighted && "border-[#00ff00] bg-[#0a1a0a]"
      )}
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wider text-[#666666] font-medium">
          {label}
        </p>
        <p className="text-2xl font-bold tabular-nums text-[#00ff00]">
          {isLoading ? (
            <span className="text-[#666666] animate-pulse">...</span>
          ) : (
            `$${value.toFixed(4)}`
          )}
        </p>
      </div>
      {isHighlighted && (
        <div className="absolute top-0 left-0 w-1 h-full bg-[#00ff00]" />
      )}
    </div>
  );
}
