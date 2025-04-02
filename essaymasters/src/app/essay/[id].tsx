"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EssayPage() {
  const [revisions, setRevisions] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    async function fetchRevisions() {
      const res = await fetch(`/api/essays/revisions?essayId=${id}`);
      const data = await res.json();
      setRevisions(data.revisions);
      setSelectedRevision(data.revisions[0]); // Default to first revision
    }
    fetchRevisions();
  }, [id]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Essay Revisions</h2>

      <div className="flex space-x-4">
        <div className="w-1/4">
          <h3 className="font-semibold mb-2">Versions</h3>
          {revisions.map((rev, index) => (
            <button 
              key={rev.id} 
              className={`block p-2 border rounded-lg ${rev.id === selectedRevision?.id ? "bg-gray-200" : ""}`}
              onClick={() => setSelectedRevision(rev)}
            >
              Version {index + 1}
            </button>
          ))}
        </div>

        <div className="w-3/4">
          {selectedRevision && (
            <div>
              <h3 className="text-lg font-semibold">Original:</h3>
              <p className="p-2 bg-gray-100 rounded-lg">{selectedRevision.original}</p>

              <h3 className="text-lg font-semibold mt-4">Revised:</h3>
              <p className="p-2 bg-gray-100 rounded-lg">{selectedRevision.revised}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
