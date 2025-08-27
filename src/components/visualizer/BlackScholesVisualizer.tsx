"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { ParameterSlider } from "./ParameterSlider";
import { ParameterInput } from "./ParameterInput";
import { OutputCard } from "./OutputCard";
import { GreekCard } from "./GreekCard";
import { DeltaChart } from "./DeltaChart";
import { CallAndPutChart } from "./CallAndPutChart";
import {
  calculateGreeks,
  generateDeltaCurve,
  generateCallPutCurve,
  type BlackScholesParams,
} from "@/lib/black-scholes";
import { RotateCcw } from "lucide-react";
import { fetchBlackScholes, type BlackScholesResult } from "@/api/BlackScholes";
import Link from "next/link";

const DEFAULT_PARAMS: BlackScholesParams = {
  spotPrice: 100,
  strikePrice: 100,
  timeToMaturity: 1,
  volatility: 0.2,
  riskFreeRate: 0.05,
};

const DEBOUNCE_DELAY = 300; // milliseconds

export function BlackScholesVisualizer() {
  const [params, setParams] = useState<BlackScholesParams>(DEFAULT_PARAMS);
  const [highlightedLine, setHighlightedLine] = useState<"call" | "put" | null>(null);
  const [results, setResults] = useState<BlackScholesResult>({
    callPrice: 0,
    putPrice: 0,
    d1: 0,
    d2: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMountRef = useRef(true);

  const updateParam = useCallback(
    <K extends keyof BlackScholesParams>(key: K, value: BlackScholesParams[K]) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Debounced API call on parameter changes
  useEffect(() => {
    // On initial mount, fetch immediately without debounce
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      setIsLoading(true);
      fetchBlackScholes(params)
        .then((apiResults) => {
          setResults(apiResults);
        })
        .catch((error) => {
          console.error("Error fetching Black-Scholes calculation:", error);
          setResults({
            callPrice: 0,
            putPrice: 0,
            d1: 0,
            d2: 0,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    // For subsequent changes, use debouncing
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set loading state immediately for better UX
    setIsLoading(true);

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const apiResults = await fetchBlackScholes(params);
        setResults(apiResults);
      } catch (error) {
        console.error("Error fetching Black-Scholes calculation:", error);
        // Fallback to zero values on error
        setResults({
          callPrice: 0,
          putPrice: 0,
          d1: 0,
          d2: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_DELAY);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [params]);

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setHighlightedLine(null);
  }, []);

  const greeks = useMemo(() => calculateGreeks(params), [params]);

  const deltaCurveData = useMemo(() => {
    const minSpot = Math.max(1, params.strikePrice * 0.5);
    const maxSpot = params.strikePrice * 1.5;
    return generateDeltaCurve(params, { min: minSpot, max: maxSpot, steps: 100 });
  }, [params]);

  const callPutCurveData = useMemo(() => {
    const minSpot = Math.max(1, params.strikePrice * 0.5);
    const maxSpot = params.strikePrice * 1.5;
    return generateCallPutCurve(params, { min: minSpot, max: maxSpot, steps: 100 });
  }, [params]);

  return (
    <div className="min-h-screen w-full bg-black text-green-400 font-mono">
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="border-b border-[#1a1a1a] pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#00ff00] uppercase tracking-wider">
                BLACK-SCHOLES OPTION PRICING MODEL
              </h1>
              <p className="mt-1 text-xs text-[#666666]">
                C(S,t) = S*N(d1) - K*e^(-rT)*N(d2)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/binomial"
                className="px-3 py-1 border border-[#1a1a1a] bg-[#0a0a0a] text-[#00ff00] hover:border-[#00ff00] text-xs uppercase tracking-wider transition-colors"
              >
                BINOMIAL
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
                max={1.0}
                step={0.01}
                unit="%"
                formatValue={(v) => (v * 100).toFixed(0)}
                accentColor="amber"
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
            isLoading={isLoading}
          />
          <OutputCard
            label="PUT PRICE"
            value={results.putPrice}
            type="put"
            isHighlighted={highlightedLine === "put"}
            onClick={() =>
              setHighlightedLine((prev) => (prev === "put" ? null : "put"))
            }
            isLoading={isLoading}
          />
        </div>

        {/* Call and Put vs Spot Price Chart */}
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <div className="border-b border-[#1a1a1a] pb-2 mb-4">
            <h2 className="text-xs uppercase tracking-wider text-[#666666] font-bold">
              CALL AND PUT vs SPOT PRICE
            </h2>
          </div>
          <div className="h-[300px]">
            <CallAndPutChart
              spotPrices={callPutCurveData.spotPrices}
              callPrices={callPutCurveData.callPrices}
              putPrices={callPutCurveData.putPrices}
              currentSpotPrice={params.spotPrice}
              strikePrice={params.strikePrice}
              highlightedLine={highlightedLine}
            />
          </div>
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

        {/* Footer */}
        <div className="text-center text-xs text-[#555555] border-t border-[#1a1a1a] pt-3">
          ASSUMPTIONS: European options, no dividends, constant volatility, risk-free rate
        </div>
      </div>
    </div>
  );
}
