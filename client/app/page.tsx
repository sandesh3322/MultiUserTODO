"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to Todo App</h1>
      <p className="text-gray-600 mb-6">
        Simple and fast task manager built with Next.js + Node.js + MongoDB
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/auth/register")}
          className="px-6 py-2 bg-black text-white rounded-lg hover:text-gray-700 hover:bg-white hover:border hover:cursor-pointer"
        >
          Register
        </button>

        <button
          onClick={() => router.push("/auth/login")}
          className="px-6 py-2 border border-black rounded-lg hover:text-white hover:bg-black hover:cursor-pointer "
        >
          Login
        </button>
      </div>
    </div>
  );
}
