"use client";

import { SetStateAction, useState } from "react";
import LoadingModal from "./LoadingModal";

import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function EssayForm() {
  const [essay, setEssay] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState("200");
  const [essayType, setEssayType] = useState("Academic");
  const [selectedAction, setSelectedAction] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let extractedText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        extractedText += textContent.items.map((item: any) => item.str).join(" ") + "\n\n";
      }

      setEssay(extractedText.trim());
      addMessage("user", "Uploaded an essay from a PDF.");
    };
    reader.readAsArrayBuffer(file);
  };

  const queryAI = async (prompt: string) => {
    if (!essay.trim()) {
      alert("Please enter some text or upload a PDF first.");
      return;
    }

    setIsLoading(true);
    addMessage("user", prompt);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, inputText: essay }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unknown API error");
      }

      addMessage("ai", data.response || "No response from AI.");
    } catch (error: any) {
      addMessage("ai", `Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (sender: "user" | "ai", text: string) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const handleGenerateEssay = () => { 
    if (!prompt) {
      alert("Please select an action first.");
      return;
    }
    queryAI(prompt);  
  };

  const handleLength = (wordCount: any) => { 
    setPrompt(`Rewrite this essay up to ${wordCount} words while preserving meaning`);
    setSelectedAction(`Reworded to ${wordCount} words`);
  };

  const handleTone = (essayType: string) => { 
    setPrompt(`Rewrite this essay in a ${essayType} tone while preserving meaning`);
    setSelectedAction(`Adapt tone to a ${essayType} style`);
  };

  const handleEnhanceClarity = () => { 
    setPrompt(`Enhance clarity while preserving meaning`);
    setSelectedAction("Enhance Clarity")
  };

  const handleSpellingGrammar = () => { 
    setPrompt(`Correct any spelling or grammar errors, preserving meaning`);
    setSelectedAction("Check Spelling & Grammar");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
      <h2 className="text-xl font-bold text-[#4A4A8D] mb-4">Essay Chat</h2>

      <div className="h-96 overflow-y-auto border rounded-md p-3 bg-gray-100">
        {messages.length === 0 ? (
          <p className="text-gray-500 italic">Start by uploading an essay or selecting an option below.</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} my-2`}>
              <div className={`p-3 rounded-lg max-w-xs ${msg.sender === "user" ? "bg-indigo-500 text-white" : "bg-gray-300 text-gray-800"}`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      <textarea
        className="w-full p-3 border rounded-md text-lg text-gray-700 mt-4"
        placeholder="Type or paste your essay here..."
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
      />

      <label className="inline-block bg-indigo-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-indigo-600 mt-2">
        Upload PDF
        <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
      </label>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <select
          className={`border rounded-md p-3 shadow-sm text-gray-800 ${
            selectedAction === `Reworded to ${wordCount} words` ? "bg-indigo-200" : "bg-white hover:bg-gray-200"
          }`}
          value={wordCount}
          onChange={(e) => {
            const count = e.target.value;
            handleLength(count);
            setWordCount(count);
          }}
        >
        <option value="200">Up to 200 words</option>
        <option value="500">Up to 500 words</option>
        <option value="1500">Up to 1500 words</option>
        </select>

        <select
          className={`border rounded-md p-3 shadow-sm text-gray-800 ${
            selectedAction === `Adapt tone to a ${essayType} style` ? "bg-indigo-200" : "bg-white hover:bg-gray-200"
          }`}
          value={essayType}
          onChange={(e) => {
            const type = e.target.value;
            handleTone(type);
            setEssayType(type);
          }}
        >
        <option value="Academic">Academic</option>
        <option value="Argumentative">Argumentative</option>
        <option value="Descriptive">Descriptive</option>
        <option value="Narrative">Narrative</option>
        </select>

        <button
          className={`border rounded-md p-3 shadow-sm text-gray-800 ${selectedAction === "Enhance Clarity" ? "bg-indigo-200" : "bg-white hover:bg-gray-200"}`}
          onClick={handleEnhanceClarity}
        >
          Enhance Clarity
        </button>

        <button
          className={`border rounded-md p-3 shadow-sm text-gray-800 ${selectedAction === "Check Spelling & Grammar" ? "bg-indigo-200" : "bg-white hover:bg-gray-200"}`}
          onClick={handleSpellingGrammar}
        >
          Check Spelling & Grammar
        </button>
      </div>

      <button
        className="mt-4 bg-indigo-600 text-white py-3 rounded-lg text-lg shadow-md w-full"
        onClick={handleGenerateEssay}
      >
        Generate Essay
      </button>

      <LoadingModal isLoading={isLoading} />
    </div>
  );
}

