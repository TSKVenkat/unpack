"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { FiMail, FiLock, FiGithub } from "react-icons/fi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      showToast("Welcome back! Redirecting to dashboard...", "success");
      router.push("/dashboard");
    } catch (error: any) {
      showToast(error.message || "Login failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-playfulWhite flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-playfulBlack mb-2">
              Welcome Back!
            </h1>
            <p className="text-playfulGray">
              Sign in to continue analyzing repositories
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              icon={<FiMail />}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            <Input
              icon={<FiLock />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <Button
              type="submit"
              loading={loading}
              fullWidth
              className="mt-8"
            >
              Sign In
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-playfulGray"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-playfulGray">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <FiGithub className="w-5 h-5" />
              Continue with GitHub
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-playfulGray">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-playfulRed hover:text-red-600 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
