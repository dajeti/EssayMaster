"use client";

import { useState, useEffect, useRef } from "react";
import LoadingModal from "./LoadingModal";
import * as pdfjsLib from "pdfjs-dist";
import { useDebounce } from "use-debounce";
import TabsPanel from "./TabsPanel";
import { ThemeProvider } from "next-themes";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface FeedbackSuggestion {
  id: string;
  snippet: string;
  advice: string;
  resolved: boolean;
}

export default function EssayForm({ sessionId }: { sessionId: string }) {
  const [rawEssay, setRawEssay] = useState("");
  const [highlightedEssay, setHighlightedEssay] = useState("");
  const [suggestions, setSuggestions] = useState<FeedbackSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [hoveringId, setHoveringId] = useState<string | null>(null);

  const editableRef = useRef<HTMLDivElement>(null);

  const [debouncedEssay] = useDebounce(rawEssay, 2000);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  async function loadSession() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/essays/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.essay) {
          setRawEssay(data.essay);
          setHighlightedEssay(data.essay);
        }
      }
    } catch (error) {
      console.error("Error loading session data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Auto-save
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
        console.error("Failed to save essay");
      }
    } catch (error) {
      console.error("Error saving essay:", error);
    }
  }

  // PDF Upload => set rawEssay
  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file for the essay.");
      return;
    }
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const typedArray = new Uint8Array(evt.target?.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let extractedText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            extractedText += textContent.items.map((item: any) => item.str).join(" ") + "\n\n";
          }
          setRawEssay(extractedText.trim());
          setSuggestions([]);
          setHighlightedEssay(extractedText.trim());
        } catch (parseErr) {
          console.error("Error reading PDF text:", parseErr);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error loading PDF file:", error);
      setIsLoading(false);
    }
  }

  // Called by FeedbackTab once GPT returns new suggestions
  function handleNewSuggestions(newSugs: FeedbackSuggestion[]) {
    setSuggestions(newSugs);
    highlightSnippets(rawEssay, newSugs, hoveringId);
  }

  // Called by FeedbackTab to toggle resolved
  function toggleSuggestionResolved(sugId: string) {
    const updated = suggestions.map((s) =>
      s.id === sugId ? { ...s, resolved: !s.resolved } : s
    );
    setSuggestions(updated);
    highlightSnippets(rawEssay, updated, hoveringId);
  }

  // Called by FeedbackTab on hover
  function handleHoverSuggestion(sugId?: string) {
    setHoveringId(sugId || null);
    highlightSnippets(rawEssay, suggestions, sugId || null);
  }

  // Rebuild the highlight HTML
  function highlightSnippets(
    plainText: string,
    sugs: FeedbackSuggestion[],
    hoverId: string | null
  ) {
    let result = plainText;
    const active = sugs.filter((s) => !s.resolved);
    // Sort so longer snippets get replaced first
    active.sort((a, b) => b.snippet.length - a.snippet.length);

    for (const sug of active) {
      const escapedSnippet = sug.snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const snippetRegex = new RegExp(escapedSnippet, "g");

      const colorClass = sug.id === hoverId ? "bg-yellow-300" : "bg-yellow-100";
      result = result.replace(
        snippetRegex,
        `<mark class="${colorClass}">${sug.snippet}</mark>`
      );
    }

    setHighlightedEssay(result);
  }

  // Handle user typing
  const savedSelection = useRef<number | null>(null);

  function handleEditableInput() {
    if (!editableRef.current) return;

    // Save cursor position
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editableRef.current);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      savedSelection.current = preCaretRange.toString().length;
    }

    const currentHTML = editableRef.current.innerHTML;
    const rawNoMarks = currentHTML.replace(/<mark.*?>(.*?)<\/mark>/g, "$1");
    setRawEssay(rawNoMarks);
    highlightSnippets(rawNoMarks, suggestions, hoveringId);
  }

  useEffect(() => {
    if (editableRef.current && savedSelection.current !== null) {
      const textNodeInfo = getTextNodeAtOffset(editableRef.current, savedSelection.current);
      if (textNodeInfo) {
        const range = document.createRange();
        range.setStart(textNodeInfo.node, textNodeInfo.offset);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      savedSelection.current = null;
    }
  }, [highlightedEssay]);

  function getTextNodeAtOffset(element: Node, offset: number) {
    let node: Node | null = element;
    let currentOffset = 0;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while ((node = walker.nextNode())) {
      const textLength = node.textContent?.length || 0;
      if (currentOffset + textLength >= offset) {
        return { node, offset: offset - currentOffset };
      }
      currentOffset += textLength;
    }
    return null;
  }

  return (
    <ThemeProvider attribute="class">
      <div className="flex flex-col w-full h-screen relative bg-white dark:bg-darker-custom text-black">
        {/* Top-level Loading Modal */}
        <div className="z-[9999]">
          <LoadingModal isLoading={isLoading} />
        </div>

        {/* We'll use a two-column layout that consumes full height,
            giving each column its own vertical scroll. */}
        <div className="flex flex-1 h-full overflow-hidden">
          {/* LEFT: the essay editor */}
          <div className="w-2/3 flex flex-col h-full border-r border-gray-200">
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-700 mb-3 dark:text-white">Your Essay</h2>
            </div>

            {/* This area scrolls independently */}
            <div className="flex-1 overflow-y-auto p-4 dark:bg-blue-custom-dark">
              <div
                ref={editableRef}
                className="text-base text-gray-700 leading-relaxed outline-none dark:text-white"
                contentEditable
                onInput={handleEditableInput}
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: highlightedEssay }}
              />
            </div>

            <div className="p-4 border-t">
              <label className="inline-block bg-blue-600 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-500">
                Upload PDF (Essay)
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handlePdfUpload}
                />
              </label>
            </div>
          </div>

          {/* RIGHT: feedback panel (TabsPanel) */}
          <div className="w-1/3 h-full overflow-y-auto p-4 bg-white dark:bg-darker-custom">
            <TabsPanel
              sessionId={sessionId}
              essay={rawEssay}
              suggestions={suggestions}
              onNewSuggestions={handleNewSuggestions}
              onToggleResolved={toggleSuggestionResolved}
              onHoverSuggestion={handleHoverSuggestion}
              setParentLoading={setIsLoading}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
