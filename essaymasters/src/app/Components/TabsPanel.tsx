// "use client";

// import React, { useState, ChangeEvent } from "react";

// /**
//  * This component is a side panel with two tabs:
//  *   1) FEEDBACK tab: 
//  *      - Shows a "score" at the top 
//  *      - Has an "Upload Markscheme" button (optional)
//  *      - Has a "Generate Feedback" button
//  *      - Comments out the suggestions display so you can re-enable later
//  *
//  *   2) CHAT tab: 
//  *      - Basic chat with an input
//  *      - Simple block on "write me a full essay" type requests
//  *
//  * We no longer have a separate essay textarea here, 
//  * because the main essay is in `EssayForm` on the left side.
//  * We accept an `essay` prop if needed for generating feedback.
//  */

// interface TabsPanelProps {
//   essay: string; // The user's essay from the main page
// }

// export default function TabsPanel({ essay }: TabsPanelProps) {
//   // Which tab is active?
//   const [activeTab, setActiveTab] = useState<"FEEDBACK" | "CHAT">("FEEDBACK");

//   // Markscheme text (if the user uploads it)
//   const [markscheme, setMarkscheme] = useState<string>("");

//   // Score from AI or logic
//   const [score, setScore] = useState<string>("N/A");

//   // For highlighting suggestions from AI (commented out for now)
//   // const [feedbackSuggestions, setFeedbackSuggestions] = useState<
//   //   Array<{ highlight: string; suggestion: string }>
//   // >([]);

//   // Loading indicator
//   const [isLoading, setIsLoading] = useState(false);

//   // Chat
//   const [chatMessages, setChatMessages] = useState<
//     { sender: "user" | "ai"; text: string }[]
//   >([]);
//   const [chatInput, setChatInput] = useState<string>("");

//   // ─────────────────────────────────────────────────────────
//   // Tab Switch
//   // ─────────────────────────────────────────────────────────
//   const switchTab = (tabName: "FEEDBACK" | "CHAT") => {
//     setActiveTab(tabName);
//   };

//   // ─────────────────────────────────────────────────────────
//   // FEEDBACK LOGIC
//   // ─────────────────────────────────────────────────────────
//   const handleMarkschemeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     try {
//       // Just read as text (if PDF, you'd parse separately)
//       const text = await file.text();
//       setMarkscheme(text);
//       alert("Markscheme uploaded successfully!");
//     } catch (error) {
//       alert("Failed to read the markscheme file.");
//     }
//   };

//   const handleGenerateFeedback = async () => {
//     // If you want to require an essay:
//     if (!essay.trim()) {
//       alert("No essay text found. Please paste or upload in the main area first.");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // Example: call your API
//       const response = await fetch("/api/generateFeedback", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ essay, markscheme }),
//       });

//       if (!response.ok) throw new Error("Error from API");

//       const data = await response.json();
//       // Suppose the API returns: { score: "15/20", suggestions: [...] }
//       setScore(data.score || "N/A");

//       // If you want to show suggestions (commented out):
//       // setFeedbackSuggestions(data.suggestions || []);
//     } catch (err: any) {
//       console.error(err);
//       alert("Error generating feedback.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ─────────────────────────────────────────────────────────
//   // CHAT LOGIC
//   // ─────────────────────────────────────────────────────────
//   const handleChatSubmit = async () => {
//     // Simple validation to block "write me a full essay"
//     const prohibitedPhrases = ["write an essay", "entire essay", "full essay"];
//     const lowerInput = chatInput.toLowerCase();
//     if (prohibitedPhrases.some((phrase) => lowerInput.includes(phrase))) {
//       alert("Requests for a full essay are not allowed.");
//       return;
//     }

//     // Add user message
//     setChatMessages([...chatMessages, { sender: "user", text: chatInput }]);

//     setIsLoading(true);
//     try {
//       const response = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ prompt: chatInput }),
//       });

//       if (!response.ok) {
//         throw new Error("Error from chat endpoint");
//       }

//       const data = await response.json();
//       const aiReply = data.response || "No response";

//       // Add AI message
//       setChatMessages((msgs) => [...msgs, { sender: "ai", text: aiReply }]);
//     } catch (err) {
//       alert("Error in chat request.");
//     } finally {
//       setIsLoading(false);
//       setChatInput("");
//     }
//   };

//   // ─────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────
//   return (
//     <div className="flex flex-col w-full h-full">
//       {/* Simple tab buttons */}
//       <div className="flex border-b border-gray-300 mb-2">
//         <button
//           className={`flex-1 py-2 font-semibold ${
//             activeTab === "FEEDBACK"
//               ? "border-b-2 border-blue-500 text-blue-600"
//               : "hover:bg-gray-100 text-gray-600"
//           }`}
//           onClick={() => switchTab("FEEDBACK")}
//         >
//           Feedback
//         </button>
//         <button
//           className={`flex-1 py-2 font-semibold ${
//             activeTab === "CHAT"
//               ? "border-b-2 border-blue-500 text-blue-600"
//               : "hover:bg-gray-100 text-gray-600"
//           }`}
//           onClick={() => switchTab("CHAT")}
//         >
//           Chat
//         </button>
//       </div>

//       {isLoading && (
//         <div className="text-center text-blue-600 mb-2">Processing...</div>
//       )}

//       {/* FEEDBACK TAB */}
//       {activeTab === "FEEDBACK" && (
//         <div className="flex-1 overflow-auto p-3 bg-white border rounded">
//           <h2 className="text-lg font-bold mb-2">Generate Feedback</h2>
//           <p className="mb-4 text-gray-700">
//             Score: <span className="font-semibold">{score}</span>
//           </p>

//           {/* Markscheme upload (optional) */}
//           <label className="block text-gray-700 font-semibold mb-1">
//             Upload Markscheme (Optional):
//           </label>
//           <input
//             type="file"
//             className="border p-2 rounded mb-4"
//             onChange={handleMarkschemeUpload}
//           />

//           <button
//             onClick={handleGenerateFeedback}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
//           >
//             Generate Feedback
//           </button>

//           {/*
//             --------------------------------------------------
//             COMMENTED OUT: suggestions or highlight display
//             --------------------------------------------------
//           */}
//           {/*
//           {feedbackSuggestions.length > 0 && (
//             <div className="mt-4">
//               <h3 className="font-bold mb-2">Suggestions:</h3>
//               {feedbackSuggestions.map((item, idx) => (
//                 <div key={idx} className="mb-2 border-l-4 border-blue-300 pl-2">
//                   <strong>Issue:</strong> <em>{item.highlight}</em>
//                   <br />
//                   <strong>Suggestion:</strong> {item.suggestion}
//                 </div>
//               ))}
//             </div>
//           )}
//           */}
//         </div>
//       )}

//       {/* CHAT TAB */}
//       {activeTab === "CHAT" && (
//         <div className="flex flex-col flex-1 overflow-auto p-3 bg-white border rounded">
//           <h2 className="text-lg font-bold mb-2">Chat</h2>

//           {/* Chat messages area */}
//           <div className="flex-1 border rounded p-2 overflow-auto bg-gray-50 mb-2">
//             {chatMessages.length === 0 && (
//               <div className="text-gray-400 italic">Ask a question...</div>
//             )}
//             {chatMessages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`my-2 flex ${
//                   msg.sender === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`p-2 rounded-md max-w-xs ${
//                     msg.sender === "user"
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-200 text-gray-700"
//                   }`}
//                 >
//                   {msg.text}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Chat input row */}
//           <div className="flex items-center">
//             <input
//               type="text"
//               className="flex-1 border rounded p-2 mr-2"
//               placeholder="Ask me anything (but not for a full essay!)"
//               value={chatInput}
//               onChange={(e) => setChatInput(e.target.value)}
//             />
//             <button
//               onClick={handleChatSubmit}
//               className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
//version 2
"use client";

import React, { useState, ChangeEvent } from "react";

/**
 * SUGGESTION INTERFACE
 *  Each suggestion includes:
 *   - an `id` so we can track it
 *   - a `snippet` portion of text in the essay
 *   - the `advice` (the feedback to show user)
 *   - a `resolved` boolean
 *
 *  This is purely an example. The snippet would come from the AI.
 */
export interface FeedbackSuggestion {
  id: string;
  snippet: string;
  advice: string;
  resolved: boolean;
}

/**
 * PROPS for TabsPanel:
 *  - rawEssay: The un-highlighted essay text
 *  - highlightSnippets: a function to re-render the essay with <mark> tags 
 *  - setIsLoading: to toggle the loading spinner
 */
interface TabsPanelProps {
  rawEssay: string;
  highlightSnippets: (suggestions: FeedbackSuggestion[], hoveringId?: string) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TabsPanel({
  rawEssay,
  highlightSnippets,
  setIsLoading,
}: TabsPanelProps) {
  const [activeTab, setActiveTab] = useState<"FEEDBACK" | "CHAT">("FEEDBACK");

  // Markscheme text, if provided
  const [markscheme, setMarkscheme] = useState<string>("");
  // A sample numeric or textual “score”
  const [score, setScore] = useState<string>("N/A");

  // Our suggestions array
  const [feedbackSuggestions, setFeedbackSuggestions] = useState<
    FeedbackSuggestion[]
  >([]);

  // Loading indicator local to this panel
  const [localLoading, setLocalLoading] = useState(false);

  // Chat messages
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState<string>("");

  // Merge localLoading and parent loading
  const isLoading = localLoading;

  // ─────────────────────────────────────────────────────────────────
  // TAB SWITCH
  // ─────────────────────────────────────────────────────────────────
  const switchTab = (tabName: "FEEDBACK" | "CHAT") => {
    setActiveTab(tabName);
  };

  // ─────────────────────────────────────────────────────────────────
  // FEEDBACK LOGIC
  // ─────────────────────────────────────────────────────────────────
  const handleMarkschemeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setMarkscheme(text);
      alert("Markscheme uploaded successfully!");
    } catch (error) {
      alert("Failed to read the markscheme file.");
    }
  };

  /**
   * EXAMPLE Generate Feedback:
   *  - Call your /api/generateFeedback with { essay: rawEssay, markscheme }
   *  - Suppose it returns something like:
   *     {
   *       score: "85/100",
   *       suggestions: [
   *         { id: "1", snippet: "the thesis statement", advice: "Consider a more direct claim", resolved: false },
   *         ...
   *       ]
   *     }
   */
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

      if (!response.ok) throw new Error("Error from API");

      const data = await response.json();
      setScore(data.score || "N/A");
      // Example structure
      // data.suggestions might be an array of { id, snippet, advice }
      const sugs: FeedbackSuggestion[] = data.suggestions || [];
      // Mark all suggestions as unresolved initially
      sugs.forEach((s) => (s.resolved = false));
      setFeedbackSuggestions(sugs);

      // Immediately highlight them in the essay
      highlightSnippets(sugs);
    } catch (err) {
      console.error(err);
      alert("Error generating feedback.");
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  /**
   * Hover/Unhover a suggestion -> highlight that snippet more strongly in the essay
   */
  const handleSuggestionHover = (id?: string) => {
    highlightSnippets(feedbackSuggestions, id);
  };

  /**
   * Mark a suggestion as resolved -> remove highlight
   */
  const markResolved = (id: string) => {
    const updated = feedbackSuggestions.map((s) =>
      s.id === id ? { ...s, resolved: true } : s
    );
    setFeedbackSuggestions(updated);
    // Re-highlight with the updated array (the resolved item is removed from highlight)
    highlightSnippets(updated);
  };

  // ─────────────────────────────────────────────────────────────────
  // CHAT LOGIC
  // ─────────────────────────────────────────────────────────────────
  const handleChatSubmit = async () => {
    const prohibitedPhrases = ["write an essay", "entire essay", "full essay"];
    const lowerInput = chatInput.toLowerCase();
    if (prohibitedPhrases.some((phrase) => lowerInput.includes(phrase))) {
      alert("Requests for a full essay are not allowed.");
      return;
    }

    setChatMessages([...chatMessages, { sender: "user", text: chatInput }]);
    setLocalLoading(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: chatInput }),
      });
      if (!response.ok) throw new Error("Error from chat endpoint");

      const data = await response.json();
      const aiReply = data.response || "No response";
      setChatMessages((msgs) => [...msgs, { sender: "ai", text: aiReply }]);
    } catch (err) {
      alert("Error in chat request.");
    } finally {
      setChatInput("");
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full h-full text-black">
      {/* Tabs row */}
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

      {/* FEEDBACK TAB */}
      {activeTab === "FEEDBACK" && (
        <div className="flex-1 overflow-auto p-3 border rounded bg-white">
          <h2 className="font-bold text-lg mb-2">Generate Feedback</h2>
          <p className="text-gray-700 mb-2">
            Score: <span className="font-semibold">{score}</span>
          </p>

          {/* Markscheme upload row */}
          <label className="block text-black font-medium mb-1">
            Upload Markscheme (Optional):
          </label>
          <input
            type="file"
            className="border p-1 rounded mb-3"
            onChange={handleMarkschemeUpload}
          />

          {/* Generate feedback button (make sure it doesn't wrap) */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerateFeedback}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 whitespace-nowrap"
            >
              Generate Feedback
            </button>
          </div>

          {/* List of suggestions */}
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

                {/* Mark resolved button */}
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

      {/* CHAT TAB */}
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

          {/* Input row */}
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
