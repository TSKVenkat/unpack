"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // This would be replaced with actual API call
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Redirect to dashboard on successful login
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#121212]">
      {/* Header */}
      <header className="bg-[#121212] border-b border-[#2a2a2a]">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-white">
            <span className="text-[#FF3B3F]">Un</span>pack
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-[#1a1a1a] rounded-lg shadow-lg p-8 border border-[#333]">
            <h2 className="text-2xl font-bold text-white mb-6">Login to your account</h2>
            
            {error && (
              <div className="bg-[#3a1618] border border-[#ff3b3f] text-[#ff3b3f] px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-[#EDEDED] mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-[#242424] border border-[#333] text-[#EDEDED] focus:outline-none focus:border-[#FF3B3F] focus:ring-1 focus:ring-[#FF3B3F]"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-[#EDEDED] mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-[#242424] border border-[#333] text-[#EDEDED] focus:outline-none focus:border-[#FF3B3F] focus:ring-1 focus:ring-[#FF3B3F]"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF3B3F] text-white py-2 px-4 rounded-md hover:bg-[#e03538] transition-colors disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-[#888888]">
                Don't have an account?{" "}
                <Link href="/register" className="text-[#FF3B3F] hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
