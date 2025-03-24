"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { data: session, status, update } = useSession();


  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);



  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      email: email,
      password: password,
      redirect: true,
      callbackUrl: "/dashboard" // Where to redirect after successful login
    });

    // Handle errors if needed (when redirect: false)
    if (!result?.ok) {
      // Show error message
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded-lg text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-500 hover:underline text-white p-2 rounded-lg text-black">
            Login
          </button>
        </form>
        <h2 className="mt-4 text-center">
          <a
            href="/register"
            className="text-black hover:underline hover:text-blue-500"
          >
            New here? Click here to create an account
          </a>
        </h2>

      </div >
    </div >
  );
}
