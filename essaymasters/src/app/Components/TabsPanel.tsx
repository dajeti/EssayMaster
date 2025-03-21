// "use client";

// import React, { useState, ChangeEvent } from "react";

// /**
//  * We'll define a "FeedbackSuggestion" interface
//  * Each suggestion has:
//  *   - id
//  *   - snippet (the part of the essay to highlight)
//  *   - advice (the feedback message)
//  *   - resolved (whether user marked it resolved)
//  */
// interface FeedbackSuggestion {
//   id: string;
//   snippet: string;
//   advice: string;
//   resolved: boolean;
// }

// /**
//  * PROPS:
//  *  - `essay`: the text from <EssayForm> (the single text area)
//  */
// export default function TabsPanel({ essay }: { essay: string }) {
//   // Which tab is active
//   const [activeTab, setActiveTab] = useState<"FEEDBACK" | "CHAT">("FEEDBACK");

//   // For the FEEDBACK tab
//   const [markscheme, setMarkscheme] = useState("");
//   const [score, setScore] = useState("N/A");
//   const [feedbackSuggestions, setFeedbackSuggestions] = useState<
//     FeedbackSuggestion[]
//   >([]);
//   const [displayedEssay, setDisplayedEssay] = useState(essay); // We'll store a highlighted version here
//   const [feedbackLoading, setFeedbackLoading] = useState(false);

//   // For the CHAT tab
//   const [chatMessages, setChatMessages] = useState<
//     { sender: "user" | "ai"; text: string }[]
//   >([]);
//   const [chatInput, setChatInput] = useState("");
//   const [chatLoading, setChatLoading] = useState(false);

//   // Re-run whenever parent `essay` changes: reset displayedEssay
//   React.useEffect(() => {
//     // If user changes the essay in the left text area,
//     // we drop any existing highlights:
//     setDisplayedEssay(essay);
//   }, [essay]);

//   // TAB SWITCH
//   const switchTab = (tab: "FEEDBACK" | "CHAT") => {
//     setActiveTab(tab);
//   };

//   // ─────────────────────────────────────────────────────────────────
//   // FEEDBACK TAB
//   // ─────────────────────────────────────────────────────────────────
//   const handleMarkschemeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     try {
//       const text = await file.text();
//       setMarkscheme(text);
//       alert("Markscheme uploaded successfully!");
//     } catch (error) {
//       alert("Failed to read the markscheme: " + (error as Error).message);
//     }
//   };

//   // Replaces snippet with <mark> in displayedEssay
//   // Called whenever we get new suggestions or hover
//   function highlightSnippets(
//     suggestions: FeedbackSuggestion[],
//     hoveringId?: string
//   ) {
//     // Start from the unhighlighted essay text
//     let newText = essay;

//     // Only highlight unresolved suggestions
//     const active = suggestions.filter((s) => !s.resolved);

//     // Sort by snippet length (desc) so longer matches are replaced first
//     active.sort((a, b) => b.snippet.length - a.snippet.length);

//     for (const sug of active) {
//       // A naive approach: find first occurrence (case-insensitive)
//       const snippetRegex = new RegExp(sug.snippet, "i");

//       // If hovered, highlight in bright color; else faint color
//       const colorClass =
//         hoveringId === sug.id ? "bg-yellow-300" : "bg-yellow-100";

//       newText = newText.replace(
//         snippetRegex,
//         `<mark class="${colorClass}">${sug.snippet}</mark>`
//       );
//     }

//     setDisplayedEssay(newText);
//   }

//   const handleGenerateFeedback = async () => {
//     if (!essay.trim()) {
//       alert("No essay text found. Please paste or upload first.");
//       return;
//     }

//     setFeedbackLoading(true);
//     try {
//       const response = await fetch("/api/generateFeedback", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ essay, markscheme }),
//       });
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("generateFeedback error detail:", errorText);
//         throw new Error(`Request failed with status ${response.status}`);
//       }

//       const data = await response.json();
//       setScore(data.score || "N/A");

//       // Suppose data.suggestions is an array of { id, snippet, advice }
//       const suggestions: FeedbackSuggestion[] = data.suggestions || [];
//       suggestions.forEach((sug) => (sug.resolved = false));
//       setFeedbackSuggestions(suggestions);

//       // Immediately highlight them
//       highlightSnippets(suggestions);
//     } catch (err: any) {
//       console.error("Error generating feedback:", err);
//       alert("Error generating feedback: " + err.message);
//     } finally {
//       setFeedbackLoading(false);
//     }
//   };

//   // On hover, highlight that snippet more strongly
//   const handleSuggestionHover = (sugId?: string) => {
//     highlightSnippets(feedbackSuggestions, sugId);
//   };

//   // Mark a suggestion resolved => remove highlight
//   const markResolved = (id: string) => {
//     const updated = feedbackSuggestions.map((sug) =>
//       sug.id === id ? { ...sug, resolved: true } : sug
//     );
//     setFeedbackSuggestions(updated);
//     highlightSnippets(updated);
//   };

//   // ─────────────────────────────────────────────────────────────────
//   // CHAT TAB
//   // ─────────────────────────────────────────────────────────────────
//   const handleChatSubmit = async () => {
//     const prohibitedPhrases = ["write an essay", "entire essay", "full essay"];
//     if (
//       prohibitedPhrases.some((phrase) =>
//         chatInput.toLowerCase().includes(phrase)
//       )
//     ) {
//       alert("Requests for a full essay are not allowed.");
//       return;
//     }

//     // Add user message
//     const newMessages = [...chatMessages, { sender: "user", text: chatInput }];
//     setChatMessages(newMessages);

//     setChatLoading(true);
//     try {
//       const response = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ prompt: chatInput }),
//       });
//       if (!response.ok) {
//         const errText = await response.text();
//         console.error("Chat error detail:", errText);
//         throw new Error(`Chat failed with status ${response.status}`);
//       }

//       const data = await response.json();
//       const aiReply = data.response || "No response.";
//       setChatMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
//     } catch (err: any) {
//       console.error("Error in chat request:", err);
//       alert("Error in chat request: " + err.message);
//     } finally {
//       setChatLoading(false);
//       setChatInput("");
//     }
//   };

//   // ─────────────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────────────
//   return (
//     <div className="flex flex-col w-full h-full text-black">
//       {/* Tab buttons */}
//       <div className="flex border-b border-gray-200 mb-2">
//         <button
//           onClick={() => switchTab("FEEDBACK")}
//           className={`flex-1 py-2 font-semibold text-center ${
//             activeTab === "FEEDBACK"
//               ? "border-b-2 border-blue-500 text-blue-600"
//               : "hover:bg-gray-100 text-black"
//           }`}
//         >
//           Feedback
//         </button>
//         <button
//           onClick={() => switchTab("CHAT")}
//           className={`flex-1 py-2 font-semibold text-center ${
//             activeTab === "CHAT"
//               ? "border-b-2 border-blue-500 text-blue-600"
//               : "hover:bg-gray-100 text-black"
//           }`}
//         >
//           Chat
//         </button>
//       </div>

//       {/* Show "Processing..." if either tab is loading */}
//       {(feedbackLoading || chatLoading) && (
//         <div className="text-center text-blue-600 mb-1 whitespace-nowrap">
//           Processing...
//         </div>
//       )}

//       {/* FEEDBACK TAB CONTENT */}
//       {activeTab === "FEEDBACK" && (
//         <div className="flex-1 overflow-auto p-3 border rounded bg-white">
//           <h2 className="font-bold text-lg mb-2">Generate Feedback</h2>
//           <p className="text-gray-700 mb-2">
//             Score: <span className="font-semibold">{score}</span>
//           </p>

//           <label className="block text-black font-medium mb-1">
//             Upload Markscheme (Optional):
//           </label>
//           <input
//             type="file"
//             className="border p-1 rounded mb-3"
//             onChange={handleMarkschemeUpload}
//           />

//           {/* Generate Feedback */}
//           <div className="flex items-center gap-4">
//             <button
//               onClick={handleGenerateFeedback}
//               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 whitespace-nowrap"
//             >
//               Generate Feedback
//             </button>
//           </div>

//           {/* Display the “highlighted” essay text in a read-only box */}
//           <div className="mt-4 border rounded p-2 bg-gray-50">
//             <h3 className="font-semibold mb-1">Highlighted Essay (Read-Only)</h3>
//             <div
//               className="text-sm leading-relaxed text-black"
//               dangerouslySetInnerHTML={{ __html: displayedEssay }}
//             />
//           </div>

//           {/* Suggestions list */}
//           <div className="mt-4">
//             {feedbackSuggestions.length > 0 && (
//               <div className="font-bold mb-2">Suggestions:</div>
//             )}
//             {feedbackSuggestions.map((sug) => (
//               <div
//                 key={sug.id}
//                 className={`p-2 border rounded mb-2 transition-colors ${
//                   sug.resolved
//                     ? "bg-gray-200 text-gray-500"
//                     : "bg-gray-50 text-black hover:bg-gray-100"
//                 }`}
//                 onMouseEnter={() => handleSuggestionHover(sug.id)}
//                 onMouseLeave={() => handleSuggestionHover(undefined)}
//               >
//                 <div className="font-semibold">
//                   Snippet: <em>{sug.snippet}</em>
//                 </div>
//                 <div className="mt-1 text-sm">{sug.advice}</div>

//                 {!sug.resolved && (
//                   <button
//                     className="mt-2 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
//                     onClick={() => markResolved(sug.id)}
//                   >
//                     Mark Resolved
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* CHAT TAB CONTENT */}
//       {activeTab === "CHAT" && (
//         <div className="flex flex-col flex-1 p-3 border rounded bg-white">
//           <h2 className="font-bold text-lg mb-2">Chat</h2>
//           <div className="flex-1 border rounded p-2 overflow-auto bg-gray-50 mb-2">
//             {chatMessages.length === 0 && (
//               <div className="text-gray-400 italic">
//                 Ask me anything (but not for a full essay)...
//               </div>
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
//                       : "bg-gray-200 text-black"
//                   }`}
//                 >
//                   {msg.text}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Chat input */}
//           <div className="flex items-center">
//             <input
//               type="text"
//               className="flex-1 border rounded p-2 mr-2 text-black"
//               placeholder="Type here..."
//               value={chatInput}
//               onChange={(e) => setChatInput(e.target.value)}
//             />
//             <button
//               onClick={handleChatSubmit}
//               className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 whitespace-nowrap"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useState, ChangeEvent, useEffect } from "react";

interface Suggestion {
  id: string;
  snippet: string;
  advice: string;
  resolved: boolean;
}

export default function TabsPanel({ essay }: { essay: string }) {
  const [activeTab, setActiveTab] = useState<"FEEDBACK" | "CHAT">("FEEDBACK");

  // -- FEEDBACK STATE --
  const [markscheme, setMarkscheme] = useState("");
  const [score, setScore] = useState("N/A");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [displayedEssay, setDisplayedEssay] = useState(essay);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // -- CHAT STATE --
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // If the user changes the essay in the left <textarea>, reset displayedEssay here
  useEffect(() => {
    setDisplayedEssay(essay);
    setSuggestions([]); // discard old suggestions so we don't highlight stale text
  }, [essay]);

  function switchTab(tab: "FEEDBACK" | "CHAT") {
    setActiveTab(tab);
  }

  //──────────────────────────────────────────────────────────
  // FEEDBACK LOGIC
  //──────────────────────────────────────────────────────────
  const handleMarkschemeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      const text = await e.target.files[0].text();
      setMarkscheme(text);
    } catch (err) {
      alert("Failed to read markscheme: " + (err as Error).message);
    }
  };

  const handleGenerateFeedback = async () => {
    if (!essay.trim()) {
      alert("No essay text found. Please paste or upload first.");
      return;
    }
    setFeedbackLoading(true);

    try {
      const res = await fetch("/api/generateFeedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay, markscheme }),
      });
      if (!res.ok) {
        const errorMsg = await res.text();
        console.error("generateFeedback error detail:", errorMsg);
        throw new Error("Request failed with " + res.status);
      }

      const data = await res.json();
      setScore(data.score || "N/A");

      const newSugs = data.suggestions || [];
      for (let s of newSugs) {
        s.resolved = false;
      }
      setSuggestions(newSugs);

      // highlight them in displayedEssay
      highlightSnippets(newSugs);
    } catch (err: any) {
      console.error("Error generating feedback:", err);
      alert("Error generating feedback: " + err.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  /**
   * highlightSnippets() – go through each unresolved snippet, 
   * wrap it in <mark> in displayedEssay.
   */
  function highlightSnippets(
    suggestionList: Suggestion[],
    hoveringId?: string
  ) {
    let text = essay;

    // filter out resolved
    const active = suggestionList.filter((s) => !s.resolved);

    // sort by snippet length desc (so we replace longer matches first)
    active.sort((a, b) => b.snippet.length - a.snippet.length);

    for (const sug of active) {
      // naive approach: only replace first occurrence (case-insensitive)
      const snippetRegex = new RegExp(sug.snippet, "i");
      const colorClass = hoveringId === sug.id ? "bg-yellow-300" : "bg-yellow-100";
      text = text.replace(
        snippetRegex,
        `<mark class="${colorClass}">${sug.snippet}</mark>`
      );
    }

    setDisplayedEssay(text);
  }

  // Hover -> highlight snippet more strongly
  const handleHoverSuggestion = (id?: string) => {
    highlightSnippets(suggestions, id);
  };

  // Mark resolved => remove highlight
  const markResolved = (id: string) => {
    const updated = suggestions.map((sug) =>
      sug.id === id ? { ...sug, resolved: true } : sug
    );
    setSuggestions(updated);
    highlightSnippets(updated);
  };

  //──────────────────────────────────────────────────────────
  // CHAT LOGIC
  //──────────────────────────────────────────────────────────
  const handleChatSubmit = async () => {
    const prohibited = ["write an essay", "entire essay", "full essay"];
    if (prohibited.some((p) => chatInput.toLowerCase().includes(p))) {
      alert("Requests for a full essay are not allowed!");
      return;
    }

    const newMessages = [...chatMessages, { sender: "user", text: chatInput }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: chatInput }),
      });
      if (!resp.ok) {
        const e = await resp.text();
        console.error("Chat error detail:", e);
        throw new Error("Chat failed: " + resp.status);
      }
      const data = await resp.json();
      const aiReply = data.response || "No response.";
      setChatMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
    } catch (err: any) {
      console.error("Error in chat request:", err);
      alert("Error in chat request: " + err.message);
    } finally {
      setChatLoading(false);
      setChatInput("");
    }
  };

  //──────────────────────────────────────────────────────────
  // RENDER
  //──────────────────────────────────────────────────────────
  const isLoading = feedbackLoading || chatLoading;

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

      {isLoading && (
        <div className="text-center text-blue-600 mb-1">Processing...</div>
      )}

      {/* FEEDBACK TAB */}
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

          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerateFeedback}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
            >
              Generate Feedback
            </button>
          </div>

          {/* Display the essay with highlights */}
          <div className="mt-4 p-2 border bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Essay (with highlights)</h3>
            <div
              dangerouslySetInnerHTML={{ __html: displayedEssay }}
              className="text-sm leading-relaxed"
            />
          </div>

          {/* Show suggestions */}
          <div className="mt-4">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                className={`p-2 border rounded mb-2 ${
                  sug.resolved
                    ? "bg-gray-200 text-gray-500"
                    : "bg-white hover:bg-gray-100 text-black"
                }`}
                onMouseEnter={() => handleHoverSuggestion(sug.id)}
                onMouseLeave={() => handleHoverSuggestion(undefined)}
              >
                <strong>Snippet:</strong> <em>{sug.snippet}</em>
                <br />
                <strong>Advice:</strong> {sug.advice}
                {!sug.resolved && (
                  <button
                    onClick={() => markResolved(sug.id)}
                    className="ml-3 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
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
                Ask your question (but not for a full essay)...
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
