"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

interface Session {
  id: string;
  title: string;
  updatedAt: string;
  feedback: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    // Fetch sessions from API
    async function fetchSessions() {
      try {
        setLoading(true);
        const res = await fetch("/api/sessions");
        const data = await res.json();
        
        if (data.sessions) {
          setSessions(data.sessions);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [status, session, router]);

  // Create a new session
  const createNewSession = async () => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay: "" }),
      });
      
      const data = await res.json();
      
      if (data.sessionId) {
        router.push(`/${data.sessionId}`);
      }
    } catch (error) {
      console.error("Error creating new session:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Dashboard</h1>

      {/* Search & New Session */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-3 rounded w-full pl-10"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

        <button 
          onClick={createNewSession}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          New Session
        </button>
      </div>

      {/* Sessions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-8">
            No sessions found. Create a new session to get started.
          </p>
        ) : (
          sessions
            .filter((session) =>
              session.title.toLowerCase().includes(search.toLowerCase())
            )
            .map((session) => (
              <Link key={session.id} href={`/${session.id}`}>
                <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg dark:bg-gray-800 transition">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{session.title}</h2>
                  <p className="text-sm text-gray-500">Last updated: {session.updatedAt}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{session.feedback} feedback comments</p>
                </div>
              </Link>
            ))
        )}
      </div>
    </div>
  );
}