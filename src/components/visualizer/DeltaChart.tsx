"use client";

import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DeltaChartProps {
  spotPrices: number[];
  callDeltas: number[];
  putDeltas: number[];
  currentSpotPrice: number;
  strikePrice: number;
  highlightedLine?: "call" | "put" | null;
}

export function DeltaChart({
  spotPrices,
  callDeltas,
  putDeltas,
  currentSpotPrice,
  strikePrice,
  highlightedLine,
}: DeltaChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);

  const data = {
    labels: spotPrices.map((p) => p.toFixed(0)),
    datasets: [
      {
        label: "Call Delta",
        data: callDeltas,
        borderColor: "#00d9ff",
        backgroundColor: "rgba(0, 217, 255, 0.1)",
        borderWidth: highlightedLine === "call" ? 4 : highlightedLine === "put" ? 1.5 : 2.5,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#00d9ff",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
        tension: 0.4,
        fill: false,
      },
      {
        label: "Put Delta",
        data: putDeltas,
        borderColor: "#ffb020",
        backgroundColor: "rgba(255, 176, 32, 0.1)",
        borderWidth: highlightedLine === "put" ? 4 : highlightedLine === "call" ? 1.5 : 2.5,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#ffb020",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 600,
      easing: "easeInOutCubic",
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          color: "#8b92a8",
          font: {
            family: "'JetBrains Mono', monospace",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(26, 31, 46, 0.95)",
        titleColor: "#e8edf5",
        bodyColor: "#8b92a8",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 12,
        titleFont: {
          family: "'Space Grotesk', sans-serif",
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          family: "'JetBrains Mono', monospace",
          size: 12,
        },
        displayColors: true,
        callbacks: {
          title: (items) => `Spot Price: $${items[0].label}`,
          label: (item) => {
            const value = item.parsed.y;
            return `${item.dataset.label}: ${value.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Spot Price ($)",
          color: "#8b92a8",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: "normal",
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          drawTicks: false,
        },
        ticks: {
          color: "#8b92a8",
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10,
          },
          maxTicksLimit: 10,
        },
        border: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Delta",
          color: "#8b92a8",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: "normal",
          },
        },
        min: -1,
        max: 1,
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          drawTicks: false,
        },
        ticks: {
          color: "#8b92a8",
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10,
          },
          stepSize: 0.25,
        },
        border: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}
