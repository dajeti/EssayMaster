// src/components/Feedback/utils/generateFeedback.ts
"use client";

import type { GPTResponse } from "../types";

/**
 * Calls the /api/query endpoint with either a markscheme prompt or a normal prompt.
 */
export async function generateFeedback(
  essay: string,
  markSchemeUrl: string
): Promise<GPTResponse> {
  if (!essay.trim()) {
    throw new Error("No essay text found!");
  }

  // A more advanced prompt if Mark Scheme is present
  const advancedMarkSchemePrompt = `
    You are an essay feedback assistant. The user wrote this essay:
    """${essay}"""

    A Mark Scheme PDF is available. Provide:
    1) An overall numeric "score" (0-100).
    2) A "criteria" object with sub-scores out of 10 for: grammar, clarity, structure, analysis, markscheme.
    3) A "criteriaReasons" object explaining each sub-score, referencing band descriptors and how to improve.
    4) Provide 5 suggestions, each with:
       - "id"
       - "snippet": EXACT text from the essay
       - "advice": mention how to reach a higher band from the MarkScheme
    Return valid JSON only.
  `;

  // Simple prompt if no Mark Scheme is uploaded
  const noMarkSchemePrompt = `
    You are an essay feedback assistant. The user wrote this essay:
    """${essay}"""

    Provide an overall "score" (0-100).

    Provide a "criteria" object with sub-scores (0-10) for grammar, clarity, structure, analysis.
    Provide "criteriaReasons" for each sub-score (1-2 sentences).
    Provide 3-5 suggestions in an array, each with "id", "snippet", and "advice".
    Return valid JSON only.
  `;

  const chosenPrompt = markSchemeUrl ? advancedMarkSchemePrompt : noMarkSchemePrompt;

  const resp = await fetch("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: chosenPrompt }),
  });

  if (!resp.ok) {
    const errMsg = await resp.text();
    console.error("Feedback error detail:", errMsg);
    throw new Error("Feedback request failed with " + resp.status);
  }

  const data = await resp.json();
  let parsed: GPTResponse;
  try {
    parsed = JSON.parse(data.response);
  } catch (err) {
    console.error("GPT did not return valid JSON:", data.response);
    throw new Error("GPT did not return valid JSON");
  }

  return parsed;
}
