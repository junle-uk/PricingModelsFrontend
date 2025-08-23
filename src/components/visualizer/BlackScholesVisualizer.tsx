"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ParameterSlider } from "./ParameterSlider";
import { ParameterInput } from "./ParameterInput";
import { OutputCard } from "./OutputCard";
import { GreekCard } from "./GreekCard";
import { DeltaChart } from "./DeltaChart";
import {
  calculateBlackScholes,
  calculateGreeks,
  generateDeltaCurve,
  type BlackScholesParams,
} from "@/lib/black-scholes";
import { RotateCcw } from "lucide-react";

const DEFAULT_PARAMS: BlackScholesParams = {
  spotPrice: 100,
  strikePrice: 100,
  timeToMaturity: 1,
  volatility: 0.2,
  riskFreeRate: 0.05,
};

export function BlackScholesVisualizer() {
  const [params, setParams] = useState<BlackScholesParams>(DEFAULT_PARAMS);
  const [highlightedLine, setHighlightedLine] = useState<"call" | "put" | null>(null);

  const updateParam = useCallback(
    <K extends keyof BlackScholesParams>(key: K, value: BlackScholesParams[K]) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setHighlightedLine(null);
  }, []);

  const results = useMemo(() => calculateBlackScholes(params), [params]);
  const greeks = useMemo(() => calculateGreeks(params), [params]);

  const deltaCurveData = useMemo(() => {
    const minSpot = Math.max(1, params.strikePrice * 0.5);
    const maxSpot = params.strikePrice * 1.5;
    return generateDeltaCurve(params, { min: minSpot, max: maxSpot, steps: 100 });
  }, [params]);

  // Calculate volatility-based background gradient
  const volatilityHue = useMemo(() => {
    // Low volatility = cooler blues (200), high volatility = warmer oranges (30)
    const normalizedVol = Math.min(params.volatility, 1);
    return 200 - normalizedVol * 170;
  }, [params.volatility]);

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, hsla(${volatilityHue}, 70%, 20%, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(0, 217, 255, 0.05) 0%, transparent 40%),
          radial-gradient(ellipse at 20% 80%, rgba(255, 176, 32, 0.05) 0%, transparent 40%),
          linear-gradient(180deg, #0f1419 0%, #1a1f2e 100%)
        `,
      }}
    >
      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#e8edf5]">
              Black–Scholes Visualizer
            </h1>
            <p className="mt-2 text-[#8b92a8]">
              Real-time options pricing with interactive Greeks
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-[#8b92a8] hover:text-[#e8edf5] hover:border-white/20 hover:bg-white/10 transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Parameter Control Panel */}
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <h2 className="font-display text-lg font-semibold text-[#e8edf5]">
            Parameters
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sliders */}
            <div className="space-y-6">
              <ParameterSlider
                label="Current Asset Price"
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
                label="Volatility"
                value={params.volatility}
                onChange={(v) => updateParam("volatility", v)}
                min={0.01}
                max={1}
                step={0.01}
                unit="%"
                formatValue={(v) => (v * 100).toFixed(0)}
                accentColor="amber"
              />
            </div>

            {/* Numeric Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ParameterInput
                label="Strike Price"
                value={params.strikePrice}
                onChange={(v) => updateParam("strikePrice", v)}
                min={1}
                max={1000}
                step={1}
                unit="$"
              />
              <ParameterInput
                label="Time to Maturity"
                value={params.timeToMaturity}
                onChange={(v) => updateParam("timeToMaturity", v)}
                min={0.01}
                max={10}
                step={0.01}
                unit="yrs"
              />
              <ParameterInput
                label="Risk-Free Rate"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <OutputCard
            label="Call Price"
            value={results.callPrice}
            type="call"
            isHighlighted={highlightedLine === "call"}
            onClick={() =>
              setHighlightedLine((prev) => (prev === "call" ? null : "call"))
            }
          />
          <OutputCard
            label="Put Price"
            value={results.putPrice}
            type="put"
            isHighlighted={highlightedLine === "put"}
            onClick={() =>
              setHighlightedLine((prev) => (prev === "put" ? null : "put"))
            }
          />
        </div>

        {/* Delta Chart */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-[#e8edf5] mb-4">
            Delta vs Spot Price
          </h2>
          <div className="h-[350px]">
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
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-[#e8edf5] mb-4">
            Greeks
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <GreekCard
              label="Call Delta"
              value={greeks.delta.call}
              description="Price sensitivity"
            />
            <GreekCard
              label="Put Delta"
              value={greeks.delta.put}
              description="Price sensitivity"
            />
            <GreekCard
              label="Gamma"
              value={greeks.gamma}
              description="Delta sensitivity"
            />
            <GreekCard
              label="Theta (Daily)"
              value={greeks.theta.call}
              description="Time decay"
            />
            <GreekCard
              label="Vega"
              value={greeks.vega}
              description="Vol sensitivity"
            />
            <GreekCard
              label="Rho"
              value={greeks.rho.call}
              description="Rate sensitivity"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-[#8b92a8]/60 pb-4">
          Black–Scholes model assumes European-style options with no dividends
        </div>
      </div>
    </div>
  );
}
