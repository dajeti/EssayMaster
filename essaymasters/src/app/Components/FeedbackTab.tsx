import React, { useState, useEffect, useRef } from "react";
import FeedbackChart from "./Feedback/FeedbackChart";
import { ThemeProvider } from "next-themes";

interface FeedbackSuggestion {
  id: string;
  snippet: string;
  advice: string;
  resolved: boolean;
  markSchemeReference?: string; // Add this field for mark scheme references
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
  totalPossibleScore?: number; // Add this to capture the denominator
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
  const [totalPossibleScore, setTotalPossibleScore] = useState<string | number | null>(null);
  const [criteria, setCriteria] = useState<CriteriaScores | null>(null);
  const [criteriaReasons, setCriteriaReasons] = useState<CriteriaReasons | null>(null);

  // Markscheme management
  const [markSchemeUrl, setMarkSchemeUrl] = useState("");
  const [markSchemeContent, setMarkSchemeContent] = useState("");
  const [isMarkUploadLoading, setIsMarkUploadLoading] = useState(false);
  const [isRemovingMarkScheme, setIsRemovingMarkScheme] = useState(false);
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
  async function fetchMarkSchemeContent(url) {
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
      
      const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
      let extractedText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        extractedText += textContent.items.map((item) => item.str).join(" ") + "\n\n";
      }
      
      setMarkSchemeContent(extractedText.trim());
    } catch (error) {
      console.error("Error reading mark scheme PDF:", error);
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
            extractedText += textContent.items.map((item: any) => item.str).join(" ") + "\n\n";
          }
          
          setMarkSchemeContent(extractedText.trim());
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
      alert("Mark scheme removed successfully!");
    } catch (error) {
      console.error("Error removing mark scheme:", error);
      alert(`Failed to remove mark scheme: ${error.message}`);
    } finally {
      setIsRemovingMarkScheme(false);
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
      let chosenPrompt;
      
      if (markSchemeUrl && markSchemeContent) {
        // Improved prompt with explicit mark scheme content
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
          5. If the mark scheme uses bands/levels (e.g., Level 1-5), indicate this in your scoring

          Please return a JSON object with:
          {
            "score": [appropriate score based on mark scheme scale],
            "totalPossibleScore": [total possible score from the mark scheme],
            "criteria": {
              "grammar": [0-10],
              "clarity": [0-10],
              "structure": [0-10],
              "analysis": [0-10],
              "markscheme": [0-10]
            },
            "criteriaReasons": {
              "grammar": [brief explanation],
              "clarity": [brief explanation],
              "structure": [brief explanation],
              "analysis": [brief explanation],
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

          For the "markscheme" score, rate how well the essay meets the specific criteria in the mark scheme.
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
        disabled={isFeedbackLoading || isMarkUploadLoading || isRemovingMarkScheme}
      >
        Generate Feedback
      </button>

      {isFeedbackLoading && (
        <p className="mt-2 text-blue-500 text-sm">Generating feedback...</p>
      )}

      {/* Show overall score - now with total possible score if available */}
      <p className="mt-3">
        <strong>Overall Score:</strong> {score}
        {totalPossibleScore && ` out of ${totalPossibleScore}`}
        {markSchemeUrl && !totalPossibleScore && " (per mark scheme)"}
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

      {/* Suggestions list - now with mark scheme reference highlight */}
      <div className="mt-4">
        {suggestions.map((sug) => (
          <div
            key={sug.id}
            className={`p-2 border rounded mb-2 transition-colors ${
              sug.resolved ? "bg-gray-200 dark:bg-gray-700" : 
              sug.markSchemeReference ? "bg-blue-50 dark:bg-blue-900" : "bg-white dark:bg-darker-custom hover:bg-gray-50"
            }`}
            onMouseEnter={() => onHoverSuggestion(sug.id)}
            onMouseLeave={() => onHoverSuggestion()}
          >
            <div className="flex justify-between items-start">
              <div>
                <strong>Suggestion:</strong> {sug.advice}
                {sug.markSchemeReference && (
                  <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    <strong>Mark Scheme Reference:</strong> {sug.markSchemeReference}
                  </div>
                )}
              </div>
              <button
                className="ml-3 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                onClick={() => onToggleResolved(sug.id)}
              >
                {sug.resolved ? "Unresolve" : "Mark Resolved"}
              </button>
            </div>
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