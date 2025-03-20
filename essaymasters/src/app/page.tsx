import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/16/solid";
import { ThemeProvider } from "next-themes";
import React from "react";
import Header from "./Components/Header";
import EssayForm from "./Components/EssayForm";


export default function Home() {
  return (
    <ThemeProvider attribute="class">
      <div className="flex flex-col min-h-screen bg-white dark:bg-darker-custom">
        <Header />
        <main className="flex-1 flex justify-center p-6">
          <EssayForm />
        </main>
      </div>
    </ThemeProvider>
  );
}

