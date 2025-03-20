"use client";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  console.log("Session data:", session);
  console.log("Session status:", status);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome, {session?.user?.email || "Guest"}!</h1>
    </div>
  );
}
