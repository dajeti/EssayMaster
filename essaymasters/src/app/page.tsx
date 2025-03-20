import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/16/solid";
import { ThemeProvider } from "next-themes";
import React from "react";
import Header from "./Components/Header";
import EssayForm from "./Components/EssayForm";

// export default function Home() {
//   return (
//     <ThemeProvider attribute="class">
//       <div className="flex flex-col bg-white dark:bg-darker-custom items-center justify-center min-h-screen p-6">
//         <main className="flex-1 flex flex-col">
//           <Header />
//           <div className="p-10">
//             <EssayForm/>
//           </div>
//         </main>`
//       </div>
//     </ThemeProvider>
//   );
// }

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <header className="w-full flex justify-between items-center p-4 bg-blue-500 text-white">
        <img src="/favicon.ico" alt="Logo" className="w-10 h-10" />
        <nav className="TabBtn space-between flex space-x-10">
          <a href="#" id="HomePage" className="hover:underline">Home</a>
          <a href="#" id="AboutPage" className="hover:underline">About</a>
          <a href="#" id="FaqPage" className="hover:underline">FAQ</a>
        </nav>
        <div className="flex space-x-4">
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">☀️</button>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">👤</button>
        </div>
      </header>

      <main className="flex flex-col items-center mt-8 w-full">
        <div className="bg-blue-100 p-4 w-4/5 max-w-2xl rounded-lg shadow-lg">
          <h1 className="text-center text-lg font-bold text-blue-600">Essay Master</h1>
          <textarea
            rows={10}
            className="w-full mt-4 p-2 border rounded-lg"
            placeholder="Write or paste your essay here..."
          ></textarea>
          <div className="flex space-x-2 mt-4 justify-between">
            <button className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Upload Essay</button>
            <button className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Generate</button>
          </div>
        </div>

        <div className="flex flex-wrap space-x-4 mt-6">
          <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Make it Formal</button>
          <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Make it Informal</button>
          <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Make it Longer</button>
          <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Make it Shorter</button>
          <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Make it Custom</button>
        </div>
      </main>
    </div>
  );
}



// export default function About() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-6">
//       <header className="w-full flex justify-between items-center p-4 bg-blue-500 text-white">
//         <img src="/favicon.ico" alt="Logo" className="w-10 h-10" />
//         <nav className="flex space-x-4">
//           <a href="/" className="hover:underline">Home</a>
//           <a href="/about" className="hover:underline font-bold">About</a>
//           <a href="/faq" className="hover:underline">FAQ</a>
//         </nav>
//         <div className="flex space-x-4">
//           <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">☀️</button>
//           <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">👤</button>
//         </div>
//       </header>

//       <main className="flex flex-col items-center mt-8 w-full max-w-2xl text-center">
//         <p className="mb-4">
//           Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
//           incididunt ut labore et dolore magna aliqua.
//         </p>
//         <p className="mb-4">
//           Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
//           ex ea commodo consequat.
//         </p>
//         <p className="mb-8">
//           Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
//           fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
//           culpa qui officia deserunt mollit anim id est laborum.
//         </p>
//         <p className="mb-4">
//           If you need technical support, please contact us at:
//         </p>
//         <a
//           href="mailto:EssayMasterITSupport@gmail.com"
//           className="text-blue-500 hover:underline font-bold mb-8"
//         >
//           EssayMasterITSupport@gmail.com
//         </a>
//         <div className="flex space-x-6">
//           <a href="#" className="text-2xl">📷</a>
//           <a href="#" className="text-2xl">▶️</a>
//           <a href="#" className="text-2xl">🔗</a>
//         </div>
//       </main>
//     </div>
//   );
// }
