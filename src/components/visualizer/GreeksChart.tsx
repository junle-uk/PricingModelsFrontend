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
  Legend
);

interface GreeksChartProps {
  xValues: number[];
  yValues: number[];
  xLabel: string;
  yLabel: string;
  title: string;
  currentX?: number;
}

export function GreeksChart({
  xValues,
  yValues,
  xLabel,
  yLabel,
  title,
  currentX,
}: GreeksChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);

  const data = {
    labels: xValues.map((v) => v.toFixed(2)),
    datasets: [
      {
        label: title,
        data: yValues,
        borderColor: "#00ff00",
        backgroundColor: "rgba(0, 255, 0, 0.05)",
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: "#00ff00",
        pointHoverBorderColor: "#00ff00",
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
          title: (items) => `${xLabel} = ${items[0].label}`,
          label: (item) => {
            const value = item.parsed.y;
            return `${yLabel}: ${value ? value.toFixed(6) : '0.000000'}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: xLabel,
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
          text: yLabel,
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

