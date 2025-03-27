"use client";

import React, { useState, useEffect } from "react";

/**
 * 1) Define how feedback suggestions look:
 *    - 'id': unique string
 *    - 'snippet': portion of text we want to highlight
 *    - 'advice': message for the user
 *    - 'resolved': whether user marked it resolved
 */
interface FeedbackSuggestion {
  id: string;
  snippet: string;
  advice: string;
  resolved: boolean;
}

export default function TabsPanel({ essay }: { essay: string }) {
  const [activeTab, setActiveTab] = useState<"FEEDBACK" | "CHAT">("FEEDBACK");

  // -------------------------
  // FEEDBACK tab state
  // -------------------------
  const [score, setScore] = useState("N/A");
  const [markscheme, setMarkscheme] = useState("");
  const [suggestions, setSuggestions] = useState<FeedbackSuggestion[]>([]);
  // We'll keep a read-only “highlighted” version of the essay
  const [highlightedEssay, setHighlightedEssay] = useState(essay);

  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  // -------------------------
  // CHAT tab state
  // -------------------------
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // If user edits the essay in the left area, we discard old suggestions
  // and reset the highlight text:
  useEffect(() => {
    setHighlightedEssay(essay);
    setSuggestions([]);
  }, [essay]);

  // Switch tabs
  function switchTab(tab: "FEEDBACK" | "CHAT") {
    setActiveTab(tab);
  }

  // ─────────────────────────────────────────────────────────────────
  // 1) FEEDBACK LOGIC
  // ─────────────────────────────────────────────────────────────────
  async function handleGenerateFeedback() {
    if (!essay.trim()) {
      alert("No essay text found! Please paste or upload something.");
      return;
    }
    setIsFeedbackLoading(true);

    try {
      // Example system prompt for GPT; adapt as needed
      const feedbackPrompt = `
        You are an essay feedback assistant. 
        The user wrote this essay:
        """${essay}"""
        Provide a numeric score out of 100 in the JSON field "score".
        Then provide an array of "suggestions," each with:
           - "id" (unique string)
           - "snippet" (literal text to highlight from the essay)
           - "advice" (one or two sentences of feedback)
        Return valid JSON only.
      `;

      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: feedbackPrompt,
          inputText: "Generate feedback in strict JSON, no extra text.",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Feedback error detail:", errText);
        throw new Error("Request failed with " + response.status);
      }

      const data = await response.json();
      // data.response is GPT's text. Attempt to parse as JSON:
      let parsed;
      try {
        parsed = JSON.parse(data.response);
      } catch (e) {
        console.error("GPT did not return valid JSON:", data.response);
        alert("GPT did not return valid JSON. Check console logs.");
        setIsFeedbackLoading(false);
        return;
      }

      // Suppose we get { score: "90/100", suggestions: [...] }
      setScore(parsed.score || "N/A");

      const sugs: FeedbackSuggestion[] = parsed.suggestions || [];
      // Mark them all "unresolved"
      sugs.forEach((sug) => (sug.resolved = false));
      setSuggestions(sugs);

      // highlight them in a read-only version
      highlightSnippets(sugs);
    } catch (err: any) {
      console.error("Error generating feedback:", err);
      alert("Error generating feedback: " + err.message);
    } finally {
      setIsFeedbackLoading(false);
    }
  }

  // Markscheme upload (optional)
  async function handleMarkschemeUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setMarkscheme(text);
    } catch (error) {
      alert("Failed to read markscheme: " + (error as Error).message);
    }
  }

  // highlightSnippets(suggestions, [hoveringId?])
  // Replaces snippet with <mark> in `highlightedEssay`
  function highlightSnippets(
    sugList: FeedbackSuggestion[],
    hoveringId?: string
  ) {
    // Start from the raw essay text (no highlights)
    let newText = essay;

    // Filter out resolved suggestions
    const active = sugList.filter((sug) => !sug.resolved);

    // Sort them by snippet length (desc) so we replace bigger matches first
    active.sort((a, b) => b.snippet.length - a.snippet.length);

    for (const sug of active) {
      // A naive approach: only replace first occurrence, case-insensitive
      const snippetRegex = new RegExp(sug.snippet, "i");

      // If we're hovering over this suggestion, use a brighter color
      const colorClass =
        hoveringId === sug.id ? "bg-yellow-300" : "bg-yellow-100";

      newText = newText.replace(
        snippetRegex,
        `<mark class="${colorClass}">${sug.snippet}</mark>`
      );
    }

    setHighlightedEssay(newText);
  }

  // On hover, highlight that suggestion more strongly
  function handleSuggestionHover(sugId?: string) {
    highlightSnippets(suggestions, sugId);
  }

  // Mark resolved => no longer highlight that snippet
  function handleMarkResolved(sugId: string) {
    const updated = suggestions.map((sug) =>
      sug.id === sugId ? { ...sug, resolved: true } : sug
    );
    setSuggestions(updated);
    highlightSnippets(updated);
  }

  // ─────────────────────────────────────────────────────────────────
  // 2) CHAT LOGIC
  // ─────────────────────────────────────────────────────────────────
  async function handleChatSubmit() {
    if (!chatInput.trim()) return;

    // Minimal "full essay" check
    const blocked = ["write an essay", "full essay", "entire essay"];
    if (blocked.some((b) => chatInput.toLowerCase().includes(b))) {
      alert("Requests for a full essay are not allowed!");
      return;
    }

    // Add user message
    const newMessages = [...chatMessages, { sender: "user", text: chatInput }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      // Some system prompt for your chat
      const chatPrompt = `
        You are a helpful assistant. Do not write a full essay. 
        Answer as helpfully as possible, but concisely.
      `;

      const resp = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: chatPrompt,
          inputText: chatInput,
        }),
      });

      if (!resp.ok) {
        const e = await resp.text();
        console.error("Chat error detail:", e);
        throw new Error("Chat request failed with " + resp.status);
      }

      const data = await resp.json();
      const aiReply = data.response || "No response from AI.";
      setChatMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
    } catch (err: any) {
      console.error("Error in chat request:", err);
      alert("Error in chat request: " + err.message);
    } finally {
      setIsChatLoading(false);
      setChatInput("");
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  const loading = isFeedbackLoading || isChatLoading;

  return (
    <div className="flex flex-col w-full h-full text-black">
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200 mb-2">
        <button
          onClick={() => switchTab("FEEDBACK")}
          className={`flex-1 py-2 font-semibold text-center ${
            activeTab === "FEEDBACK"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "hover:bg-gray-100"
          }`}
        >
          Feedback
        </button>
        <button
          onClick={() => switchTab("CHAT")}
          className={`flex-1 py-2 font-semibold text-center ${
            activeTab === "CHAT"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "hover:bg-gray-100"
          }`}
        >
          Chat
        </button>
      </div>

      {loading && (
        <div className="text-center text-blue-600 mb-2">Processing...</div>
      )}

      {/* FEEDBACK TAB */}
      {activeTab === "FEEDBACK" && (
        <div className="flex-1 overflow-auto p-3 border rounded bg-white">
          <h2 className="font-bold text-lg mb-2">Generate Feedback</h2>

          {/* Markscheme (Optional) */}
          <label className="block text-black font-medium mb-1">
            Upload Markscheme (Optional):
          </label>
          <input
            type="file"
            className="border p-1 rounded mb-3"
            onChange={handleMarkschemeUpload}
          />

          <button
            onClick={handleGenerateFeedback}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          >
            Generate Feedback
          </button>

          <p className="mt-3">
            <strong>Score:</strong> {score}
          </p>

          {/* The read‐only essay with highlights */}
          <div className="mt-4 border p-2 bg-gray-50 rounded">
            <h3 className="font-semibold mb-1">Essay (with highlights)</h3>
            <div
              dangerouslySetInnerHTML={{ __html: highlightedEssay }}
              className="text-sm leading-relaxed"
            />
          </div>

          {/* The suggestions list */}
          <div className="mt-4">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                className={`p-2 border rounded mb-2 transition-colors ${
                  sug.resolved
                    ? "bg-gray-200 text-gray-500"
                    : "bg-white hover:bg-gray-100"
                }`}
                // Hover -> highlight that snippet
                onMouseEnter={() => handleSuggestionHover(sug.id)}
                onMouseLeave={() => handleSuggestionHover(undefined)}
              >
                <strong>Suggestion:</strong> {sug.advice}
                {!sug.resolved && (
                  <button
                    className="ml-3 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    onClick={() => handleMarkResolved(sug.id)}
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHAT TAB */}
      {activeTab === "CHAT" && (
        <div className="flex flex-col flex-1 p-3 border rounded bg-white">
          <h2 className="font-bold text-lg mb-2">Chat</h2>
          <div className="flex-1 border rounded p-2 overflow-auto bg-gray-50 mb-2">
            {chatMessages.length === 0 && (
              <div className="text-gray-400 italic">Ask something…</div>
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
