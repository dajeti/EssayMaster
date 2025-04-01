"use client";

import React, { useState } from "react";
// import FeedbackTab from "./Feedback/FeedbackTab";
import FeedbackTab from "./FeedbackTab";
import ChatTab from "./ChatTab";

interface FeedbackSuggestion {
  id: string;
  snippet: string;
  advice: string;
  resolved: boolean;
}

interface TabsPanelProps {
  sessionId: string;
  essay: string;
  suggestions: FeedbackSuggestion[];
  onNewSuggestions: (newSuggestions: FeedbackSuggestion[]) => void;
  onToggleResolved: (sugId: string) => void;
  onHoverSuggestion: (sugId?: string) => void;
  setParentLoading: (val: boolean) => void;
}

export default function TabsPanel({
  sessionId,
  essay,
  suggestions,
  onNewSuggestions,
  onToggleResolved,
  onHoverSuggestion,
  setParentLoading
}: TabsPanelProps) {
  const [activeTab, setActiveTab] = useState<"FEEDBACK" | "CHAT">("FEEDBACK");

  function switchTab(tab: "FEEDBACK" | "CHAT") {
    setActiveTab(tab);
  }

  return (
    <div className="flex flex-col w-full h-full text-black dark:text-white">
      <div className="flex border-b border-gray-200 mb-2">
        <button
          onClick={() => switchTab("FEEDBACK")}
          className={`flex-1 py-2 font-semibold text-center ${
            activeTab === "FEEDBACK"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "hover:bg-gray-100 dark:hover:bg-blue-custom-dark rounded-md"
          }`}
        >
          Feedback
        </button>
        <button
          onClick={() => switchTab("CHAT")}
          className={`flex-1 py-2 font-semibold text-center ${
            activeTab === "CHAT"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "hover:bg-gray-100 dark:hover:bg-blue-custom-dark rounded-md"
          }`}
        >
          Chat
        </button>
      </div>

      {activeTab === "FEEDBACK" && (
        <FeedbackTab
          sessionId={sessionId}
          essay={essay}
          suggestions={suggestions}
          onNewSuggestions={onNewSuggestions}
          onToggleResolved={onToggleResolved}
          onHoverSuggestion={onHoverSuggestion}
          setParentLoading={setParentLoading}
        />
      )}
      {activeTab === "CHAT" && <ChatTab essay={essay} />}
    </div>
  );
}