"use client";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import fetchWithAuth from "@/lib/fetchWithAuth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const email = params.get("email") || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    const res = await fetchWithAuth("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      setError("Gagal reset password");
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  if (success)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900">
        <div className="p-8 text-center text-green-500 text-lg font-semibold bg-black/80 rounded-lg">
          Password berhasil diubah! Anda akan diarahkan ke halaman login...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900">
      <form
        onSubmit={handleSubmit}
        className="bg-black/80 p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-4 text-white">Reset Password</h2>
        <input
          type="password"
          placeholder="Password baru"
          className="w-full mb-3 p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <button
          type="submit"
          className="w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-800"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
