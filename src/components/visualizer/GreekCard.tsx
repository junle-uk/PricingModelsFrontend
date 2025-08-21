"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GreekCardProps {
  label: string;
  value: number;
  description?: string;
  format?: "decimal" | "percentage";
}

export function GreekCard({
  label,
  value,
  description,
  format = "decimal",
}: GreekCardProps) {
  const displayValue = format === "percentage" 
    ? `${(value * 100).toFixed(2)}%`
    : value.toFixed(4);

  const isPositive = value >= 0;

  return (
    <div className="p-4 rounded-lg glass-panel hover:border-white/20 transition-all duration-200">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-[#8b92a8]">
          {label}
        </p>
        <p className={cn(
          "font-mono text-xl font-semibold tabular-nums",
          isPositive ? "text-[#00d9ff]" : "text-[#ffb020]"
        )}>
          {displayValue}
        </p>
        {description && (
          <p className="text-xs text-[#8b92a8]/70">{description}</p>
        )}
      </div>
    </div>
  );
}
