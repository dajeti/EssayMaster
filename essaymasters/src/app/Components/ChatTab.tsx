//    // Minimal "full essay" check
//    const blocked = ["write an essay", "give me an essay", "entire essay"];
//    if (blocked.some((b) => chatInput.toLowerCase().includes(b))) {
//      alert("Requests for a full essay are not allowed!");
//      return;
//    }

"use client";

import React, { useState } from "react";
import { ThemeProvider } from "next-themes";


export default function ChatTab({ essay }: { essay: string }) {
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  async function handleChatSubmit() {
    if (!chatInput.trim()) return;

    // Add user message to the chat
    const newMessages = [...chatMessages, { sender: "user", text: chatInput }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      // A simple system prompt referencing the user’s essay
      const chatPrompt = `
You are an AI tutor. The user wrote this essay:
"""${essay}"""
Focus on giving clarifications and suggestions. Do not write entire essays on request.
      `;

      const resp = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: chatPrompt, inputText: chatInput }),
      });

      if (!resp.ok) {
        const e = await resp.text();
        console.error("Chat error detail:", e);
        throw new Error("Chat request failed");
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

  return (
    <ThemeProvider attribute="class">
    <div className="flex flex-col flex-1 p-3 border rounded bg-white dark:bg-darker-custom">
      {isChatLoading && (
        <div className="text-center text-blue-600 mb-2">Processing...</div>
      )}

      <h2 className="font-bold text-lg dark:text-white mb-2">Chat</h2>

      <div className="flex-1 border rounded p-2 overflow-auto bg-gray-50 dark:bg-blue-custom-dark mb-2">
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
          className="flex-1 border rounded p-2 mr-2 text-black dark:text-white dark:bg-blue-custom-dark"
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
    </ThemeProvider>
  );
}
