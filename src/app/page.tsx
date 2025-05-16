import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-10 bg-[#121212] border-b border-[#2a2a2a]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">
              <span className="text-[#FF3B3F]">Un</span>pack
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[#EDEDED] hover:text-[#FF3B3F] transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-[#EDEDED] hover:text-[#FF3B3F] transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="text-[#EDEDED] hover:text-[#FF3B3F] transition-colors">
              Login
            </Link>
            <Link href="/register" className="bg-[#FF3B3F] text-white px-4 py-2 rounded-md hover:bg-[#e03538] transition-colors">
              Register
            </Link>
          </nav>
          <button className="md:hidden text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center items-center text-center px-4 py-20 bg-[#121212]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-[#FF3B3F]">Understand</span> any GitHub repository in minutes
          </h1>
          <p className="text-xl md:text-2xl text-[#EDEDED] mb-10 max-w-3xl mx-auto">
            Analyze GitHub repositories to get comprehensive code insights, summarizations, and architecture details
          </p>
          
          {/* Repository URL Input */}
          <div className="max-w-2xl mx-auto w-full mb-10">
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Paste GitHub repository URL" 
                className="flex-grow px-4 py-3 rounded-md bg-[#1e1e1e] border border-[#333] text-[#EDEDED] focus:outline-none focus:border-[#FF3B3F] focus:ring-1 focus:ring-[#FF3B3F]"
              />
              <button className="bg-[#FF3B3F] text-white px-6 py-3 rounded-md hover:bg-[#e03538] transition-colors font-medium">
                Analyze
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333]">
              <div className="text-[#FF3B3F] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Analysis</h3>
              <p className="text-[#888888]">Get detailed insights about any GitHub repository in just minutes, not hours.</p>
            </div>
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333]">
              <div className="text-[#FF3B3F] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Reports</h3>
              <p className="text-[#888888]">Get detailed summaries, architecture insights, and implementation details.</p>
            </div>
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333]">
              <div className="text-[#FF3B3F] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-[#888888]">Leverage advanced AI to understand code patterns, architecture, and features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-[#888888] py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-white">
                <span className="text-[#FF3B3F]">Un</span>pack
              </h2>
              <p className="mt-2">GitHub Code Analysis Platform</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-[#888888] hover:text-[#FF3B3F]">
                Terms
              </a>
              <a href="#" className="text-[#888888] hover:text-[#FF3B3F]">
                Privacy
              </a>
              <a href="#" className="text-[#888888] hover:text-[#FF3B3F]">
                Contact
              </a>
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
