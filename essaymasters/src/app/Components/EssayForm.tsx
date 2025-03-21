"use client";

import { useState } from "react";
import LoadingModal from "./LoadingModal";
import * as pdfjsLib from "pdfjs-dist";
import TabsPanel from "./TabsPanel";

/**
 * NOTE: We moved the side-panel logic to TabsPanel.tsx. 
 * Now EssayForm focuses on the large essay text area on the left, 
 * plus the PDF upload button, then renders <TabsPanel> on the right.
 */

// Required so pdfjs can load worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function EssayForm() {
  // ---------------------------
  // State
  // ---------------------------
  const [essay, setEssay] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);

  // Example: leftover logic 
  const [wordCount, setWordCount] = useState("200");
  const [essayType, setEssayType] = useState("Academic");
  const [selectedAction, setSelectedAction] = useState("");
  const [prompt, setPrompt] = useState("");

  // ---------------------------
  // PDF Upload -> sets essay text
  // ---------------------------
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

        // Set the text in our main essay field
        setEssay(extractedText.trim());

        // If you had old logic to record an event:
        // addMessage("user", "Uploaded an essay from a PDF.");
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setIsLoading(false);
      alert("Error reading PDF.");
    }
  };

  // ---------------------------
  // Example: If I still have an AI rewriting function
  // 
  // ---------------------------
  // const queryAI = async (somePrompt: string) => {
  //   if (!essay.trim()) {
  //     alert("No essay to process.");
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     const response = await fetch("/api/query", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ prompt: somePrompt, inputText: essay }),
  //     });
  //     const data = await response.json();
  //     if (!response.ok) throw new Error(data.error || "Unknown error");
  //     // addMessage("ai", data.response);
  //   } catch (err) {
  //     // addMessage("ai", `Error: ${err.message}`);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Example: old “Generate essay” or rewriting logic
  // const handleGenerateEssay = () => {
  //   if (!prompt) {
  //     alert("Select an action first!");
  //     return;
  //   }
  //   queryAI(prompt);
  // };

  // ---------------------------
  // Return / Render
  // ---------------------------
  return (
    <div className="flex flex-col w-full min-h-screen pt-6 mt-14 relative">
      <LoadingModal isLoading={isLoading} />

      {/* Two-column layout: left = big essay area, right = side panel */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* LEFT side: the main, big essay editor */}
        <div className="w-2/3 border-r border-gray-200 p-4 flex flex-col">
          <h2 className="text-xl font-bold text-gray-700 mb-3">Your Essay</h2>

          {/* Large text area */}
          <div className="flex-1 border rounded p-3 bg-gray-50 overflow-auto">
            <textarea
              className="w-full h-full bg-transparent focus:outline-none text-base text-gray-700"
              placeholder="Paste or type your essay here..."
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
            />
          </div>

          {/* PDF Upload button below the text area */}
          <div className="mt-4">
            <label className="inline-block bg-blue-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-500 mr-3">
              Upload PDF
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {/* (Optional) The rewriting/grammar UI from older code, commented out if not needed */}
            {/*
            <select
              className="border rounded-md p-2 text-gray-800"
              value={wordCount}
              onChange={(e) => {
                const c = e.target.value;
                setPrompt(`Rewrite this essay up to ${c} words while preserving meaning`);
                setSelectedAction(`Reworded to ${c} words`);
                setWordCount(c);
              }}
            >
              <option value="200">Up to 200 words</option>
              <option value="500">Up to 500 words</option>
              <option value="1500">Up to 1500 words</option>
            </select>

            <select
              className="border rounded-md p-2 text-gray-800 ml-2"
              value={essayType}
              onChange={(e) => {
                const t = e.target.value;
                setPrompt(`Rewrite this essay in a ${t} tone while preserving meaning`);
                setSelectedAction(`Adapt tone to a ${t} style`);
                setEssayType(t);
              }}
            >
              <option value="Academic">Academic</option>
              <option value="Argumentative">Argumentative</option>
              <option value="Descriptive">Descriptive</option>
              <option value="Narrative">Narrative</option>
            </select>

            <button
              className="border rounded-md p-2 text-gray-800 hover:bg-gray-100 ml-2"
              onClick={() => {
                setPrompt("Enhance clarity while preserving meaning");
                setSelectedAction("Enhance Clarity");
              }}
            >
              Enhance Clarity
            </button>

            <button
              className="border rounded-md p-2 text-gray-800 hover:bg-gray-100 ml-2"
              onClick={() => {
                setPrompt("Correct any spelling or grammar errors, preserving meaning");
                setSelectedAction("Check Spelling & Grammar");
              }}
            >
              Check Spelling & Grammar
            </button>

            <button
              className="ml-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
              onClick={handleGenerateEssay}
            >
              Generate Essay
            </button>
            */}
          </div>
        </div>

        {/* RIGHT side: The side panel, with two tabs (Feedback / Chat) */}
        <div className="w-1/3 bg-white p-4 flex flex-col">
          {/* Render the two-tab panel, passing the essay text if needed */}
          <TabsPanel essay={essay} />
        </div>
      </div>
    </div>
  );
}
