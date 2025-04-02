"use client";

import React, { useState } from "react";
import { ThemeProvider } from "next-themes";

export default function ChatTab({ essay }: { essay: string }) {
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Enhanced detection system
  const blockedPatterns = [
    // Essay writing patterns
    /\b(write|compose|create|generate|produce)\b.*\b(essay|paper|assignment|composition)\b/gi,
    /\b(full|complete|entire|whole)\s+(essay|paper|assignment)\b/gi,
    /\b(do|can you)\s+my\s+essay\b/gi,
    /\b(page|word)\s+(count|limit|requirement)\b/gi,
    
    // File format patterns
    /\.docx?\s*$/gi,
    /\bPDF\b.*\bgenerat(e|ion)\b/gi,
    
    // Academic integrity patterns
    /\b(academic|research)\s+paper\b/gi,
    /\bplagiaris(m|ed)\b/gi,
    /\bcitation\s+help\b/gi
  ];

  const containsBlockedRequest = (text: string): boolean => {
    const normalizedText = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ');   // Normalize whitespace

    return blockedPatterns.some(pattern => pattern.test(normalizedText));
  };

  async function handleChatSubmit() {
    const input = chatInput.trim();
    if (!input) return;

    // Immediate input validation
    if (containsBlockedRequest(input)) {
      setChatMessages(prev => [...prev, {
        sender: "ai",
        text: "I specialize in providing feedback and suggestions for existing essays. I cannot write new essays, but I'm happy to help you improve your work! \n\nTry asking:\n- 'How can I strengthen my introduction?'\n- 'Does my conclusion summarize effectively?'\n- 'Are there any grammar issues in paragraph 2?'"
      }]);
      setChatInput("");
      return;
    }

    // Update chat history
    setChatMessages(prev => [...prev, { sender: "user", text: input }]);
    setIsChatLoading(true);

    try {
      // Strict system prompt
      const chatPrompt = `
        You are an AI writing tutor assisting with essay analysis. The user provided this essay:
        """${essay}"""

        YOUR RULES:
        1. NEVER write full essays or long-form content
        2. Only provide feedback on the existing essay
        3. Keep responses under 3 paragraphs
        4. Redirect essay-writing requests to feedback options
        5. Focus on grammar, structure, and argument quality

        USER'S QUESTION: "${input}"
      `;

      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: chatPrompt,
          inputText: input,
          maxTokens: 300 // Strict token limit
        }),
      });

      if (!response.ok) throw new Error("Analysis request failed");

      const data = await response.json();
      const aiResponse = data.response.trim();

      // Response validation
      const isInvalidResponse = 
        aiResponse.split(/\n\n/).length > 3 || // More than 3 paragraphs
        aiResponse.length > 500 ||             // Over character limit
        /\b(here('s| is) (a|an)|full essay)\b/gi.test(aiResponse);

      if (isInvalidResponse) {
        throw new Error("Response violates content policy");
      }

      setChatMessages(prev => [...prev, { sender: "ai", text: aiResponse }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, {
        sender: "ai",
        text: "I apologize, I can only provide focused feedback on your existing essay. Please ask specific questions about your current work!"
      }]);
    } finally {
      setIsChatLoading(false);
      setChatInput("");
    }
  }

  return (
    <ThemeProvider attribute="class">
      <div className="flex flex-col flex-1 p-3 border rounded bg-white dark:bg-darker-custom">
        <h2 className="font-bold text-lg dark:text-white mb-2">Essay Analysis Chat</h2>

        {/* Chat History */}
        <div className="flex-1 border rounded p-2 overflow-auto bg-gray-50 dark:bg-blue-custom-dark mb-2 h-96">
          {chatMessages.length === 0 && (
            <div className="text-gray-400 italic p-2">
              Ask about your essay! Example: "How can I improve my thesis statement?"
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
                className={`p-2 rounded-md max-w-[80%] ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                }`}
              >
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex justify-start">
              <div className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-black dark:text-white">
                Analyzing...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border rounded p-2 text-black dark:text-white dark:bg-blue-custom-dark"
            placeholder="Ask about your essay..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
          />
          <button
            onClick={handleChatSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50"
            disabled={isChatLoading || !chatInput.trim()}
          >
            Send
          </button>
        </div>

        {/* Policy Reminder */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Note: This chat is for essay feedback only. Essay writing requests will be declined.
        </p>
      </div>
    </ThemeProvider>
  );
}
