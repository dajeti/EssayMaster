import React, { useState, useEffect, useRef } from "react";
import FeedbackChart from "./Feedback/FeedbackChart";
import { ThemeProvider } from "next-themes";

interface FeedbackSuggestion {
  id: string;
  snippet: string;
  advice: string;
  resolved: boolean;
  markSchemeReference?: string;
}

// For sub-scores
interface CriteriaScores {
  SPAG?: number;
  clarity?: number;
  structure?: number;
  analysis?: number;
  markscheme?: number | null;
}

// Explanations for each sub-score
interface CriteriaReasons {
  SPAG?: string;
  clarity?: string;
  structure?: string;
  analysis?: string;
  markscheme?: string;
}

// The shape of GPT's returned JSON
interface GPTResponse {
  score: number | string;
  totalPossibleScore?: number;
  criteria?: {
    SPAG?: number;
    clarity?: number;
    structure?: number;
    analysis?: number;
    markscheme?: number;
  };
  criteriaReasons?: {
    SPAG?: string;
    clarity?: string;
    structure?: string;
    analysis?: string;
    markscheme?: string;
  };
  suggestions?: FeedbackSuggestion[];
}

// Complete feedback data structure to store in database
interface CompleteFeedbackData {
  score: string | number;
  totalPossibleScore: string | number | null;
  criteria: CriteriaScores | null;
  criteriaReasons: CriteriaReasons | null;
  suggestions: FeedbackSuggestion[];
  isUsingMarkScheme: boolean; // Add this flag to track session type
  sessionId: string; // Add sessionId for validation
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
  const [totalPossibleScore, setTotalPossibleScore] = useState<
    string | number | null
  >(null);
  const [criteria, setCriteria] = useState<CriteriaScores | null>(null);
  const [criteriaReasons, setCriteriaReasons] =
    useState<CriteriaReasons | null>(null);

  // Markscheme management
  const [markSchemeUrl, setMarkSchemeUrl] = useState("");
  const [markSchemeContent, setMarkSchemeContent] = useState("");
  const [isMarkUploadLoading, setIsMarkUploadLoading] = useState(false);
  const [isRemovingMarkScheme, setIsRemovingMarkScheme] = useState(false);
  // GPT request loading
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  // New state to track if feedback data is loading
  const [isFeedbackDataLoading, setIsFeedbackDataLoading] = useState(false);
  // Track if we're using a markscheme for UI display
  const [isUsingMarkScheme, setIsUsingMarkScheme] = useState(false);
  // Track if state has been modified since last save
  const [isStateModified, setIsStateModified] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------
  // Save feedback data whenever relevant states change
  // -------------------------
  useEffect(() => {
    // Only trigger if data has been modified and we have a valid sessionId
    if (isStateModified && sessionId) {
      const saveTimeout = setTimeout(() => {
        saveFeedbackData();
        setIsStateModified(false);
      }, 500); // Debounce saves to prevent excessive API calls
      
      return () => clearTimeout(saveTimeout);
    }
  }, [isStateModified, sessionId, score, totalPossibleScore, criteria, criteriaReasons, suggestions, isUsingMarkScheme]);

  // Function to mark state as modified
  const markStateModified = () => {
    setIsStateModified(true);
  };

  // -------------------------
  // Load saved feedback data on mount or when sessionId changes
  // -------------------------
  useEffect(() => {
    // Reset states when sessionId changes
    resetStates();
    // Then load feedback data for the new session
    if (sessionId) {
      loadFeedbackData();
      fetchMarkScheme();
    }
  }, [sessionId]);

  // Function to reset all states
  function resetStates() {
    setScore("N/A");
    setTotalPossibleScore(null);
    setCriteria(null);
    setCriteriaReasons(null);
    setMarkSchemeUrl("");
    setMarkSchemeContent("");
    setIsUsingMarkScheme(false);
    onNewSuggestions([]);
    setIsStateModified(false);
  }

  async function loadFeedbackData() {
    if (!sessionId) return;

    setIsFeedbackDataLoading(true);
    try {
      const res = await fetch(`/api/feedback/${sessionId}`);
      if (!res.ok) {
        console.error("Failed to fetch feedback data:", await res.text());
        return;
      }

      const data = await res.json();
      if (data.feedback) {
        try {
          const parsedFeedback: CompleteFeedbackData = JSON.parse(
            data.feedback
          );

          // Validate that this feedback belongs to the current session
          if (parsedFeedback.sessionId && parsedFeedback.sessionId !== sessionId) {
            console.warn("Loaded feedback data doesn't match current session, skipping");
            return;
          }

          // Restore all feedback state
          setScore(parsedFeedback.score || "N/A");
          setTotalPossibleScore(parsedFeedback.totalPossibleScore || null);
          setCriteria(parsedFeedback.criteria || null);
          setCriteriaReasons(parsedFeedback.criteriaReasons || null);

          // Set markscheme usage flag consistently with stored data
          setIsUsingMarkScheme(parsedFeedback.isUsingMarkScheme || false);

          // Only update suggestions if they exist and the array is not empty
          if (
            parsedFeedback.suggestions &&
            parsedFeedback.suggestions.length > 0
          ) {
            onNewSuggestions(parsedFeedback.suggestions);
          }
        } catch (err) {
          console.error("Error parsing feedback data:", err);
        }
      }
    } catch (err) {
      console.error("Error loading feedback data:", err);
    } finally {
      setIsFeedbackDataLoading(false);
    }
  }

  // -------------------------
  // Save complete feedback data to database
  // -------------------------
  async function saveFeedbackData() {
    if (!sessionId) return;

    try {
      // Compile all feedback data
      const completeData: CompleteFeedbackData = {
        score,
        totalPossibleScore,
        criteria,
        criteriaReasons,
        suggestions,
        isUsingMarkScheme, // Include the flag to track session type
        sessionId, // Include sessionId for validation on load
      };

      const res = await fetch(`/api/feedback/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: JSON.stringify(completeData) }),
      });

      if (!res.ok) {
        console.error("Failed to save feedback data:", await res.text());
      }
    } catch (err) {
      console.error("Error saving feedback data:", err);
    }
  }

  // -------------------------
  // Modified onToggleResolved to mark state as modified
  // -------------------------
  const handleToggleResolved = (sugId: string) => {
    onToggleResolved(sugId);
    markStateModified();
  };

  // -------------------------
  // Check for existing markscheme
  // -------------------------
  async function fetchMarkScheme() {
    if (!sessionId) return;
    
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
        setIsUsingMarkScheme(true);
        markStateModified();

        // Fetch and read the mark scheme content
        if (data.markScheme.fileUrl) {
          await fetchMarkSchemeContent(data.markScheme.fileUrl);
        }
      }
    } catch (err) {
      console.error("Error fetching markscheme:", err);
    } finally {
      setIsMarkUploadLoading(false);
    }
  }

  // Function to fetch and extract text from PDF mark scheme
  async function fetchMarkSchemeContent(url: string) {
    try {
      // Fetch the PDF file as an ArrayBuffer
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      // Use the same PDF.js library that's already imported in EssayForm
      const pdfjsLib = window.pdfjsLib;
      if (!pdfjsLib) {
        console.error("PDF.js library not found");
        return;
      }

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extractedText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        extractedText +=
          textContent.items.map((item: any) => item.str).join(" ") + "\n\n";
      }

      setMarkSchemeContent(extractedText.trim());
      markStateModified();
    } catch (error) {
      console.error("Error reading mark scheme PDF:", error);
    }
  }

  // -------------------------
  // PDF upload for Mark Scheme
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

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
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
      setIsUsingMarkScheme(true);
      markStateModified();

      // Read the content of the file
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const typedArray = new Uint8Array(evt.target?.result as ArrayBuffer);
          const pdfjsLib = window.pdfjsLib;
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let extractedText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            extractedText +=
              textContent.items.map((item: any) => item.str).join(" ") + "\n\n";
          }

          setMarkSchemeContent(extractedText.trim());
          markStateModified();
        } catch (parseErr) {
          console.error("Error reading PDF text:", parseErr);
        }
      };
      reader.readAsArrayBuffer(file);

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
  // Remove Mark Scheme
  // -------------------------
  async function handleRemoveMarkScheme() {
    if (!markSchemeUrl) return;

    setIsRemovingMarkScheme(true);
    try {
      const removeRes = await fetch(`/api/marks/${sessionId}`, {
        method: "DELETE",
      });

      if (!removeRes.ok) {
        const errorText = await removeRes.text();
        console.error("Remove mark scheme error response:", errorText);
        throw new Error(`Failed to remove mark scheme: ${errorText}`);
      }

      setMarkSchemeUrl("");
      setMarkSchemeContent("");
      setIsUsingMarkScheme(false);
      markStateModified();
      alert("Mark scheme removed successfully!");
    } catch (error: any) {
      console.error("Error removing mark scheme:", error);
      alert(`Failed to remove mark scheme: ${error.message}`);
    } finally {
      setIsRemovingMarkScheme(false);
    }
  }

  // -------------------------
  // Generate Feedback Button
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
      let chosenPrompt;

      if (markSchemeUrl && markSchemeContent) {
        // Improved prompt with explicit mark scheme content and focus on SPAG + markscheme
        chosenPrompt = `
          You are an expert essay assessor. The user wrote this essay:
          """${essay}"""

          You need to assess it according to this MARK SCHEME:
          """${markSchemeContent}"""

          IMPORTANT INSTRUCTIONS:
          1. Carefully read both the essay and mark scheme
          2. Your primary job is to assess how well the essay meets the criteria in the mark scheme
          3. Use the specific grading bands, levels, or criteria from the mark scheme to determine the appropriate score
          4. Clearly indicate the total possible score from the mark scheme (e.g., if scoring 28, include that it's out of 30 or 40, etc.)
          5. When a mark scheme is present, focus primarily on those criteria plus basic SPAG assessment
          6. Your score should accurately reflect the mark scheme bands/criteria - a high score like 27/30 should reflect excellent work per the markscheme

          Please return a JSON object with:
          {
            "score": [appropriate score based on mark scheme scale],
            "totalPossibleScore": [total possible score from the mark scheme],
            "criteria": {
              "SPAG": [0-10], // if there is no major mistakes just give a 8 at least
              "markscheme": [0-10] 
            },
            "criteriaReasons": {
              "SPAG": [SPAG assessment - spelling, punctuation, grammar],
              "markscheme": [detailed explanation referencing specific mark scheme criteria]
            },
            "suggestions": [
              {
                "id": [unique ID],
                "snippet": [exact text from essay that needs improvement],
                "advice": [specific advice referencing mark scheme requirements],
                "markSchemeReference": [specific section of mark scheme this relates to]
              }
            ]
          }

          Include 3-5 specific suggestions, where at least 2 MUST explicitly reference the mark scheme criteria.
          Each snippet MUST be exactly as it appears in the essay.
          Return ONLY valid JSON without additional text.
        `;
      } else {
        // Default prompt when no mark scheme exists
        chosenPrompt = `
          You are an essay feedback assistant. The user wrote this essay:
          """${essay}"""

          Please return JSON with:
          {
            "score": number (0-100),
            "totalPossibleScore": 100,
            "criteria": {
              "SPAG": number (0-10),  // [SPAG assessment - spelling, punctuation, grammar]
              "clarity": number (0-10),
              "structure": number (0-10),
              "analysis": number (0-10)
            },
            "criteriaReasons": {
              "SPAG": string,
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
      }

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
      setTotalPossibleScore(parsed.totalPossibleScore ?? null);

      // If GPT included a "criteria" object, map it into local state with consideration for markscheme
      if (parsed.criteria) {
        if (markSchemeUrl) {
          setCriteria({
            SPAG: parsed.criteria.SPAG ?? 0,
            markscheme: parsed.criteria.markscheme ?? 0,
          });
          setIsUsingMarkScheme(true);
        } else {
          // Default behavior when no markscheme
          setCriteria({
            SPAG: parsed.criteria.SPAG ?? 0,
            clarity: parsed.criteria.clarity ?? 0,
            structure: parsed.criteria.structure ?? 0,
            analysis: parsed.criteria.analysis ?? 0,
          });
          setIsUsingMarkScheme(false);
        }
      } else {
        setCriteria(null);
      }

      // If GPT included reasons
      if (parsed.criteriaReasons) {
        if (markSchemeUrl) {
          setCriteriaReasons({
            SPAG: parsed.criteriaReasons.SPAG,
            markscheme: parsed.criteriaReasons.markscheme,
          });
        } else {
          // Default behavior
          setCriteriaReasons(parsed.criteriaReasons);
        }
      } else {
        setCriteriaReasons(null);
      }

      // 5) Suggestions
      const sugs = parsed.suggestions || [];
      sugs.forEach((sug) => (sug.resolved = false));
      onNewSuggestions(sugs);
      
      // Mark state as modified
      markStateModified();
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
        {isFeedbackDataLoading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center z-10">
            <p className="text-blue-600 dark:text-blue-400">
              Loading feedback data...
            </p>
          </div>
        )}

        <h2 className="font-bold text-lg mb-3">Generate Feedback</h2>

        {/* Markscheme Upload and Management */}
        <div className="mb-4 flex items-center flex-wrap gap-2">
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
            disabled={isFeedbackLoading || isMarkUploadLoading}
          >
            {markSchemeUrl ? "Change Mark Scheme" : "Upload Mark Scheme"}
          </button>

          {markSchemeUrl && (
            <>
              <a
                href={markSchemeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Mark Scheme
              </a>

              <button
                onClick={handleRemoveMarkScheme}
                className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 ml-2"
                disabled={isFeedbackLoading || isRemovingMarkScheme}
              >
                {isRemovingMarkScheme ? "Removing..." : "Remove Mark Scheme"}
              </button>
            </>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateFeedback}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          disabled={
            isFeedbackLoading || isMarkUploadLoading || isRemovingMarkScheme
          }
        >
          Generate Feedback
        </button>

        {isFeedbackLoading && (
          <p className="mt-2 text-blue-500 text-sm">Generating feedback...</p>
        )}

        {/* Show overall score - now with total possible score if available */}
        <div className="mt-3 bg-gray-50 dark:bg-darker-custom p-3 rounded border">
          <div className="flex justify-between items-center">
            <strong>Overall Score:</strong>
            <span className="text-xl font-bold">
              {score}
              {totalPossibleScore && ` out of ${totalPossibleScore}`}
              {isUsingMarkScheme && " (Per Markscheme)"}
            </span>
          </div>

          {totalPossibleScore && score !== "N/A" && !isNaN(Number(score)) && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-blue-600 h-2 rounded"
                  style={{
                    width: `${
                      (Number(score) / Number(totalPossibleScore)) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Sub-score chart - now conditional based on mark scheme presence */}
        {criteria && (
          <>
            <p className="mt-4 text-sm text-gray-600">
              Sub-Scores (out of 10):
            </p>
            <FeedbackChart criteria={criteria} />

            {/* If you want to display the explanations for each sub-score */}
            {criteriaReasons && (
              <div className="mt-2 border rounded p-3 bg-gray-50 dark:bg-darker-custom text-sm">
                <p className="font-semibold mb-2">Score Explanations:</p>
                {Object.entries(criteriaReasons).map(([key, val]) => (
                  <div key={key} className="mb-2">
                    <strong className="text-blue-700 dark:text-blue-400">
                      {key === "markscheme"
                        ? "Mark Scheme"
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                      :
                    </strong>{" "}
                    {val}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Suggestions list - now with mark scheme reference highlight */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Improvement Suggestions:</h3>
          {suggestions.length === 0 ? (
            <p className="text-gray-500 italic">
              No suggestions yet. Generate feedback to see suggestions.
            </p>
          ) : (
            suggestions.map((sug) => (
              <div
                key={sug.id}
                className={`p-3 border rounded mb-2 transition-colors ${
                  sug.resolved
                    ? "bg-green-50 dark:bg-green-900/30 border-green-200"
                    : sug.markSchemeReference
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200"
                    : "bg-white dark:bg-darker-custom hover:bg-gray-50"
                }`}
                onMouseEnter={() => onHoverSuggestion(sug.id)}
                onMouseLeave={() => onHoverSuggestion()}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <strong
                      className={
                        sug.resolved ? "line-through text-gray-500" : ""
                      }
                    >
                      Suggestion:
                    </strong>{" "}
                    <span
                      className={
                        sug.resolved ? "line-through text-gray-500" : ""
                      }
                    >
                      {sug.advice}
                    </span>
                    {sug.markSchemeReference && (
                      <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        <strong>Mark Scheme Reference:</strong>{" "}
                        {sug.markSchemeReference}
                      </div>
                    )}
                  </div>
                  <button
                    className={`ml-3 text-xs px-2 py-1 rounded ${
                      sug.resolved
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                    onClick={() => handleToggleResolved(sug.id)}
                  >
                    {sug.resolved ? "Unresolve" : "Mark Resolved"}
                  </button>
                </div>
                {sug.snippet && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <em>Snippet:</em> "{sug.snippet}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}