"use client";

import React, { useState } from "react";

interface Suggestion {
  id: string;
  advice: string;
}

export default function TabsPanel({ essay }: { essay: string }) {
  const [activeTab, setActiveTab] = useState<"FEEDBACK" | "CHAT">("FEEDBACK");

  // FEEDBACK
  const [score, setScore] = useState("N/A");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // CHAT
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  function switchTab(tab: "FEEDBACK" | "CHAT") {
    setActiveTab(tab);
  }

  /**
   * Generate Feedback by calling /api/query with a specialized prompt
   * that asks GPT to critique the essay and return bullet points, etc.
   */
  async function handleGenerateFeedback() {
    if (!essay.trim()) {
      alert("No essay text found!");
      return;
    }
    setFeedbackLoading(true);

    try {
      // We craft a 'system' prompt for feedback
      const feedbackPrompt = `
        You are an essay feedback assistant. 
        The user wrote this essay: 
        """${essay}"""
        Provide a short score out of 100, and 2 or 3 suggestions for improvement. 
        Format your suggestions in JSON like:
        {
          "score": "X/100",
          "suggestions": [
            {"id": "s1", "advice": "Something to fix"},
            ...
          ]
        }
      `;

      const resp = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: feedbackPrompt,   // system role
          inputText: "Please provide your JSON feedback.",
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Feedback error detail:", errText);
        throw new Error("Feedback request failed with " + resp.status);
      }

      const data = await resp.json();
      // data.response is a string. We want to parse it as JSON
      let parsed: any;
      try {
        parsed = JSON.parse(data.response);
      } catch {
        // If GPT didn't respond in valid JSON, we'll show an error
        console.error("GPT response was not valid JSON:", data.response);
        alert("GPT did not return valid JSON. Check console.");
        setFeedbackLoading(false);
        return;
      }

      // If the JSON structure is as we asked:
      setScore(parsed.score || "N/A");
      setSuggestions(parsed.suggestions || []);
    } catch (err: any) {
      console.error("Error generating feedback:", err);
      alert("Error generating feedback: " + err.message);
    } finally {
      setFeedbackLoading(false);
    }
  }

  /**
   * Chat by calling /api/query with a simpler prompt
   */
  async function handleChatSubmit() {
    if (!chatInput.trim()) {
      return;
    }
    // Check for "write me a full essay" etc
    const blockedPhrases = ["write an essay", "entire essay", "full essay"];
    if (blockedPhrases.some((p) => chatInput.toLowerCase().includes(p))) {
      alert("Requests for a full essay are not allowed!");
      return;
    }

    // Add user message
    const newMessages = [...chatMessages, { sender: "user", text: chatInput }];
    setChatMessages(newMessages);

    setChatLoading(true);
    try {
      // system prompt for a friendly chat
      const chatPrompt = `
        You are a helpful assistant. 
        Please respond concisely to the user's question or comment. 
        Do not write a full essay. 
      `;

      const resp = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: chatPrompt,  // system role
          inputText: chatInput // user role
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Chat error detail:", errText);
        throw new Error("Chat request failed with " + resp.status);
      }

      const data = await resp.json();
      // The route returns data.response
      const aiReply = data.response || "No response received.";

      setChatMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
    } catch (err: any) {
      console.error("Error in chat request:", err);
      alert("Error in chat request: " + err.message);
    } finally {
      setChatLoading(false);
      setChatInput("");
    }
  }

  const isLoading = feedbackLoading || chatLoading;

  return (
    <div className="flex flex-col w-full h-full text-black">
      {/* Tab Switch */}
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
        <div className="text-center text-blue-600 mb-2">Processing...</div>
      )}

      {/* Feedback Tab */}
      {activeTab === "FEEDBACK" && (
        <div className="flex-1 overflow-auto p-3 border rounded bg-white">
          <h2 className="font-bold text-lg mb-3">Generate Feedback</h2>
          <button
            onClick={handleGenerateFeedback}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 mb-4"
          >
            Generate Feedback
          </button>

          <p className="mb-2">
            <strong>Score: </strong>
            {score}
          </p>

          {suggestions.map((sug) => (
            <div key={sug.id} className="mb-2 p-2 border rounded bg-gray-50">
              <strong>Suggestion:</strong> {sug.advice}
            </div>
          ))}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === "CHAT" && (
        <div className="flex flex-col flex-1 p-3 border rounded bg-white">
          <h2 className="font-bold text-lg mb-3">Chat</h2>
          <div className="flex-1 border rounded p-2 overflow-auto bg-gray-50 mb-2">
            {chatMessages.length === 0 && (
              <div className="text-gray-400 italic">No messages yet...</div>
            )}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
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
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 border rounded p-2 mr-2"
              placeholder="Ask something..."
            />
            <button
              onClick={handleChatSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
