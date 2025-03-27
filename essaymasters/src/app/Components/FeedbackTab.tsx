"use client";

import React, { useState, useEffect, useRef } from "react";
import FeedbackChart from "./FeedbackChart"; 

interface FeedbackSuggestion {
  id: string;
  snippet: string;
  advice: string;
  resolved: boolean;
}

interface CriteriaScores {
  grammar: number;
  clarity: number;
  structure: number;
  analysis: number;
  markscheme?: number | null; 
}

// For TS, define the shape of GPT's JSON
interface GPTResponse {
  score: number | string;
  criteria?: {
    grammar: number;
    clarity: number;
    structure: number;
    analysis: number;
    markscheme?: number; // optional 
  };
  suggestions?: FeedbackSuggestion[];
}

interface FeedbackTabProps {
  essay: string;
  sessionId: string;
}

export default function FeedbackTab({ essay, sessionId }: FeedbackTabProps) {
  // -------------------------
  // FEEDBACK tab states
  // -------------------------
  const [score, setScore] = useState<string | number>("N/A");
  const [criteria, setCriteria] = useState<CriteriaScores | null>(null);
  const [suggestions, setSuggestions] = useState<FeedbackSuggestion[]>([]);
  const [highlightedEssay, setHighlightedEssay] = useState(essay);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  // Markscheme logic
  const [markSchemeUrl, setMarkSchemeUrl] = useState("");
  const [isMarkUploadLoading, setIsMarkUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // On mount, fetch existing Markscheme
  useEffect(() => {
    fetchMarkScheme();
  }, []);

  async function fetchMarkScheme() {
    try {
      setIsMarkUploadLoading(true);
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

  // Markscheme PDF upload
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    setIsMarkUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        throw new Error("File upload failed");
      }

      const uploadData = await uploadRes.json();

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

  // If user edits essay in left area, discard old suggestions & highlight
  useEffect(() => {
    setHighlightedEssay(essay);
    setSuggestions([]);
  }, [essay]);

  // --------------- GPT FEEDBACK ---------------
  async function handleGenerateFeedback() {
    if (!essay.trim()) {
      alert("No essay text found! Please paste or upload something.");
      return;
    }
    setIsFeedbackLoading(true);

    try {
      // Build a GPT prompt that references the markscheme if available
      let markschemeClause = "";
      if (markSchemeUrl) {
        markschemeClause = `
The user also has a markscheme (PDF) that sets expectations for the essay. 
Please provide a "markscheme" sub-score out of 10 reflecting how well the essay aligns with that PDF. 
(If the PDF is not directly visible, infer alignment from the typical structure & guidelines you'd expect in a markscheme.)
        `;
      }

      const feedbackPrompt = `
You are an essay feedback assistant. The user wrote this essay:
"""${essay}"""

Provide an overall numeric "score" out of 100.

Also provide a "criteria" object with sub-scores out of 10 for:
  - grammar
  - clarity
  - structure
  - analysis
${markschemeClause}

Then provide an array of "suggestions," each with:
  - "id" (unique string)
  - "snippet" (literal text from the essay)
  - "advice" (one or two sentences of feedback)

Return valid JSON only, e.g.:
{
  "score": 85,
  "criteria": {
    "grammar": 8,
    "clarity": 7,
    "structure": 9,
    "analysis": 8,
    "markscheme": 7
  },
  "suggestions": [
    ...
  ]
}
      `;

      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: feedbackPrompt,
          inputText: "Generate feedback in strict JSON, no extra text.",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Feedback error detail:", errText);
        throw new Error("Feedback request failed with " + response.status);
      }

      const data = await response.json();

      let parsed: GPTResponse;
      try {
        parsed = JSON.parse(data.response);
      } catch (e) {
        console.error("GPT did not return valid JSON:", data.response);
        alert("GPT did not return valid JSON. Check console logs.");
        setIsFeedbackLoading(false);
        return;
      }

      // overall numeric score
      setScore(parsed.score ?? "N/A");

      // sub-scores
      // We must handle the case where GPT might not give everything
      if (parsed.criteria) {
        const c: CriteriaScores = {
          grammar: parsed.criteria.grammar ?? 0,
          clarity: parsed.criteria.clarity ?? 0,
          structure: parsed.criteria.structure ?? 0,
          analysis: parsed.criteria.analysis ?? 0,
          markscheme: parsed.criteria.markscheme ?? null,
        };
        setCriteria(c);
      } else {
        setCriteria(null);
      }

      // suggestions
      const sugs = parsed.suggestions || [];
      sugs.forEach((sug) => (sug.resolved = false));
      setSuggestions(sugs);

      highlightSnippets(sugs);
    } catch (err: any) {
      console.error("Error generating feedback:", err);
      alert("Error generating feedback: " + err.message);
    } finally {
      setIsFeedbackLoading(false);
    }
  }

  // --------------- HIGHLIGHTING ---------------
  function highlightSnippets(sugList: FeedbackSuggestion[], hoveringId?: string) {
    let newText = essay;

    const active = sugList.filter((sug) => !sug.resolved);
    active.sort((a, b) => b.snippet.length - a.snippet.length);

    for (const sug of active) {
      const snippetRegex = new RegExp(sug.snippet, "i");
      const colorClass = hoveringId === sug.id ? "bg-yellow-300" : "bg-yellow-100";

      newText = newText.replace(
        snippetRegex,
        `<mark class="${colorClass}">${sug.snippet}</mark>`
      );
    }
    setHighlightedEssay(newText);
  }

  function handleSuggestionHover(sugId?: string) {
    highlightSnippets(suggestions, sugId);
  }

  function handleMarkResolved(sugId: string) {
    const updated = suggestions.map((sug) =>
      sug.id === sugId ? { ...sug, resolved: true } : sug
    );
    setSuggestions(updated);
    highlightSnippets(updated);
  }

  // --------------- RENDER ---------------
  return (
    <div className="flex-1 overflow-auto p-3 border rounded bg-white">
      {(isFeedbackLoading || isMarkUploadLoading) && (
        <div className="text-center text-blue-600 mb-2">Processing...</div>
      )}

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

      <button
        onClick={handleGenerateFeedback}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        Generate Feedback
      </button>

      <p className="mt-3">
        <strong>Overall Score:</strong> {score}
      </p>

      {/* Sub-score chart (if we have criteria) */}
      {criteria && (
        <>
          <p className="mt-2 text-sm text-gray-600">
            Sub-Scores (out of 10):
          </p>
          <FeedbackChart criteria={criteria} />
        </>
      )}

      {/* The read‐only essay with highlights */}
      <div className="mt-4 border p-2 bg-gray-50 rounded">
        <h3 className="font-semibold mb-1">Essay (with highlights)</h3>
        <div
          dangerouslySetInnerHTML={{ __html: highlightedEssay }}
          className="text-sm leading-relaxed"
        />
      </div>

      {/* The suggestions list */}
      <div className="mt-4">
        {suggestions.map((sug) => (
          <div
            key={sug.id}
            className={`p-2 border rounded mb-2 transition-colors ${
              sug.resolved
                ? "bg-gray-200 text-gray-500"
                : "bg-white hover:bg-gray-100"
            }`}
            onMouseEnter={() => handleSuggestionHover(sug.id)}
            onMouseLeave={() => handleSuggestionHover(undefined)}
          >
            <strong>Suggestion:</strong> {sug.advice}
            {!sug.resolved && (
              <button
                className="ml-3 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                onClick={() => handleMarkResolved(sug.id)}
              >
                Mark Resolved
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
