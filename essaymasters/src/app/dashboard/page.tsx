"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState([
    { id: "1", title: "My Essay on AI", updatedAt: "2024-03-23", feedback: 3 },
    { id: "2", title: "Shakespeare Analysis", updatedAt: "2024-03-20", feedback: 1 },
  ]); // Replace with DB fetch

  useEffect(() => {
    if (status === "loading") return; // Wait until session loads
    if (!session) {
      router.push("/login");
    }
  }, [status, session, router]);

  if (status === "loading") return <p>Loading...</p>;

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

        <Link href="/">
          <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center">
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            New Session
          </button>
        </Link>
      </div>

      {/* Sessions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions
          .filter((session) =>
            session.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((session) => (
            <Link key={session.id} href={`/editor/${session.id}`}>
              <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg dark:bg-gray-800 transition">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{session.title}</h2>
                <p className="text-sm text-gray-500">Last updated: {session.updatedAt}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{session.feedback} feedback comments</p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}