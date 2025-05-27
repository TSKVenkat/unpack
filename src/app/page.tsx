import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";

const categories = [
  { label: "All", value: "all" },
  { label: "AI", value: "ai" },
  { label: "Frontend", value: "frontend" },
  { label: "Backend", value: "backend" },
  { label: "DevOps", value: "devops" },
  { label: "Docs", value: "docs" },
];

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-playfulRed" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    ),
    title: "Fast Analysis",
    desc: "Get detailed insights about any GitHub repository in just minutes, not hours."
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-playfulRed" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    ),
    title: "Comprehensive Reports",
    desc: "Get detailed summaries, architecture insights, and implementation details."
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-playfulRed" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
    ),
    title: "AI-Powered Insights",
    desc: "Leverage advanced AI to understand code patterns, architecture, and features."
  },
];

export default function Home() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-playfulWhite">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-10 bg-playfulWhite border-b border-playfulGray">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-playfulBlack">
              <span className="text-playfulRed">Un</span>pack
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-playfulBlack hover:text-playfulRed transition-colors font-medium">
              Home
            </Link>
            <Link href="/dashboard" className="text-playfulBlack hover:text-playfulRed transition-colors font-medium">
              Dashboard
            </Link>
            <Link href="/login" className="text-playfulBlack hover:text-playfulRed transition-colors font-medium">
              Login
            </Link>
            <Link href="/register" className="bg-playfulRed text-white px-4 py-2 rounded-full hover:bg-red-500 transition-colors font-bold">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center items-center text-center px-4 py-20 relative overflow-hidden">
        {/* Playful background shapes */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-playfulPink rounded-full opacity-40 blur-2xl z-0" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-playfulPurple rounded-full opacity-40 blur-2xl z-0" />
        <div className="max-w-4xl mx-auto z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-playfulBlack">
            <span className="text-playfulRed">Understand</span> any GitHub repository in minutes
          </h1>
          <p className="text-2xl text-playfulGray mb-10 max-w-3xl mx-auto">
            Analyze GitHub repositories to get comprehensive code insights, summarizations, and architecture details.
          </p>
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto w-full mb-8">
            <Input
              icon={<FiSearch />}
              placeholder="Search public repositories or paste a GitHub URL..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              fullWidth
            />
          </div>
          {/* Category Chips */}
          <Tabs
            tabs={categories}
            value={category}
            onChange={v => setCategory(v)}
            className="justify-center mb-12"
          />
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-8">
            {features.map((f, i) => (
              <Card key={i} className="flex flex-col items-center text-center bg-white border-0">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-playfulBlack">{f.title}</h3>
                <p className="text-playfulGray">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-playfulBlack text-playfulGray py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-white">
                <span className="text-playfulRed">Un</span>pack
              </h2>
              <p className="mt-2">GitHub Code Analysis Platform</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-playfulGray hover:text-playfulRed">Terms</a>
              <a href="#" className="text-playfulGray hover:text-playfulRed">Privacy</a>
              <a href="#" className="text-playfulGray hover:text-playfulRed">Contact</a>
            </div>
          </div>
          <div className="mt-6 text-center md:text-left">
            <p>© {new Date().getFullYear()} Unpack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
