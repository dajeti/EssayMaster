"use client";


import React, { useState } from "react";
import FeedbackTab from "./FeedbackTab";
import ChatTab from "./ChatTab";


// Just keep the tab switching in here
export default function TabsPanel({ essay }: { essay: string }) {
 const [activeTab, setActiveTab] = useState<"FEEDBACK" | "CHAT">("FEEDBACK");


 // Switch tabs
 function switchTab(tab: "FEEDBACK" | "CHAT") {
   setActiveTab(tab);
 }


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


     {/* Conditional rendering of subcomponents */}
     {activeTab === "FEEDBACK" && <FeedbackTab essay={essay} />}
     {activeTab === "CHAT" && <ChatTab essay={essay} />}
   </div>
 );
}
