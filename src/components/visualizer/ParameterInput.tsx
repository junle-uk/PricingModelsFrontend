"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ParameterInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function ParameterInput({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 0.01,
  unit = "",
}: ParameterInputProps) {
  const [localValue, setLocalValue] = React.useState(value.toString());
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    const parsed = parseFloat(newValue);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseFloat(localValue);
    if (isNaN(parsed) || parsed < min) {
      setLocalValue(min.toString());
      onChange(min);
    } else if (parsed > max) {
      setLocalValue(max.toString());
      onChange(max);
    } else {
      setLocalValue(parsed.toString());
      onChange(parsed);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#8b92a8]">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={localValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          className={cn(
            "w-full h-11 px-4 rounded-lg font-mono text-base tabular-nums",
            "bg-[#1a1f2e] border border-white/10 text-[#e8edf5]",
            "transition-all duration-200",
            "focus:outline-none focus:border-[#00d9ff]/50 focus:ring-2 focus:ring-[#00d9ff]/20",
            "hover:border-white/20",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          )}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8b92a8]">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
