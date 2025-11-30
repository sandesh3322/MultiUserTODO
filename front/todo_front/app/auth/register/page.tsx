"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/components/auth/authcontext";
import axios from "axios";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registered, setRegistered] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (token) router.push("/profile");
  }, [token, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    try {
        const res = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
    { name, email, password, confirmPassword },
    { headers: { "Content-Type": "application/json" } }
    );

      toast.success(res.data.message || "Registration successful!", {
        position: "top-right",
        autoClose: 4000,
      });

      // Set flag to show "activate your account" message
      setRegistered(true);
    } catch (err: any) {
      let msg: any=  err.response.data.result
      toast.error( Object.values(msg)[0] as string, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-black">
        <h1 className="text-4xl font-bold mb-4 text-white">CHECK YOUR EMAIL</h1>
        <p className="text-gray-400 mb-6">
          A verification link has been sent to <strong>{email}</strong>. Please
          activate your account before logging in.
        </p>
       <div className="flex gap-4">
         <button
          onClick={() => router.push("/auth/login")}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Go to Login
        </button>
        <button
          onClick={() => router.push("/auth/resendmail")}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Resend Mail
        </button>
       </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-black">
      <h1 className="text-4xl font-bold mb-4 text-white">REGISTER</h1>
      <p className="text-gray-400 mb-6">
        Create your account to manage your Todo tasks efficiently.
      </p>

      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-gray-500"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          required
        />

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:text-gray-700 hover:bg-blue-200 hover:border hover:cursor-pointer transition"
          >
            Register
          </button>

          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="px-6 py-2 border border-black rounded text-white hover:bg-black hover:cursor-pointer transition"
          >
            Already have an account? Login
          </button>
        </div>
      </form>
    </div>
  );
}
