"use client";

import { useState, useEffect } from "react";
import LoadingModal from "./LoadingModal";
import * as pdfjsLib from "pdfjs-dist";
import TabsPanel from "./TabsPanel"; 
import { useDebounce } from "use-debounce"; // Prevent excessive API calls

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function EssayForm({ sessionId }: { sessionId: string }) {
  const [essay, setEssay] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedEssay] = useDebounce(essay, 2000); // Auto-save every 2 sec

  useEffect(() => {
    // Load existing essay from DB (mocking for now)
    async function loadEssay() {
      const res = await fetch(`/api/essays/${sessionId}`);
      const data = await res.json();
      setEssay(data.essay);
    }
    loadEssay();
  }, [sessionId]);

  useEffect(() => {
    if (debouncedEssay) {
      saveEssay(debouncedEssay);
    }
  }, [debouncedEssay]);

  const saveEssay = async (newEssay: string) => {
    await fetch(`/api/essays/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ essay: newEssay }),
    });
  };

  const uploadMarkScheme = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
  
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
  
    const data = await res.json();
    await fetch(`/api/marks/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl: data.url }),
    });
  };
 

  return (
    <div className="flex flex-col w-full min-h-screen pt-6 mt-14 relative bg-white text-black">
      <LoadingModal isLoading={isLoading} />

      {/* Layout */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Essay Editor */}
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
        </div>

        {/* Chat & Feedback */}
        <div className="w-1/3 bg-white p-4 flex flex-col">
          <TabsPanel essay={essay} />
        </div>
      </div>
    </div>
  );
}
