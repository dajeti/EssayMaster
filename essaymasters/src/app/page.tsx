"use client"; // 👈 This ensures the component runs on the client side

import { useState } from "react";
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/16/solid";
import { ThemeProvider } from "next-themes";

import Header from "./Components/Header"; 

export default function Home() {
  const [inputText, setInputText] = useState(""); // Stores user input
  const [outputText, setOutputText] = useState(""); // Stores AI response

  // Function to send text to AI API
  const queryAI = async (prompt: string) => {
    if (!inputText.trim()) {
      alert("Please enter some text first.");
      return;
    }
  
    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, inputText }),
      });
  
      const text = await response.text(); // Read response as text (to debug)
  
      console.log("API Raw Response:", text); // Log full response
  
      let data;
      try {
        data = JSON.parse(text); // Try to parse as JSON
      } catch (error) {
        console.error("JSON Parsing Error:", error);
        setOutputText("Error: API did not return valid JSON.");
        return;
      }
  
      if (!response.ok) {
        console.error("API Error Response:", data);
        setOutputText(`Error: ${data.error || "Unknown API error"}`);
        return;
      }
  
      setInputText(data.response || "No response from AI.");
    } catch (error) {
      console.error("Network or Server Error:", error);
      setOutputText(`Error: ${error.message}`);
    }
  };
  
  

  return (
    <ThemeProvider attribute="class">
      <div className="flex flex-col bg-white dark:bg-darker-custom items-center justify-center min-h-screen p-6">
        <Header />
        <main className="flex flex-col items-center mt-8 w-full">
          <div className="bg-blue-100 dark:bg-blue-custom-dark p-4 w-4/5 max-w-2xl rounded-lg shadow-lg">
            <h1 className="text-center text-lg font-bold text-blue-600 dark:text-white">Essay Master</h1>

            {/* Textarea for user input & AI output */}
            {/* <textarea
              rows={10}
              className="w-full mt-4 p-2 border text-black dark:text-white bg-white dark:bg-darker-custom rounded-lg"
              placeholder="Write or paste your essay here..."
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)}
            ></textarea> */}
            <textarea
              rows={10}
              className="w-full mt-4 p-2 border text-black dark:text-white bg-white dark:bg-darker-custom rounded-lg"
              placeholder="Write or paste your essay here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            ></textarea>

            {/* Show AI response separately */}
            {outputText && (
              <div className="mt-6 p-4 w-4/5 max-w-2xl bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-lg font-bold text-center text-gray-700 dark:text-white">Edited Text</h2>
                <p className="mt-2 text-gray-900 dark:text-white">{outputText}</p>
              </div>
            )}
            <div className="flex space-x-10 mt-4 justify-center">
              <button className="flex p-2 pl-6 pr-6 bg-blue-500 dark:bg-darker-custom text-white rounded-lg hover:bg-blue-600">
                Upload Essay
                <ArrowUpOnSquareIcon className="h-6 w-6 ml-2" />
              </button>
              <button className="flex p-2 pl-6 pr-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-darker-custom">
                Generate
                <SparklesIcon className="h-6 w-6 ml-2" />
              </button>
            </div>
          </div>

          {/* AI Enhancement Buttons */}
          <div className="flex flex-wrap space-x-4 mt-6">
            <button
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-custom-dark"
              onClick={() => queryAI("Rewrite the following text in a formal, academic tone:")}
            >
              Make it Formal
            </button>

            <button
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-custom-dark"
              onClick={() => queryAI("Rewrite the following text in a casual, conversational tone:")}
            >
              Make it Informal
            </button>

            <button
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-custom-dark"
              onClick={() => queryAI("Expand the following text by adding more detail and explanation while maintaining clarity:")}
            >
              Make it Longer
            </button>

            <button
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-custom-dark"
              onClick={() => queryAI("Condense the following text into a more concise version, preserving the main ideas:")}
            >
              Make it Shorter
            </button>

            <button
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-custom-dark"
              onClick={() => queryAI("Modify the following text based on user preferences:")}
            >
              Make it Custom
            </button>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
