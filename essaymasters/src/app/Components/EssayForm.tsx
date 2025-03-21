"use client";

import { useState } from "react";
import LoadingModal from "./LoadingModal";
import * as pdfjsLib from "pdfjs-dist";
import TabsPanel, { FeedbackSuggestion } from "./TabsPanel";

/**
 * SINGLE ESSAY AREA:
 * For that, we make the big area a <textarea> or a contenteditable <div>.
 * 
 * For clarity, we'll use a single <textarea> so the user can type.
 */

// PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function EssayForm() {
  // The “source of truth” for user’s essay text
  const [rawEssay, setRawEssay] = useState("");
  // The same text but with highlight <mark> tags
  const [displayedEssay, setDisplayedEssay] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ------------------------------------------------------------------
  // PDF Upload => sets the essay text
  // ------------------------------------------------------------------
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText +=
            textContent.items.map((item: any) => item.str).join(" ") + "\n\n";
        }

        setRawEssay(extractedText.trim());
        setDisplayedEssay(extractedText.trim());
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setIsLoading(false);
      console.error("PDF upload error:", error);
      alert("Error reading PDF: " + (error as Error).message);
    }
  };

  // ------------------------------------------------------------------
  // highlightSnippets()
  // Called by the side panel to wrap snippet text in <mark> tags
  // ------------------------------------------------------------------
  const highlightSnippets = (
    suggestions: FeedbackSuggestion[],
    hoveringId?: string
  ) => {
    // Start fresh from the unmarked text each time
    let newText = rawEssay || "";

    // Filter out resolved suggestions & sort them by snippet length (desc)
    const active = suggestions.filter((sug) => !sug.resolved);
    active.sort((a, b) => b.snippet.length - a.snippet.length);

    // Replace each snippet with <mark>
    for (const sug of active) {
      // Example: only replace first occurrence (case-insensitive).
      // For a more advanced approach, do a custom textual search.
      const snippetRegex = new RegExp(sug.snippet, "i");

      const highlightColor =
        hoveringId === sug.id ? "bg-yellow-300" : "bg-yellow-100";
      newText = newText.replace(
        snippetRegex,
        `<mark class="${highlightColor}">${sug.snippet}</mark>`
      );
    }
    setDisplayedEssay(newText);
  };

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col w-full min-h-screen pt-6 mt-14 relative bg-white text-black">
      <LoadingModal isLoading={isLoading} />

      {/* Two-column layout */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* LEFT: Main essay area */}
        <div className="w-2/3 border-r border-gray-200 p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-2">Your Essay</h2>

          {/* We want a single text area that user can type into 
              BUT also want to show highlights. 
              We'll do the below approach: 
              - A "ghost" text area to collect user input
              - A "display area" that shows marked text.
          */}

          {/* This is the displayed text with <mark> highlights */}
          <div className="flex-1 border rounded p-3 bg-gray-50 overflow-auto text-base leading-relaxed mb-3 text-black">
            <div dangerouslySetInnerHTML={{ __html: displayedEssay }} />
          </div>

          {/* This is the actual text area for user input 
              When user types here, we update both rawEssay & displayedEssay 
          */}
          <textarea
            className="border rounded p-2 w-full h-16 text-black"
            placeholder="Type or paste your essay here..."
            value={rawEssay}
            onChange={(e) => {
              setRawEssay(e.target.value);
              setDisplayedEssay(e.target.value); // no highlights if user typed new text
            }}
          />

          {/* PDF Upload Button */}
          <div className="mt-2">
            <label className="inline-block bg-blue-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-500">
              Upload PDF
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* RIGHT: Tabs Panel (Feedback / Chat) */}
        <div className="w-1/3 p-4">
          <TabsPanel
            rawEssay={rawEssay}
            highlightSnippets={highlightSnippets}
            setIsLoading={setIsLoading}
          />
        </div>
      </div>
    </div>
  );
}
