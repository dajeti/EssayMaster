import { ThemeProvider } from "next-themes";

import React from "react";

import Header from "../Components/Header";

export default function Home() {
  return (
    <ThemeProvider attribute="class">
    <div className="flex flex-col bg-white dark:bg-darker-custom items-center justify-center min-h-screen p-6">

      <Header />

      <main className="flex flex-col items-center mt-8 w-96">
        <p className="flex flex-col items-center text-left text-lg text-black dark:text-white">
          Lorem ipsum dolor sit amet, consectetur
          adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>

        <p className="flex pt-4 flex-col items-center text-left text-lg text-black dark:text-white">
          Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>

        <p className="flex pt-4 flex-col items-center text-left text-lg text-black dark:text-white">
          Duis aute irure dolor in reprehenderit in voluptate
          velit esse cillum dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat non proident, sunt
          in culpa qui officia deserunt mollit anim id est laborum.
        </p>

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