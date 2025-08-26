"use client";

import React, { useRef } from "react";
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

interface CallAndPutChartProps {
  spotPrices: number[];
  callPrices: number[];
  putPrices: number[];
  currentSpotPrice: number;
  strikePrice: number;
  highlightedLine?: "call" | "put" | null;
}

export function CallAndPutChart({
  spotPrices,
  callPrices,
  putPrices,
  currentSpotPrice,
  strikePrice,
  highlightedLine,
}: CallAndPutChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);

  const data = {
    labels: spotPrices.map((p) => p.toFixed(0)),
    datasets: [
      {
        label: "CALL PRICE",
        data: callPrices,
        borderColor: "#00ff00",
        backgroundColor: "rgba(0, 255, 0, 0.05)",
        borderWidth: highlightedLine === "call" ? 2 : highlightedLine === "put" ? 1 : 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: "#00ff00",
        pointHoverBorderColor: "#00ff00",
        pointHoverBorderWidth: 1,
        tension: 0.4,
        fill: false,
      },
      {
        label: "PUT PRICE",
        data: putPrices,
        borderColor: "#ff0000",
        backgroundColor: "rgba(255, 0, 0, 0.05)",
        borderWidth: highlightedLine === "put" ? 2 : highlightedLine === "call" ? 1 : 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: "#ff0000",
        pointHoverBorderColor: "#ff0000",
        pointHoverBorderWidth: 1,
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
          color: "#666666",
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10,
          },
          usePointStyle: true,
          pointStyle: "line",
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "#0a0a0a",
        titleColor: "#00ff00",
        bodyColor: "#00ff00",
        borderColor: "#1a1a1a",
        borderWidth: 1,
        padding: 8,
        titleFont: {
          family: "'JetBrains Mono', monospace",
          size: 11,
          weight: "bold",
        },
        bodyFont: {
          family: "'JetBrains Mono', monospace",
          size: 11,
        },
        displayColors: true,
        callbacks: {
          title: (items) => `S = $${items[0].label}`,
          label: (item) => {
            const value = item.parsed.y;
            return `${item.dataset.label}: $${value ? value.toFixed(4) : '0.0000'}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "SPOT PRICE (S)",
          color: "#666666",
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10,
            weight: "bold",
          },
        },
        grid: {
          color: "#1a1a1a",
          drawTicks: false,
        },
        ticks: {
          color: "#555555",
          font: {
            family: "'JetBrains Mono', monospace",
            size: 9,
          },
          maxTicksLimit: 10,
        },
        border: {
          color: "#1a1a1a",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "OPTION PRICE ($)",
          color: "#666666",
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10,
            weight: "bold",
          },
        },
        grid: {
          color: "#1a1a1a",
          drawTicks: false,
        },
        ticks: {
          color: "#555555",
          font: {
            family: "'JetBrains Mono', monospace",
            size: 9,
          },
        },
        border: {
          color: "#1a1a1a",
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

