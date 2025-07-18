"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaHospital, FaUserMd, FaHeartbeat } from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setLoading(false);
      alert("Login gagal!");
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-purple-500/10 text-6xl">
          <FaHospital />
        </div>
        <div className="absolute top-1/4 right-20 text-purple-500/10 text-5xl">
          <FaUserMd />
        </div>
        <div className="absolute bottom-20 left-1/3 text-purple-500/10 text-7xl">
          <FaHeartbeat />
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-purple-500/10 text-6xl">
          <FaHospital />
        </div>
      </div>
      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <FaHospital className="text-purple-400 text-5xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-purple-400">
            Hospital Portal
          </h1>
          <p className="text-purple-300/70 mt-2">
            Sign in to access your account
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-purple-500/20"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-purple-300 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-purple-300 mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-900 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
            >
              <FaUserMd className="text-lg" />
              Sign In
            </button>
          </div>
        </form>
      </div>
         
    </div>
  );
}
