"use client";
import { useState } from "react";
import LoadingModal from "./LoadingModal";
import * as pdfjsLib from "pdfjs-dist";
import TabsPanel from "./TabsPanel"; // 

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function EssayForm() {
  const [essay, setEssay] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // PDF Upload -> sets essay text
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

  return (
    <div className="flex flex-col w-full min-h-screen pt-6 mt-14 relative bg-white text-black">
      <LoadingModal isLoading={isLoading} />

      {/* Two-column layout */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* LEFT: Big essay area */}
        <div className="w-2/3 border-r border-gray-200 p-4 flex flex-col">
          <h2 className="text-xl font-bold text-gray-700 mb-3">Your Essay</h2>

          <div className="flex-1 border rounded p-3 bg-gray-50 overflow-auto">
            {/* Single text area for user’s essay */}
            <textarea
              className="w-full h-full bg-transparent focus:outline-none text-base text-gray-700"
              placeholder="Paste or type your essay here..."
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
            />
          </div>

          <div className="mt-4">
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

        {/* RIGHT: Tabs (Feedback / Chat) */}
        <div className="w-1/3 bg-white p-4 flex flex-col">
          <TabsPanel essay={essay} />
        </div>
      </div>
    </div>
  );
}
