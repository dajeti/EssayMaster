'use client';  // This is necessary to make it a client-side component

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";  // Use Next.js router to redirect

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();  // Next.js router for navigation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use NextAuth's signIn method to authenticate
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Don't redirect automatically, we'll handle that
    });

    if (!result?.error) {
      // If authentication is successful, redirect to the home page
      router.push("/");  
    } else {
      // If login failed, show an error message
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {/* Login button */}
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-lg">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
