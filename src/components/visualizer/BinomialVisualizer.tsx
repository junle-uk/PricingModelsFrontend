"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import { fetchGreeksCurve } from "@/api/greeks";
import { fetchSurface3D } from "@/api/surface3d";
import { GreeksChart } from "./GreeksChart";
import { Surface3DChart } from "./Surface3DChart";
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
  const [gammaCurve, setGammaCurve] = useState<{ xValues: number[]; yValues: number[] } | null>(null);
  const [vegaCurve, setVegaCurve] = useState<{ xValues: number[]; yValues: number[] } | null>(null);
  const [thetaCurve, setThetaCurve] = useState<{ xValues: number[]; yValues: number[] } | null>(null);
  const [surfaceData, setSurfaceData] = useState<{
    spotPrices: number[];
    times: number[];
    callPrices: number[][];
    putPrices: number[][];
  } | null>(null);
  const [showCallSurface, setShowCallSurface] = useState(true);
  const [showPutSurface, setShowPutSurface] = useState(true);

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

  // Fetch Greeks curves from backend
  useEffect(() => {
    const fetchCurves = async () => {
      const minSpot = Math.max(1, params.strikePrice * 0.5);
      const maxSpot = params.strikePrice * 1.5;
      
      try {
        const [gamma, vega, theta] = await Promise.all([
          fetch(`/dataFetchers/binomial/greeks-curve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...params,
              rangeMin: minSpot,
              rangeMax: maxSpot,
              steps: 100,
              curveType: "gamma",
            }),
          }).then(r => r.json()),
          fetch(`/dataFetchers/binomial/greeks-curve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...params,
              rangeMin: minSpot,
              rangeMax: maxSpot,
              steps: 100,
              curveType: "vega",
            }),
          }).then(r => r.json()),
          fetch(`/dataFetchers/binomial/greeks-curve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...params,
              rangeMin: 0.01,
              rangeMax: params.timeToMaturity * 2,
              steps: 100,
              curveType: "theta",
            }),
          }).then(r => r.json()),
        ]);
        setGammaCurve(gamma);
        setVegaCurve(vega);
        setThetaCurve(theta);
      } catch (error) {
        console.error("Error fetching Greeks curves:", error);
      }
    };

    const timer = setTimeout(fetchCurves, 300);
    return () => clearTimeout(timer);
  }, [params]);

  // Fetch 3D surface data
  useEffect(() => {
    const fetchSurface = async () => {
      const minSpot = Math.max(1, params.strikePrice * 0.5);
      const maxSpot = params.strikePrice * 1.5;
      
      try {
        const data = await fetchSurface3D({
          ...params,
          spotMin: minSpot,
          spotMax: maxSpot,
          timeMin: 0.01,
          timeMax: params.timeToMaturity * 2,
          spotSteps: 30,
          timeSteps: 30,
          model: "binomial",
          steps: params.steps,
        });
        setSurfaceData(data);
      } catch (error) {
        console.error("Error fetching surface data:", error);
      }
    };

    const timer = setTimeout(fetchSurface, 600);
    return () => clearTimeout(timer);
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
              <Link
                href="/monte-carlo"
                className="px-3 py-1 border border-[#1a1a1a] bg-[#0a0a0a] text-[#00ff00] hover:border-[#00ff00] text-xs uppercase tracking-wider transition-colors"
              >
                MONTE CARLO
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

        {/* Gamma Chart */}
        {gammaCurve && (
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
            <div className="border-b border-[#1a1a1a] pb-2 mb-4">
              <h2 className="text-xs uppercase tracking-wider text-[#666666] font-bold">
                GAMMA vs SPOT PRICE
              </h2>
            </div>
            <div className="h-[300px]">
              <GreeksChart
                xValues={gammaCurve.xValues}
                yValues={gammaCurve.yValues}
                xLabel="SPOT PRICE (S)"
                yLabel="Γ"
                title="GAMMA"
                currentX={params.spotPrice}
              />
            </div>
          </div>
        )}

        {/* Vega Chart */}
        {vegaCurve && (
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
            <div className="border-b border-[#1a1a1a] pb-2 mb-4">
              <h2 className="text-xs uppercase tracking-wider text-[#666666] font-bold">
                VEGA vs SPOT PRICE
              </h2>
            </div>
            <div className="h-[300px]">
              <GreeksChart
                xValues={vegaCurve.xValues}
                yValues={vegaCurve.yValues}
                xLabel="SPOT PRICE (S)"
                yLabel="ν"
                title="VEGA"
                currentX={params.spotPrice}
              />
            </div>
          </div>
        )}

        {/* Theta Chart */}
        {thetaCurve && (
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
            <div className="border-b border-[#1a1a1a] pb-2 mb-4">
              <h2 className="text-xs uppercase tracking-wider text-[#666666] font-bold">
                THETA vs TIME
              </h2>
            </div>
            <div className="h-[300px]">
              <GreeksChart
                xValues={thetaCurve.xValues}
                yValues={thetaCurve.yValues}
                xLabel="TIME TO EXPIRY (T)"
                yLabel="Θ"
                title="THETA"
                currentX={params.timeToMaturity}
              />
            </div>
          </div>
        )}

        {/* 3D Surface Chart */}
        {surfaceData && (
          <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
            <div className="border-b border-[#1a1a1a] pb-2 mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-wider text-[#666666] font-bold">
                  3D OPTION PRICE SURFACE
                </h2>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-[#666666]">
                    <input
                      type="checkbox"
                      checked={showCallSurface}
                      onChange={(e) => setShowCallSurface(e.target.checked)}
                      className="accent-[#00ff00]"
                    />
                    CALL
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#666666]">
                    <input
                      type="checkbox"
                      checked={showPutSurface}
                      onChange={(e) => setShowPutSurface(e.target.checked)}
                      className="accent-[#ff0000]"
                    />
                    PUT
                  </label>
                </div>
              </div>
            </div>
            <div className="h-[500px]">
              <Surface3DChart
                spotPrices={surfaceData.spotPrices}
                times={surfaceData.times}
                callPrices={surfaceData.callPrices}
                putPrices={surfaceData.putPrices}
                showCall={showCallSurface}
                showPut={showPutSurface}
              />
            </div>
          </div>
        )}

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
