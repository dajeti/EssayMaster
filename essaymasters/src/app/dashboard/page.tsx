import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => res.json())
      .then((data) => setSessions(data));
  }, []);

  const filteredSessions = sessions.filter(session =>
    session.essay.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1>Your Sessions</h1>
      <input
        type="text"
        placeholder="Search essays..."
        className="w-full p-2 border rounded mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-3 gap-4">
        {filteredSessions.map(session => (
          <div key={session.id} className="p-4 bg-gray-200 rounded-lg cursor-pointer"
               onClick={() => router.push(`/editor?sessionId=${session.id}`)}>
            <h2>Session {session.id.slice(-5)}</h2>
            <p className="text-sm">{session.essay.slice(0, 50)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}
