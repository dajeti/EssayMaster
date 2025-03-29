"use client";

import React, { useState, useEffect, useRef } from "react";
import FeedbackChart from "./FeedbackChart";
import { ThemeProvider } from "next-themes";


interface FeedbackSuggestion {
  id: string;
  snippet: string;
  advice: string;
  resolved: boolean;
}

// For sub-scores
interface CriteriaScores {
  grammar: number;
  clarity: number;
  structure: number;
  analysis: number;
  markscheme?: number | null; 
}

// Explanations for each sub-score
interface CriteriaReasons {
  grammar?: string;
  clarity?: string;
  structure?: string;
  analysis?: string;
  markscheme?: string;
}

// The shape of GPT's returned JSON
interface GPTResponse {
  score: number | string;
  criteria?: {
    grammar?: number;
    clarity?: number;
    structure?: number;
    analysis?: number;
    markscheme?: number;
  };
  criteriaReasons?: {
    grammar?: string;
    clarity?: string;
    structure?: string;
    analysis?: string;
    markscheme?: string;
  };
  suggestions?: FeedbackSuggestion[];
}

interface FeedbackTabProps {
  sessionId: string;
  essay: string; // raw text
  suggestions: FeedbackSuggestion[];
  onNewSuggestions: (newSuggestions: FeedbackSuggestion[]) => void;
  onToggleResolved: (sugId: string) => void;
  onHoverSuggestion: (sugId?: string) => void;
  setParentLoading: (val: boolean) => void;
}

export default function FeedbackTab({
  sessionId,
  essay,
  suggestions,
  onNewSuggestions,
  onToggleResolved,
  onHoverSuggestion,
  setParentLoading,
}: FeedbackTabProps) {
  const [score, setScore] = useState<string | number>("N/A");
  const [criteria, setCriteria] = useState<CriteriaScores | null>(null);
  const [criteriaReasons, setCriteriaReasons] = useState<CriteriaReasons | null>(null);

  // Markscheme management
  const [markSchemeUrl, setMarkSchemeUrl] = useState("");
  const [isMarkUploadLoading, setIsMarkUploadLoading] = useState(false);
  // GPT request loading
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------
  // 1) Check for existing markscheme (optional)
  // -------------------------
  useEffect(() => {
    fetchMarkScheme();
  }, []);

  async function fetchMarkScheme() {
    setIsMarkUploadLoading(true);
    try {
      const res = await fetch(`/api/marks/${sessionId}`);
      if (!res.ok) {
        console.error("Failed to fetch markscheme:", await res.text());
        return;
      }
      const data = await res.json();
      if (data.markScheme?.fileUrl) {
        setMarkSchemeUrl(data.markScheme.fileUrl);
      }
    } catch (err) {
      console.error("Error fetching markscheme:", err);
    } finally {
      setIsMarkUploadLoading(false);
    }
  }

  // -------------------------
  // 2) PDF upload for Mark Scheme
  // -------------------------
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF for the markscheme");
      return;
    }

    setIsMarkUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        throw new Error("File upload failed");
      }
      const uploadData = await uploadRes.json();

      // Store the PDF URL in your DB or session:
      const saveRes = await fetch(`/api/marks/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: uploadData.url }),
      });
      if (!saveRes.ok) {
        throw new Error("Failed to store markscheme reference in DB");
      }

      setMarkSchemeUrl(uploadData.url);
      alert("Mark scheme uploaded successfully!");
    } catch (error) {
      console.error("Error uploading mark scheme:", error);
      alert("Failed to upload mark scheme");
    } finally {
      setIsMarkUploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // -------------------------
  // 3) Generate Feedback Button
  // -------------------------
  async function handleGenerateFeedback() {
    if (!essay.trim()) {
      alert("No essay text found!");
      return;
    }

    setIsFeedbackLoading(true);
    setParentLoading(true);

    try {
      // Build prompt differently if markscheme exists
      // simplified example with more direct instructions:
      const promptWithoutMarkScheme = `
        You are an essay feedback assistant. The user wrote this essay:
        """${essay}"""

        Please return JSON with:
        {
          "score": number (0-100),
          "criteria": {
            "grammar": number (0-10),
            "clarity": number (0-10),
            "structure": number (0-10),
            "analysis": number (0-10)
          },
          "criteriaReasons": {
            "grammar": string,
            "clarity": string,
            "structure": string,
            "analysis": string
          },
          "suggestions": [
            {
              "id": "some-unique-id",
              "snippet": "EXACT text from the essay (1-2 sentences) that truly appears verbatim in the essay",
              "advice": "One or two sentences of feedback"
            }
          ]
        }

        IMPORTANT:
        - Provide 3 to 5 suggestions.
        - Each snippet must be exactly as it appears in the essay. If you can't find a relevant snippet, choose a smaller portion from the essay text. 
        - Return valid JSON with no extra text or commentary.
      `;


      const promptWithMarkScheme = `
        You are an essay feedback assistant. The user wrote this essay:
        """${essay}"""

        They also have a Mark Scheme (PDF). Provide an overall numeric "score" out of 100.

        Also provide a "criteria" object with sub-scores out of 10 for:
          - grammar
          - clarity
          - structure
          - analysis
          - markscheme

        Then provide a "criteriaReasons" object that explains each sub-score with a short sentence or two.

        Then provide an array of "suggestions," each with:
          - "id"
          - "snippet"
          - "advice"

        Only mention "markscheme" if it logically applies. Return valid JSON only.
      `;

      // Choose which prompt to use
      const chosenPrompt = markSchemeUrl ? promptWithMarkScheme : promptWithoutMarkScheme;

      // Send to GPT backend
      const resp = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: chosenPrompt,
          // This "inputText" might be used by /api/query route
          inputText: "Generate feedback in strict JSON, no extra text.",
        }),
      });

      if (!resp.ok) {
        const e = await resp.text();
        console.error("Feedback error detail:", e);
        throw new Error("Feedback request failed with " + resp.status);
      }

      const data = await resp.json();
      let parsed: GPTResponse;
      try {
        parsed = JSON.parse(data.response);
      } catch (err) {
        console.error("GPT did not return valid JSON:", data.response);
        alert("GPT did not return valid JSON");
        return;
      }

      // 4) Update local states
      setScore(parsed.score ?? "N/A");

      // If GPT included a "criteria" object, map it into local state
      if (parsed.criteria) {
        setCriteria({
          grammar: parsed.criteria.grammar ?? 0,
          clarity: parsed.criteria.clarity ?? 0,
          structure: parsed.criteria.structure ?? 0,
          analysis: parsed.criteria.analysis ?? 0,
          // only store markscheme if GPT gave it (and if we have a PDF)
          markscheme: markSchemeUrl ? (parsed.criteria.markscheme ?? null) : undefined
        });
      } else {
        setCriteria(null);
      }

      // If GPT included reasons
      if (parsed.criteriaReasons) {
        setCriteriaReasons(parsed.criteriaReasons);
      } else {
        setCriteriaReasons(null);
      }

      // 5) Suggestions
      const sugs = parsed.suggestions || [];
      sugs.forEach((sug) => (sug.resolved = false));
      onNewSuggestions(sugs);

      // 6) (Optional) Save the feedback to DB or localStorage
      // For example, store it to backend route:
      // await fetch(`/api/scores/${sessionId}`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ score: parsed.score, criteria: parsed.criteria }),
      // });
      //
      // or store in localStorage:
      // localStorage.setItem(`feedback-${sessionId}`, JSON.stringify({
      //   score: parsed.score,
      //   criteria: parsed.criteria,
      //   reasons: parsed.criteriaReasons
      // }));
    } catch (err: any) {
      console.error("Error generating feedback:", err);
      alert("Error: " + err.message);
    } finally {
      setIsFeedbackLoading(false);
      setParentLoading(false);
    }
  }

  // -------------------------
  // Render
  // -------------------------
  return (
    <ThemeProvider attribute="class">

    <div className="flex-1 overflow-auto p-3 border rounded bg-white dark:bg-blue-custom-dark relative">
      <h2 className="font-bold text-lg mb-3">Generate Feedback</h2>

      {/* Markscheme Upload */}
      <div className="mb-4">
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded"
          disabled={isFeedbackLoading || isMarkUploadLoading}
        >
          {markSchemeUrl ? "Change Mark Scheme" : "Upload Mark Scheme"}
        </button>
        {markSchemeUrl && (
          <a
            href={markSchemeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 text-blue-600 hover:underline"
          >
            View Mark Scheme
          </a>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateFeedback}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        disabled={isFeedbackLoading || isMarkUploadLoading}
      >
        Generate Feedback
      </button>

      {isFeedbackLoading && (
        <p className="mt-2 text-blue-500 text-sm">Generating feedback...</p>
      )}

      {/* Show overall score */}
      <p className="mt-3">
        <strong>Overall Score:</strong> {score}
      </p>

      {/* Sub-score chart */}
      {criteria && (
        <>
          <p className="mt-2 text-sm text-gray-600">Sub-Scores (out of 10):</p>
          <FeedbackChart criteria={criteria} />

          {/* If you want to display the explanations for each sub-score */}
          {criteriaReasons && (
            <div className="mt-2 border rounded p-2 bg-gray-50 dark:bg-darker-custom text-sm">
              <p className="font-semibold">Score Explanations:</p>
              {Object.entries(criteriaReasons).map(([key, val]) => (
                <p key={key}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                  {val}
                </p>
              ))}
            </div>
          )}
        </>
      )}

      {/* Suggestions list */}
      <div className="mt-4">
        {suggestions.map((sug) => (
          <div
            key={sug.id}
            className={`p-2 border rounded mb-2 transition-colors ${
              sug.resolved ? "bg-gray-200 dark:bg-gray-700" : "bg-white dark:bg-darker-custom hover:bg-gray-50"
            }`}
            onMouseEnter={() => onHoverSuggestion(sug.id)}
            onMouseLeave={() => onHoverSuggestion()}
          >
            <strong>Suggestion:</strong> {sug.advice}
            <button
              className="ml-3 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              onClick={() => onToggleResolved(sug.id)}
            >
              {sug.resolved ? "Unresolve" : "Mark Resolved"}
            </button>
            {sug.snippet && (
              <div className="mt-1 text-sm text-gray-600">
                <em>Snippet:</em> {sug.snippet}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </ThemeProvider>
  );
}
