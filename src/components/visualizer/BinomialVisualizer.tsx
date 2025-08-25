"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ParameterSlider } from "./ParameterSlider";
import { ParameterInput } from "./ParameterInput";
import { OutputCard } from "./OutputCard";
import { GreekCard } from "./GreekCard";
import { DeltaChart } from "./DeltaChart";
import {
  calculateBinomial,
  calculateBinomialGreeks,
  generateBinomialDeltaCurve,
  type BinomialParams,
} from "@/lib/binomial";
import { RotateCcw } from "lucide-react";
import Link from "next/link";

const DEFAULT_PARAMS: BinomialParams = {
  spotPrice: 100,
  strikePrice: 100,
  timeToMaturity: 1,
  volatility: 0.2,
  riskFreeRate: 0.05,
  steps: 50,
};

export function BinomialVisualizer() {
  const [params, setParams] = useState<BinomialParams>(DEFAULT_PARAMS);
  const [highlightedLine, setHighlightedLine] = useState<"call" | "put" | null>(null);

  const updateParam = useCallback(
    <K extends keyof BinomialParams>(key: K, value: BinomialParams[K]) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setHighlightedLine(null);
  }, []);

  const results = useMemo(() => calculateBinomial(params), [params]);
  const greeks = useMemo(() => calculateBinomialGreeks(params), [params]);

  const deltaCurveData = useMemo(() => {
    const minSpot = Math.max(1, params.strikePrice * 0.5);
    const maxSpot = params.strikePrice * 1.5;
    return generateBinomialDeltaCurve(params, { min: minSpot, max: maxSpot, steps: 100 });
  }, [params]);

  return (
    <div className="min-h-screen w-full bg-black text-green-400 font-mono">
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="border-b border-[#1a1a1a] pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#00ff00] uppercase tracking-wider">
                BINOMIAL OPTION PRICING MODEL
              </h1>
              <p className="mt-1 text-xs text-[#666666]">
                Cox-Ross-Rubinstein | Discrete-time lattice model
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-3 py-1 border border-[#1a1a1a] bg-[#0a0a0a] text-[#00ff00] hover:border-[#00ff00] text-xs uppercase tracking-wider transition-colors"
              >
                BLACK-SCHOLES
              </Link>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1 border border-[#1a1a1a] bg-[#0a0a0a] text-[#00ff00] hover:border-[#00ff00] text-xs uppercase tracking-wider transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                RESET
              </button>
            </div>
          </div>
        </div>

        {/* Parameter Control Panel */}
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4 space-y-4">
          <div className="border-b border-[#1a1a1a] pb-2">
            <h2 className="text-xs uppercase tracking-wider text-[#666666] font-bold">
              PARAMETERS
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sliders */}
            <div className="space-y-4">
              <ParameterSlider
                label="Spot Price (S)"
                value={params.spotPrice}
                onChange={(v) => updateParam("spotPrice", v)}
                min={1}
                max={500}
                step={1}
                unit="$"
                formatValue={(v) => v.toFixed(0)}
                accentColor="cyan"
              />
              <ParameterSlider
                label="Volatility (σ)"
                value={params.volatility}
                onChange={(v) => updateParam("volatility", v)}
                min={0.01}
                max={1}
                step={0.01}
                unit="%"
                formatValue={(v) => (v * 100).toFixed(0)}
                accentColor="amber"
              />
              <ParameterSlider
                label="Tree Steps (n)"
                value={params.steps}
                onChange={(v) => updateParam("steps", Math.round(v))}
                min={10}
                max={200}
                step={5}
                formatValue={(v) => Math.round(v).toString()}
                accentColor="cyan"
              />
            </div>

            {/* Numeric Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ParameterInput
                label="Strike (K)"
                value={params.strikePrice}
                onChange={(v) => updateParam("strikePrice", v)}
                min={1}
                max={1000}
                step={1}
                unit="$"
              />
              <ParameterInput
                label="Time (T)"
                value={params.timeToMaturity}
                onChange={(v) => updateParam("timeToMaturity", v)}
                min={0.01}
                max={10}
                step={0.01}
                unit="yrs"
              />
              <ParameterInput
                label="Rate (r)"
                value={params.riskFreeRate}
                onChange={(v) => updateParam("riskFreeRate", v)}
                min={0}
                max={0.5}
                step={0.001}
                unit="%"
              />
            </div>
          </div>
        </div>

        {/* Output Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OutputCard
            label="CALL PRICE"
            value={results.callPrice}
            type="call"
            isHighlighted={highlightedLine === "call"}
            onClick={() =>
              setHighlightedLine((prev) => (prev === "call" ? null : "call"))
            }
          />
          <OutputCard
            label="PUT PRICE"
            value={results.putPrice}
            type="put"
            isHighlighted={highlightedLine === "put"}
            onClick={() =>
              setHighlightedLine((prev) => (prev === "put" ? null : "put"))
            }
          />
        </div>

        {/* Delta Chart */}
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <div className="border-b border-[#1a1a1a] pb-2 mb-4">
            <h2 className="text-xs uppercase tracking-wider text-[#666666] font-bold">
              DELTA vs SPOT PRICE
            </h2>
          </div>
          <div className="h-[300px]">
            <DeltaChart
              spotPrices={deltaCurveData.spotPrices}
              callDeltas={deltaCurveData.callDeltas}
              putDeltas={deltaCurveData.putDeltas}
              currentSpotPrice={params.spotPrice}
              strikePrice={params.strikePrice}
              highlightedLine={highlightedLine}
            />
          </div>
        </div>

        {/* Greeks Mini-Dashboard */}
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <div className="border-b border-[#1a1a1a] pb-2 mb-4">
            <h2 className="text-xs uppercase tracking-wider text-[#666666] font-bold">
              GREEKS
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <GreekCard
              label="Δ CALL"
              value={greeks.delta.call}
              description="∂C/∂S"
            />
            <GreekCard
              label="Δ PUT"
              value={greeks.delta.put}
              description="∂P/∂S"
            />
            <GreekCard
              label="Γ"
              value={greeks.gamma}
              description="∂²C/∂S²"
            />
            <GreekCard
              label="Θ"
              value={greeks.theta.call}
              description="∂C/∂t"
            />
            <GreekCard
              label="ν"
              value={greeks.vega}
              description="∂C/∂σ"
            />
            <GreekCard
              label="ρ"
              value={greeks.rho.call}
              description="∂C/∂r"
            />
          </div>
        </div>

        {/* Info Panel */}
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <div className="border-b border-[#1a1a1a] pb-2 mb-3">
            <h2 className="text-xs uppercase tracking-wider text-[#666666] font-bold">
              MODEL INFO
            </h2>
          </div>
          <p className="text-xs text-[#555555] leading-relaxed font-mono">
            Cox-Ross-Rubinstein binomial tree | Discrete-time lattice | n={params.steps} steps | 
            u = e^(σ√Δt), d = 1/u | p = (e^(rΔt) - d)/(u - d) | 
            Suitable for American options with early exercise
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#555555] border-t border-[#1a1a1a] pt-3">
          ASSUMPTIONS: No dividends, risk-neutral probability, constant volatility
        </div>
      </div>
    </div>
  );
}
