"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OutputCardProps {
  label: string;
  value: number;
  type: "call" | "put";
  isHighlighted?: boolean;
  onClick?: () => void;
}

export function OutputCard({
  label,
  value,
  type,
  isHighlighted = false,
  onClick,
}: OutputCardProps) {
  const isCall = type === "call";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-6 rounded-xl cursor-pointer transition-all duration-200",
        "backdrop-blur-xl border",
        isCall
          ? "bg-[#00d9ff]/10 border-[#00d9ff]/30 hover:border-[#00d9ff]/50"
          : "bg-[#ffb020]/10 border-[#ffb020]/30 hover:border-[#ffb020]/50",
        isHighlighted && isCall && "ring-2 ring-[#00d9ff]/50 shadow-[0_0_30px_rgba(0,217,255,0.2)]",
        isHighlighted && !isCall && "ring-2 ring-[#ffb020]/50 shadow-[0_0_30px_rgba(255,176,32,0.2)]",
        "hover:scale-[1.02] active:scale-[0.98]"
      )}
    >
      <div className="space-y-2">
        <p className={cn(
          "text-sm font-medium uppercase tracking-wider",
          isCall ? "text-[#00d9ff]/80" : "text-[#ffb020]/80"
        )}>
          {label}
        </p>
        <p className={cn(
          "font-mono text-4xl font-bold tabular-nums",
          isCall ? "text-[#00d9ff]" : "text-[#ffb020]"
        )}>
          ${value.toFixed(2)}
        </p>
      </div>
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200",
          isCall ? "bg-[#00d9ff]/5" : "bg-[#ffb020]/5",
          "group-hover:opacity-100"
        )}
      />
    </div>
  );
}
