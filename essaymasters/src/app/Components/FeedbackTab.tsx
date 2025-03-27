"use client";


import React, { useState, useEffect } from "react";


interface FeedbackSuggestion {
 id: string;
 snippet: string;
 advice: string;
 resolved: boolean;
}


export default function FeedbackTab({ essay }: { essay: string }) {
 // -------------------------
 // FEEDBACK tab state
 // -------------------------
 const [score, setScore] = useState("N/A");
 const [markscheme, setMarkscheme] = useState("");
 const [suggestions, setSuggestions] = useState<FeedbackSuggestion[]>([]);
 // We'll keep a read-only “highlighted” version of the essay
 const [highlightedEssay, setHighlightedEssay] = useState(essay);


 const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);


 // If user edits the essay in the left area, discard old suggestions
 // and reset the highlight text:
 useEffect(() => {
   setHighlightedEssay(essay);
   setSuggestions([]);
 }, [essay]);


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


 // (Optional) Markscheme upload logic
 async function handleMarkschemeUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
 function highlightSnippets(sugList: FeedbackSuggestion[], hoveringId?: string) {
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
     const colorClass = hoveringId === sug.id ? "bg-yellow-300" : "bg-yellow-100";


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


 return (
   <div className="flex-1 overflow-auto p-3 border rounded bg-white">
     {isFeedbackLoading && (
       <div className="text-center text-blue-600 mb-2">Processing...</div>
     )}


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
 );
}
