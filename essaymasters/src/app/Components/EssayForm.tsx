"use client";

import { useState, useEffect } from "react";
import LoadingModal from "./LoadingModal";
import * as pdfjsLib from "pdfjs-dist";
import { useDebounce } from "use-debounce";
import TabsPanel from "./TabsPanel";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface EssayFormProps {
  sessionId: string;
}

export default function EssayForm({ sessionId }: EssayFormProps) {
  const [essay, setEssay] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "" });
  const [debouncedEssay] = useDebounce(essay, 2000); // Auto-save every 2 seconds

  // 1) On mount, load the essay from the server if it exists
  useEffect(() => {
    async function loadSession() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/essays/${sessionId}`);
        if (!res.ok) {
          console.error("Failed to load essay from session:", await res.text());
        } else {
          const data = await res.json();
          if (data.essay) {
            setEssay(data.essay);
          }
        }
      } catch (error) {
        console.error("Error loading session data:", error);
        showNotification("Failed to load essay data");
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  // 2) Auto-save the essay to the server (debounced)
  useEffect(() => {
    if (debouncedEssay) {
      saveEssay(debouncedEssay);
    }
  }, [debouncedEssay]);

  async function saveEssay(newEssay: string) {
    try {
      const res = await fetch(`/api/essays/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay: newEssay }),
      });
      if (!res.ok) {
        console.error("Failed to save essay:", await res.text());
      }
    } catch (error) {
      console.error("Error saving essay:", error);
      showNotification("Failed to save essay");
    }
  }

  // 3) Handle PDF-to-essay logic
  async function handlePdfUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // We only accept PDFs for the essay
    if (file.type !== "application/pdf") {
      showNotification("Please upload a PDF file for the essay");
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Convert file into a typed array
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          // Parse the PDF
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let extractedText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // Each item.str is a snippet of text from the PDF
            extractedText +=
              textContent.items.map((item: any) => item.str).join(" ") + "\n\n";
          }

          // Trim the final text and set it as the current essay
          setEssay(extractedText.trim());
        } catch (parseError) {
          console.error("Error reading PDF text:", parseError);
          showNotification("Error reading PDF text");
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error loading PDF file:", error);
      showNotification("Error loading PDF file");
      setIsLoading(false);
    }
  }

  function showNotification(message: string) {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: "" });
    }, 3000);
  }

  return (
    <div className="flex flex-col w-full min-h-screen pt-6 mt-14 relative bg-white text-black">
      <LoadingModal isLoading={isLoading} />

      {/* Notification (top-right) */}
      {notification.show && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {notification.message}
        </div>
      )}

      {/* Page Layout */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* LEFT: The Essay editor + PDF Upload button */}
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

          {/* PDF Upload button for the essay */}
          <div className="mt-4">
            <label className="inline-block bg-blue-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-500">
              Upload Essay (PDF)
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handlePdfUpload}
              />
            </label>
          </div>
        </div>

        {/* RIGHT: Tabs (Feedback/Chat) with Markscheme upload in FEEDBACK tab */}
        <div className="w-1/3 bg-white p-4 flex flex-col">
          <TabsPanel sessionId={sessionId} essay={essay} />
        </div>
      </div>
    </div>
  );
}
