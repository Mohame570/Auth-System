"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/home");
    } catch {
      setError("Server not reachable");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-4xl font-bold text-center text-black">Login</h1>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700 text-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-xl font-bold text-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border border-gray-300 p-3 text-lg text-black focus:border-blue-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-xl font-bold text-black">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded border border-gray-300 p-3 text-lg text-black focus:border-blue-500 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 p-3 text-xl font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Log In"}
          </button>
        </form>

        <p className="mt-4 text-center text-lg">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-2 text-center text-lg">
          <Link href="/reset-password" className="text-red-600 font-bold hover:underline">
            Forgot Password?
          </Link>
        </p>
      </div>
    </div>
  );
}
