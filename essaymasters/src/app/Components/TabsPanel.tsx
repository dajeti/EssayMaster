"use client";

import React, { useState, ChangeEvent } from "react";

export interface FeedbackSuggestion {
  id: string;
  snippet: string;
  advice: string;
  resolved: boolean;
}

interface TabsPanelProps {
  rawEssay: string;
  highlightSnippets: (
    suggestions: FeedbackSuggestion[],
    hoveringId?: string
  ) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TabsPanel({
  rawEssay,
  highlightSnippets,
  setIsLoading,
}: TabsPanelProps) {
  const [activeTab, setActiveTab] = useState<"FEEDBACK" | "CHAT">("FEEDBACK");
  const [markscheme, setMarkscheme] = useState<string>("");
  const [score, setScore] = useState<string>("N/A");
  const [feedbackSuggestions, setFeedbackSuggestions] = useState<
    FeedbackSuggestion[]
  >([]);

  // Chat
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");

  // Local loading indicator
  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = localLoading; // combined with parent's setIsLoading

  // ─────────────────────────────────────────────────────────────────
  // TAB SWITCH
  // ─────────────────────────────────────────────────────────────────
  const switchTab = (tabName: "FEEDBACK" | "CHAT") => {
    setActiveTab(tabName);
  };

  // ─────────────────────────────────────────────────────────────────
  // FEEDBACK
  // ─────────────────────────────────────────────────────────────────
  const handleMarkschemeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setMarkscheme(text);
      alert("Markscheme uploaded successfully!");
    } catch (error) {
      alert("Failed to read the markscheme file: " + (error as Error).message);
    }
  };

  const handleGenerateFeedback = async () => {
    if (!rawEssay.trim()) {
      alert("No essay text found. Please paste or upload first.");
      return;
    }
    setLocalLoading(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/generateFeedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay: rawEssay, markscheme }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("generateFeedback error details:", errorText);
        throw new Error(
          `generateFeedback request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      setScore(data.score || "N/A");

      const sugs: FeedbackSuggestion[] = data.suggestions || [];
      // Mark them all unresolved
      sugs.forEach((s) => (s.resolved = false));
      setFeedbackSuggestions(sugs);

      // Immediately highlight them
      highlightSnippets(sugs);
    } catch (err: any) {
      console.error("Error generating feedback:", err);
      alert("Error generating feedback: " + err.message);
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  const handleSuggestionHover = (id?: string) => {
    highlightSnippets(feedbackSuggestions, id);
  };

  const markResolved = (id: string) => {
    const updated = feedbackSuggestions.map((s) =>
      s.id === id ? { ...s, resolved: true } : s
    );
    setFeedbackSuggestions(updated);
    highlightSnippets(updated);
  };

  // ─────────────────────────────────────────────────────────────────
  // CHAT
  // ─────────────────────────────────────────────────────────────────
  const handleChatSubmit = async () => {
    const prohibitedPhrases = ["write an essay", "entire essay", "full essay"];
    const lowerInput = chatInput.toLowerCase();
    if (prohibitedPhrases.some((phrase) => lowerInput.includes(phrase))) {
      alert("Requests for a full essay are not allowed.");
      return;
    }

    const updatedMessages = [
      ...chatMessages,
      { sender: "user", text: chatInput },
    ];
    setChatMessages(updatedMessages);

    setLocalLoading(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: chatInput }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("chat request error details:", errText);
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data.response || "No response";
      setChatMessages((msgs) => [...msgs, { sender: "ai", text: aiReply }]);
    } catch (err: any) {
      console.error("Error in chat request:", err);
      alert("Error in chat request: " + err.message);
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
      setChatInput("");
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full h-full text-black">
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200 mb-2">
        <button
          onClick={() => switchTab("FEEDBACK")}
          className={`flex-1 py-2 font-semibold text-center ${
            activeTab === "FEEDBACK"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "hover:bg-gray-100 text-black"
          }`}
        >
          Feedback
        </button>
        <button
          onClick={() => switchTab("CHAT")}
          className={`flex-1 py-2 font-semibold text-center ${
            activeTab === "CHAT"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "hover:bg-gray-100 text-black"
          }`}
        >
          Chat
        </button>
      </div>

      {isLoading && (
        <div className="text-center text-blue-600 mb-1 whitespace-nowrap">
          Processing...
        </div>
      )}

      {/* Feedback Panel */}
      {activeTab === "FEEDBACK" && (
        <div className="flex-1 overflow-auto p-3 border rounded bg-white">
          <h2 className="font-bold text-lg mb-2">Generate Feedback</h2>
          <p className="text-gray-700 mb-2">
            Score: <span className="font-semibold">{score}</span>
          </p>

          <label className="block text-black font-medium mb-1">
            Upload Markscheme (Optional):
          </label>
          <input
            type="file"
            className="border p-1 rounded mb-3"
            onChange={handleMarkschemeUpload}
          />

          {/* Generate Feedback */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerateFeedback}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 whitespace-nowrap"
            >
              Generate Feedback
            </button>
          </div>

          {/* Suggestions list */}
          <div className="mt-4 space-y-3">
            {feedbackSuggestions.length > 0 && (
              <div className="font-bold mb-2">Suggestions:</div>
            )}
            {feedbackSuggestions.map((sug) => (
              <div
                key={sug.id}
                className={`p-2 border rounded transition-colors ${
                  sug.resolved
                    ? "bg-gray-200 text-gray-500"
                    : "bg-gray-50 text-black hover:bg-gray-100"
                }`}
                onMouseEnter={() => handleSuggestionHover(sug.id)}
                onMouseLeave={() => handleSuggestionHover(undefined)}
              >
                <div className="font-semibold">
                  Snippet: <em>{sug.snippet}</em>
                </div>
                <div className="mt-1 text-sm">{sug.advice}</div>
                {!sug.resolved && (
                  <button
                    className="mt-2 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => markResolved(sug.id)}
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {activeTab === "CHAT" && (
        <div className="flex flex-col flex-1 p-3 border rounded bg-white">
          <h2 className="font-bold text-lg mb-2">Chat</h2>
          <div className="flex-1 border rounded p-2 overflow-auto bg-gray-50 mb-2">
            {chatMessages.length === 0 && (
              <div className="text-gray-400 italic">
                Ask me anything (but not for a full essay)...
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`my-2 flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-md max-w-xs ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center">
            <input
              type="text"
              className="flex-1 border rounded p-2 mr-2 text-black"
              placeholder="Type here..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button
              onClick={handleChatSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 whitespace-nowrap"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
