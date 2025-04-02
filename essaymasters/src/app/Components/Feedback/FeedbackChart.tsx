"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ThemeProvider } from "next-themes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CriteriaScores {
  SPAG: number;
  clarity: number;
  structure: number;
  analysis: number;
  markscheme?: number | null;
}

interface FeedbackChartProps {
  criteria: CriteriaScores;
}

export default function FeedbackChart({ criteria }: FeedbackChartProps) {
  // Dynamically build out the labels and data for whichever sub-scores exist
  const labels: string[] = [];
  const scores: number[] = [];

  labels.push("SPAG");
  scores.push(criteria.SPAG || 0);
  labels.push("Clarity");
  scores.push(criteria.clarity);
  labels.push("Structure");
  scores.push(criteria.structure);
  if (criteria.markscheme !== null && criteria.markscheme !== undefined) {
  } else {
    labels.push("Analysis");
    scores.push(criteria.analysis);
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Score (out of 10)",
        data: scores,
        backgroundColor: [
          "#FF6384", // SPAG
          "#36A2EB", // clarity
          "#FFCE56", // structure
          "#4BC0C0", // analysis
          "#9966FF", // markscheme
        ].slice(0, scores.length),
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as boolean,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        max: 10,
        grid: { color: "#e5e7eb" },
        ticks: { stepSize: 2 },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280" },
      },
    },
  };

  return (
    <ThemeProvider attribute="class">
      <div className="h-64 mt-4">
        <Bar data={data} options={options} />
      </div>
    </ThemeProvider>
  );
}
