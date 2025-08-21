"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface ParameterSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  formatValue?: (value: number) => string;
  accentColor?: "cyan" | "amber";
}

export function ParameterSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = "",
  formatValue,
  accentColor = "cyan",
}: ParameterSliderProps) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(2);
  const isCyan = accentColor === "cyan";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#8b92a8]">{label}</label>
        <span
          className={cn(
            "font-mono text-lg font-semibold tabular-nums",
            isCyan ? "text-[#00d9ff]" : "text-[#ffb020]"
          )}
        >
          {displayValue}
          {unit && <span className="text-xs ml-1 text-[#8b92a8]">{unit}</span>}
        </span>
      </div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center h-6 group"
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative h-2 w-full grow overflow-hidden rounded-full",
            "bg-[#1a1f2e]"
          )}
        >
          <SliderPrimitive.Range
            className={cn(
              "absolute h-full transition-all duration-150",
              isCyan
                ? "bg-gradient-to-r from-[#00d9ff]/60 to-[#00d9ff]"
                : "bg-gradient-to-r from-[#ffb020]/60 to-[#ffb020]"
            )}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "block h-5 w-5 rounded-full border-2 shadow-lg transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]",
            "hover:scale-110 active:scale-95",
            isCyan
              ? "bg-[#00d9ff] border-[#00d9ff]/50 focus-visible:ring-[#00d9ff]/50 shadow-[0_0_15px_rgba(0,217,255,0.5)]"
              : "bg-[#ffb020] border-[#ffb020]/50 focus-visible:ring-[#ffb020]/50 shadow-[0_0_15px_rgba(255,176,32,0.5)]"
          )}
        />
      </SliderPrimitive.Root>
    </div>
  );
}
