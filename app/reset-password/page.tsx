"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "token">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message + " Token: " + data.token);
        setToken(data.token);
        setStep("token");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Server not reachable");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Server not reachable");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-4xl font-bold text-center text-black">Reset Password</h1>

        {message && (
          <div className="mb-4 rounded bg-green-100 p-3 text-green-700 text-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700 text-lg">
            {error}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleForgotPassword}>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-blue-600 p-3 text-xl font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Token"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="mb-1 block text-xl font-bold text-black">Reset Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="w-full rounded border border-gray-300 p-3 text-lg text-black focus:border-blue-500 focus:outline-none"
                placeholder="Paste your token here"
              />
            </div>
            <div className="mb-6">
              <label className="mb-1 block text-xl font-bold text-black">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded border border-gray-300 p-3 text-lg text-black focus:border-blue-500 focus:outline-none"
                placeholder="Enter new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-green-600 p-3 text-xl font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-lg">
          <a href="/login" className="text-blue-600 font-bold hover:underline">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}
