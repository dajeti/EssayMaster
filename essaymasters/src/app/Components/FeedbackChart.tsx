"use client";
// do this guys npm install chart.js react-chartjs-2

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
import React from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CriteriaScores {
  grammar: number;
  clarity: number;
  structure: number;
  analysis: number;
  markscheme?: number | null; 
  // If markscheme is not present, we can store null or skip it
}

interface FeedbackChartProps {
  criteria: CriteriaScores;
}

export default function FeedbackChart({ criteria }: FeedbackChartProps) {
  // Build arrays of labels & data dynamically, skipping markscheme if null
  const labels: string[] = [];
  const scores: number[] = [];

  // Add each category if it has a numeric value
  labels.push("Grammar");
  scores.push(criteria.grammar);
  labels.push("Clarity");
  scores.push(criteria.clarity);
  labels.push("Structure");
  scores.push(criteria.structure);
  labels.push("Analysis");
  scores.push(criteria.analysis);

  // If markscheme is provided and not null
  if (criteria.markscheme != null) {
    labels.push("Markscheme");
    scores.push(criteria.markscheme);
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Sub-Scores (out of 10)",
        data: scores,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  };

  return (
    <div className="max-w-md mt-4">
      <Bar data={data} options={options} />
    </div>
  );
}
