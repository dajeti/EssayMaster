"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./Components/Header";
import EssayForm from "./Components/EssayForm";

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Retrieve session ID from localStorage
    const storedSessionId = localStorage.getItem("currentSessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      // If no session ID, create a new session (optional)
      createNewSession();
    }
  }, []);

  const createNewSession = async () => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay: "" }),
      });

      const data = await res.json();

      if (data.sessionId) {
        localStorage.setItem("currentSessionId", data.sessionId);
        setSessionId(data.sessionId);
      }
    } catch (error) {
      console.error("Error creating new session:", error);
    }
  };

  if (!sessionId) return <p className="color black center align text">Loading session...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-darker-custom">
      <Header />
      <main className="flex-1 flex justify-center p-6">
        {/* Pass sessionId to EssayForm */}
        <EssayForm sessionId={sessionId} />
      </main>
    </div>
  );
}

