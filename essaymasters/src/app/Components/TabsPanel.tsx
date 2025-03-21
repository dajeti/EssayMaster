"use client";

import React, { useState, ChangeEvent } from "react";

/**
 * This component always shows a two-tab panel.
 *  - The first tab handles uploading a markscheme and generating feedback.
 *  - The second tab acts as a chat interface with user input validation.
 */
export default function TabsPanel() {
  // Which tab is active?
  const [activeTab, setActiveTab] = useState<"FEEDBACK" | "CHAT">("FEEDBACK");

  // State for the user’s essay text
  const [essay, setEssay] = useState<string>("");

  // State for the user’s markscheme file/content
  const [markscheme, setMarkscheme] = useState<string>("");

  // State for “score,” which you can get from your AI or user input
  const [score, setScore] = useState<string>("N/A");

  // Feedback messages (for highlighting, you might keep track of positions, etc.)
  const [feedbackSuggestions, setFeedbackSuggestions] = useState<
    Array<{ highlight: string; suggestion: string }>
  >([]);

  // Loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // Chat conversation
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);

  // Single user input for chat
  const [chatInput, setChatInput] = useState<string>("");

  // ─────────────────────────────────────────────────────────────────────────────
  // TAB SWITCH LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const switchTab = (tabName: "FEEDBACK" | "CHAT") => {
    setActiveTab(tabName);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FEEDBACK TAB METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Handles the user uploading a Markscheme (could be text, PDF, CSV, etc.).
   * For simplicity, we read it as plain text. Adjust as needed.
   */
  const handleMarkschemeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // For simplicity, let’s read it as text. If it’s a PDF, you’d parse the PDF etc.
      const text = await file.text();
      setMarkscheme(text);
      alert("Markscheme uploaded successfully!");
    } catch (error) {
      alert("Failed to read the markscheme file.");
    }
  };

  /**
   * Calls your AI endpoint to generate feedback for the essay, using the optional markscheme.
   */
  const handleGenerateFeedback = async () => {
    if (!essay.trim()) {
      alert("Please provide or paste your essay text first!");
      return;
    }

    setIsLoading(true);

    try {
      // Example fetch. Adjust to your actual /api route and body structure.
      const response = await fetch("/api/generateFeedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essay,
          markscheme,
        }),
      });

      if (!response.ok) {
        throw new Error("Error from API");
      }

      const data = await response.json();

      // Example structure: data might look like
      // {
      //   score: "15/20",
      //   suggestions: [
      //     { highlight: "your introduction", suggestion: "Try a stronger thesis statement" },
      //     { highlight: "conclusion", suggestion: "Restate main argument succinctly" }
      //   ]
      // }
      setScore(data.score || "N/A");
      setFeedbackSuggestions(data.suggestions || []);
    } catch (err: any) {
      console.error(err);
      alert("Error generating feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CHAT TAB METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Submits the chat input to your AI endpoint, with a simple validation
   * to block requests that obviously ask for a complete essay.
   */
  const handleChatSubmit = async () => {
    const prohibitedPhrases = ["write an essay", "entire essay", "full essay"];

    // Simple validation:
    const lowerInput = chatInput.toLowerCase();
    if (prohibitedPhrases.some((phrase) => lowerInput.includes(phrase))) {
      alert("Requests for a full essay are not allowed.");
      return;
    }

    // Add user message to the conversation
    setChatMessages([...chatMessages, { sender: "user", text: chatInput }]);
    setChatInput("");

    setIsLoading(true);
    try {
      // Example fetch call:
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: chatInput }),
      });

      if (!response.ok) {
        throw new Error("Error from chat endpoint");
      }

      const data = await response.json();

      // Suppose data.response is the AI's message
      const aiReply = data.response || "No response";

      setChatMessages((msgs) => [...msgs, { sender: "ai", text: aiReply }]);
    } catch (err) {
      alert("Error in chat request.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDERING
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col w-full h-full max-w-5xl mx-auto mt-24">
      {/* Tab buttons */}
      <div className="flex border-b border-gray-300 mb-4">
        <button
          className={`px-4 py-2 ${
            activeTab === "FEEDBACK" ? "bg-white font-bold" : "bg-gray-100"
          }`}
          onClick={() => switchTab("FEEDBACK")}
        >
          Feedback
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "CHAT" ? "bg-white font-bold" : "bg-gray-100"
          }`}
          onClick={() => switchTab("CHAT")}
        >
          Chat
        </button>
      </div>

      {isLoading && (
        <div className="text-center my-2 text-blue-600">Processing...</div>
      )}

      {/* FEEDBACK TAB */}
      {activeTab === "FEEDBACK" && (
        <div className="p-4 border rounded-md bg-white">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Feedback & Markscheme</h2>
            <p className="text-gray-600 mt-2">
              Score: <span className="font-semibold">{score}</span>
            </p>
          </div>

          {/* Markscheme Upload */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">
              Upload Markscheme (Optional):
            </label>
            <input
              type="file"
              className="border p-2 rounded"
              onChange={handleMarkschemeUpload}
            />
          </div>

          {/* Essay Textarea */}
          <label className="block text-gray-700 font-semibold mb-1">
            Paste Essay Here:
          </label>
          <textarea
            className="w-full h-28 border rounded p-2"
            placeholder="Paste or type your essay here..."
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
          ></textarea>

          {/* Generate Feedback Button */}
          <button
            onClick={handleGenerateFeedback}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Generate Feedback
          </button>

          {/* Show suggestions highlighting corresponding text  */}
          {feedbackSuggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">Suggestions:</h3>
              {feedbackSuggestions.map((item, i) => (
                <div
                  key={i}
                  className="mb-4 p-3 border-l-4 border-blue-300 bg-gray-50"
                >
                  <strong>Issue:</strong> <em>{item.highlight}</em>
                  <br />
                  <strong>Suggestion:</strong> {item.suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHAT TAB */}
      {activeTab === "CHAT" && (
        <div className="p-4 border rounded-md bg-white flex flex-col h-[50vh]">
          <div className="flex-1 overflow-y-auto border p-2 mb-2 rounded">
            {chatMessages.length === 0 && (
              <div className="text-gray-400 italic">
                Ask your questions here...
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
                      : "bg-gray-200 text-gray-700"
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
              className="flex-1 border rounded p-2 mr-2"
              placeholder="Ask me anything (but not to write a full essay!)"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button
              onClick={handleChatSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
