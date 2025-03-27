"use client";

import React, { useState, useEffect, useRef } from "react";

interface FeedbackSuggestion {
  id: string;
  snippet: string;
  advice: string;
  resolved: boolean;
}

interface FeedbackTabProps {
  essay: string;
  sessionId: string;
}

export default function FeedbackTab({ essay, sessionId }: FeedbackTabProps) {
  // -------------------------
  // FEEDBACK tab states
  // -------------------------
  const [score, setScore] = useState("N/A");
  const [suggestions, setSuggestions] = useState<FeedbackSuggestion[]>([]);
  const [highlightedEssay, setHighlightedEssay] = useState(essay);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  // Markscheme logic
  const [markSchemeUrl, setMarkSchemeUrl] = useState("");
  const [isMarkUploadLoading, setIsMarkUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // On mount or whenever the tab loads, fetch existing Markscheme for this session
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

  // Handle Markscheme upload
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only accept PDF
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    setIsMarkUploadLoading(true);
    try {
      // 1) Upload the file (to your cloud or server)
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

      // 2) Save the link in your own backend
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

  // If user edits the essay in the left area, discard old suggestions & reset highlights
  useEffect(() => {
    setHighlightedEssay(essay);
    setSuggestions([]);
  }, [essay]);

  async function handleGenerateFeedback() {
    if (!essay.trim()) {
      alert("No essay text found! Please paste or upload something.");
      return;
    }
    setIsFeedbackLoading(true);

    try {
      // Example system prompt for GPT
      const feedbackPrompt = `
        You are an essay feedback assistant.
        The user wrote this essay:
        """${essay}"""
        Provide a numeric "score" out of 100.
        Then provide an array of "suggestions," each with:
           - "id" (unique string)
           - "snippet" (literal text to highlight from the essay)
           - "advice" (one or two sentences of feedback)
        Return valid JSON only.
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

      let parsed;
      try {
        parsed = JSON.parse(data.response);
      } catch (e) {
        console.error("GPT did not return valid JSON:", data.response);
        alert("GPT did not return valid JSON. Check console logs.");
        setIsFeedbackLoading(false);
        return;
      }

      setScore(parsed.score || "N/A");

      const sugs: FeedbackSuggestion[] = parsed.suggestions || [];
      // Mark them all "unresolved"
      sugs.forEach((sug) => (sug.resolved = false));
      setSuggestions(sugs);

      // highlight them in a read-only version
      highlightSnippets(sugs);
    } catch (err: any) {
      console.error("Error generating feedback:", err);
      alert("Error generating feedback: " + err.message);
    } finally {
      setIsFeedbackLoading(false);
    }
  }

  // Highlight snippet logic
  function highlightSnippets(sugList: FeedbackSuggestion[], hoveringId?: string) {
    let newText = essay;

    // Filter out resolved
    const active = sugList.filter((sug) => !sug.resolved);

    // Replace bigger matches first
    active.sort((a, b) => b.snippet.length - a.snippet.length);

    for (const sug of active) {
      const snippetRegex = new RegExp(sug.snippet, "i");
      const colorClass = hoveringId === sug.id ? "bg-yellow-300" : "bg-yellow-100";

      // naive approach: replace first occurrence
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

  return (
    <div className="flex-1 overflow-auto p-3 border rounded bg-white">
      {/* Spinners */}
      {(isFeedbackLoading || isMarkUploadLoading) && (
        <div className="text-center text-blue-600 mb-2">Processing...</div>
      )}

      <h2 className="font-bold text-lg mb-4">Generate Feedback</h2>

      {/* Markscheme Upload Section */}
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

      {/* Button to trigger GPT feedback */}
      <button
        onClick={handleGenerateFeedback}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        Generate Feedback
      </button>

      <p className="mt-3">
        <strong>Score:</strong> {score}
      </p>

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
