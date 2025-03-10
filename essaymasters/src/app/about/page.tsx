import { ThemeProvider } from "next-themes";

import React from "react";

import Header from "../Components/Header";

export default function Home() {
  return (
    <ThemeProvider attribute="class">
    <div className="flex flex-col bg-white dark:bg-darker-custom items-center justify-center min-h-screen p-6">

      <Header />
      
      <main className="flex flex-col items-center pt-12 w-96">
        <p className="flex flex-col items-center text-left text-lg text-black dark:text-white">
        EssayMaster is a web app that helps students improve their essay-writing with AI-powered feedback. 
        Users can upload essays as PDFs or text and choose from features like grammar, clarity, tone, and length. 
        It provides detailed feedback for each edit and grades essays across categories. A built-in scoring system tracks progress, 
        making learning measurable and rewarding.
        </p>

  
        
        <br /><h2 className="text-black dark:text-white">========================================</h2>

        <p className="flex pt-8 flex-col items-center text-left text-lg text-black dark:text-white">
        Need technical support or have suggestions to enhance your experience (and others&apos;)? Reach out to us at the following email address:
        </p>
        
        <a
          href="mailto:EssayMasters1@outlook.com"
          title="Email us"
          className="font-normal text-blue-500 flex flex-col items-center text-left text-lg pt-4 hover:underline"
        >
          EssayMasters1@outlook.com
        </a>

      </main>
    </div>
    </ThemeProvider>
  );
}