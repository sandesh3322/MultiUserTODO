"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/components/auth/authcontext";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export default function LoginPage() {
  console.log('ENV CHECK:', process.env.NEXT_PUBLIC_BACKEND_URL);
  const router = useRouter();
  const { token, setToken } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (token) router.replace("/profile");
  }, [token, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
        email,
        password,
      });

      // Save tokens in localStorage and update context
      localStorage.setItem("token", res.data.result.token.token);
      localStorage.setItem("refreshToken", res.data.result.token.refreshToken);
      Cookies.set("token",res.data.result.token.token, {
      expires: 7,         // days
      path: "/",          // cookie available on all routes
      sameSite: "strict",
    } )
      setToken(res.data.result.token.token);

      toast.success(res.data.message || "Login successful", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => router.push("/profile"), 2000);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Login failed. Please check your credentials!";
      toast.error(message, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black">
      <h1 className="text-4xl font-bold mb-2 text-white">LOGIN</h1>
      <p className="text-gray-400 mb-6 text-center max-w-md">
        Login to access your Todo tasks and manage them efficiently.
      </p>

      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-gray-500"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-gray-500"
          required
        />

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className="flex-1 px-6 py-2 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition font-semibold"
          >
            Don’t have an account? Register
          </button>
        </div>
      </form>
    </div>
  );
}
