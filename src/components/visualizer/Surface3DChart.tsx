"use client";

import React, { useEffect, useRef } from "react";
import Plot from "react-plotly.js";
import type { Layout, Data } from "plotly.js";

interface Surface3DChartProps {
  spotPrices: number[];
  times: number[];
  callPrices: number[][];
  putPrices: number[][];
  showCall: boolean;
  showPut: boolean;
}

export function Surface3DChart({
  spotPrices,
  times,
  callPrices,
  putPrices,
  showCall,
  showPut,
}: Surface3DChartProps) {
  const plotRef = useRef<HTMLDivElement>(null);

  // Prepare data for plotly
  const traces: Data[] = [];

  if (showCall && callPrices.length > 0) {
    traces.push({
      type: "surface",
      x: times,
      y: spotPrices,
      z: callPrices,
      colorscale: [[0, "#00ff00"], [1, "#00ff00"]],
      name: "Call Price",
      showscale: true,
      opacity: 0.8,
    } as Data);
  }

  if (showPut && putPrices.length > 0) {
    traces.push({
      type: "surface",
      x: times,
      y: spotPrices,
      z: putPrices,
      colorscale: [[0, "#ff0000"], [1, "#ff0000"]],
      name: "Put Price",
      showscale: true,
      opacity: 0.8,
    } as Data);
  }

  const layout: Partial<Layout> = {
    title: {
      text: "Option Price Surface",
      font: { color: "#00ff00", family: "monospace", size: 14 },
    },
    scene: {
      xaxis: {
        title: { text: "Time to Expiry (years)", font: { color: "#666666", size: 12 } },
        gridcolor: "#1a1a1a",
        backgroundcolor: "#0a0a0a",
        showbackground: true,
      },
      yaxis: {
        title: { text: "Spot Price ($)", font: { color: "#666666", size: 12 } },
        gridcolor: "#1a1a1a",
        backgroundcolor: "#0a0a0a",
        showbackground: true,
      },
      zaxis: {
        title: { text: "Option Price ($)", font: { color: "#666666", size: 12 } },
        gridcolor: "#1a1a1a",
        backgroundcolor: "#0a0a0a",
        showbackground: true,
      },
      bgcolor: "#0a0a0a",
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 },
      },
    },
    paper_bgcolor: "#0a0a0a",
    plot_bgcolor: "#0a0a0a",
    font: { color: "#00ff00", family: "monospace" },
    margin: { l: 0, r: 0, t: 40, b: 0 },
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["pan2d", "lasso2d"],
    toImageButtonOptions: {
      format: "png",
      filename: "option-surface",
      height: 600,
      width: 800,
      scale: 1,
    },
  };

  return (
    <div className="w-full h-full min-h-[500px]" ref={plotRef}>
      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler={true}
      />
    </div>
  );
}

