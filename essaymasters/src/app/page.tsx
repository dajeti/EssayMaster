"use client";

import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/16/solid";
import { ThemeProvider } from "next-themes";
import React from "react";
import Header from "./Components/Header";
import EssayForm from "./Components/EssayForm";
import TabsPanel from "./Components/TabsPanel";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login"); // Redirect to login if not logged in
    }
  }, [status, router]);

  if (status === "loading") return <p>Loading...</p>; // Show loading while checking auth

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-darker-custom">
      <Header />
      <main className="flex-1 flex justify-center p-6">
        <EssayForm />
      </main>
    </div>
  );
}

// export default function Home() {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const sessionId = searchParams.get('sessionId'); // Get sessionId from query parameters
//   const [session, setSession] = useState(null);

//   // Fetch session data if resuming a session
//   useEffect(() => {
//     if (sessionId) {
//       fetch(`/api/sessions/${sessionId}`)
//         .then((res) => res.json())
//         .then((data) => setSession(data));
//     }
//   }, [sessionId]);

//   return (
//     <ThemeProvider attribute="class">
//       <div className="flex flex-col min-h-screen bg-white dark:bg-darker-custom">
//         <Header />
//         <main className="flex-1 flex justify-center p-6">
//           <EssayForm session={session} sessionId={sessionId} />
//         </main>
//       </div>
//     </ThemeProvider>
//   );
// }