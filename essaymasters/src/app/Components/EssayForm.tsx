"use client";

import LoadingModal from "./LoadingModal";
import * as pdfjsLib from "pdfjs-dist";
import TabsPanel from "./TabsPanel"; // 
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Changed from next/router to next/navigation

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function EssayForm({ session, sessionId }) {
  const router = useRouter();

  // Load session data if available
  const [essay, setEssay] = useState(session?.essay || "");
  const [chat, setChat] = useState(session?.chat || []);
  const [feedback, setFeedback] = useState(session?.feedback || "");
  const [markScheme, setMarkScheme] = useState(session?.markScheme || "");
  const [isLoading, setIsLoading] = useState(false);

  // Autosave every 5 seconds
  useEffect(() => {
    if (!sessionId) return;
    const saveInterval = setInterval(() => {
      fetch(`/api/sessions/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, essay, chat, feedback, markScheme }),
      });
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [essay, chat, feedback, markScheme, sessionId]);

  // Handle PDF Upload (Extract text from PDFs)
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

        setEssay(extractedText.trim());
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setIsLoading(false);
      alert("Error reading PDF: " + (error as Error).message);
    }
  };

  // Handle Mark Scheme Upload
  const handleMarkSchemeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    // Simulate upload process (Replace this with actual backend upload API)
    const fileUrl = URL.createObjectURL(file);
    setMarkScheme(fileUrl);
  };

  return (
    <div className="flex flex-col w-full min-h-screen pt-6 mt-14 relative bg-white text-black">
      <LoadingModal isLoading={isLoading} />

      {/* Two-column layout */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* LEFT: Essay Editing Area */}
        <div className="w-2/3 border-r border-gray-200 p-4 flex flex-col">
          <h2 className="text-xl font-bold text-gray-700 mb-3">Your Essay</h2>

          <div className="flex-1 border rounded p-3 bg-gray-50 overflow-auto">
            <textarea
              className="w-full h-full bg-transparent focus:outline-none text-base text-gray-700"
              placeholder="Paste or type your essay here..."
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
            />
          </div>

          <div className="mt-4 flex gap-4">
            <label className="inline-block bg-blue-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-500">
              Upload PDF (Essay)
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            <label className="inline-block bg-green-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-green-500">
              Upload Mark Scheme
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleMarkSchemeUpload}
              />
            </label>
          </div>
        </div>

        {/* RIGHT: Feedback & Chat */}
        <div className="w-1/3 bg-white p-4 flex flex-col">
          <TabsPanel essay={essay} chat={chat} feedback={feedback} markScheme={markScheme} />

          {/* Show Mark Scheme if uploaded */}
          {markScheme && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Mark Scheme</h3>
              <iframe 
                src={markScheme} 
                className="w-full h-64 border rounded mt-2"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}