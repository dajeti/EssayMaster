"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [essays, setEssays] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchEssays() {
      const res = await fetch("/api/essays/user");
      const data = await res.json();
      setEssays(data.essays);
    }
    fetchEssays();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Essays</h2>
      <div className="grid gap-4">
        {essays.map((essay) => (
          <div key={essay.id} className="p-4 bg-white shadow rounded-lg">
            <h3 className="font-semibold">{essay.title}</h3>
            <button 
              className="text-blue-500 mt-2" 
              onClick={() => router.push(`/essay/${essay.id}`)}
            >
              View Revisions
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
