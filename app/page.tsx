"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-black">Auth System</h1>
        <p className="mb-8 text-xl text-gray-600">Full Stack Authentication Project</p>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="rounded bg-blue-600 p-3 text-xl font-bold text-white hover:bg-blue-700"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded bg-green-600 p-3 text-xl font-bold text-white hover:bg-green-700"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
