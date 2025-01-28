// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="https://nextjs.org/icons/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
//               src/app/page.tsx
//             </code>
//             .
//           </li>
//           <li>Save and see your changes instantly.</li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="https://nextjs.org/icons/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }


import React from "react";

import Header from "./Components/Header";

export default function Home() {
  return (
    <div className="flex flex-col bg-white items-center justify-center min-h-screen p-6">

<Header />

      {/* <header className="w-full flex justify-between items-center p-4 bg-blue-500 text-white">
        <img src="/favicon.ico" alt="Logo" className="w-10 h-10" />
        <nav className="flex space-x-4">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">FAQ</a>
        </nav>
        <div className="flex space-x-4">
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">☀️</button>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">👤</button>
        </div>
      </header> */}

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
