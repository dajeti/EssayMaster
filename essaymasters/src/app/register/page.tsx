'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!firstName || !lastName || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }
  
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
  
      const result = await response.json();
      if (response.ok) {
        alert("Registration successful!");
        router.push("/login");
      } else {
        alert("Registration failed: " + (result.error || result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name input */}
          <input
            type="text"
            placeholder="First Name"
            className="w-full p-2 border rounded-lg"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {/* Last Name input */}
          <input
            type="text"
            placeholder="Last Name"
            className="w-full p-2 border rounded-lg"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {/* Email input */}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {/* Password input */}
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Register button */}
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-lg">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}