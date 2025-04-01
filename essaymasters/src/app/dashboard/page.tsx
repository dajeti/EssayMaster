"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, PlusCircleIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import Header from "../Components/Header";
// Enhanced interface to match both implementations
interface Session {
  id: string;
  title: string;
  updatedAt: string;
  feedback: number | any[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Consolidated authentication and session fetching logic
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    async function fetchSessions() {
      try {
        setLoading(true);
        const res = await fetch("/api/sessions");
        const data = await res.json();

        // Handle different API response structures
        const sessionsData = data.sessions || data;
        setSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [status, session, router]);

  // Function to open a session (passes session ID to maintain routing consistency)
  const openSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/open`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        router.push("/", { query: { sessionId } });
      } else {
        console.error("Failed to update session open time");
      }
    } catch (error) {
      console.error("Error updating session open time:", error);
    }
  };

  // Create new session function
  const createNewSession = async () => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay: "" }),
      });

      const data = await res.json();

      if (data.sessionId) {
        router.push("/", { query: { sessionId: data.sessionId } });
      }
    } catch (error) {
      console.error("Error creating new session:", error);
    }
  };

  // Rename file within session
  const editEssayName = async (sessionId: string) => {
    const newTitle = prompt("Enter the new essay title:");
    if (newTitle) {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle, updatedAt: new Date() }), // retrieve da
        });

        if (res.ok) {
          setSessions((prev) =>
            prev.map((session) =>
              session.id === sessionId ? { ...session, title: newTitle } : session
            )
          );
          alert("Essay name updated successfully!");
        } else {
          console.error("Failed to update essay name");
        }
      } catch (error) {
        console.error("Error updating essay name:", error);
      }
    }
  };

  // Delete session function
  const deleteSession = async (sessionId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this session?");
    if (!confirmDelete) return;
    
    try {
      // Change this line to use query parameters as expected by the API
      const res = await fetch(`/api/sessions?sessionId=${sessionId}`, { method: "DELETE" });
  
      if (res.ok) {
        setSessions((prev) => prev.filter((session) => session.id !== sessionId));
      } else {
        console.error("Failed to delete session");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Filtered and sorted sessions
  const filteredSessions = Array.from(sessions)
    .filter((session) =>
      session.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <Header />
      <h1 className="pt-20 text-3xl font-bold text-gray-900 dark:text-white mb-4">Dashboard</h1>

      {/* Search & New Session */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-3 rounded w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

        <button
          onClick={createNewSession}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center transition"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          New Session
        </button>
      </div>

      {/* Sessions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-8">
            No sessions found. Create a new session to get started.
          </p>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 bg-white rounded-lg shadow hover:shadow-lg dark:bg-gray-800 transition"
            >
              <div className="flex justify-between items-center mb-2">
                <div
                  onClick={() => openSession(session.id)}
                  className="w-full cursor-pointer"
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {session.title || 'Untitled Session'}
                  </h2>
                </div>
                <button
                  onClick={() => editEssayName(session.id)}
                  className="ml-2 text-blue-600 hover:text-blue-800 transition"
                  aria-label="Edit Session"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteSession(session.id)}
                  className="ml-2 text-red-600 hover:text-red-800 transition"
                  aria-label="Delete Session"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(session.updatedAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Array.isArray(session.feedback)
                  ? session.feedback.length
                  : session.feedback || 0} feedback comments
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

