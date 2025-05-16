"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";

interface Analysis {
  id: string;
  repoName: string;
  repoUrl: string;
  createdAt: string;
  bookmarked: boolean;
}

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'bookmarked'>('all');
  const router = useRouter();

  // Fetch user's analysis history
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setLoading(true);
        // Add filter parameter if needed
        const url = filter === 'bookmarked' 
          ? "/api/history?bookmarked=true" 
          : "/api/history";
          
        const response = await fetch(url);
        
        if (!response.ok) {
          // If not authenticated, redirect to login
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch analysis history");
        }

        const data = await response.json();
        setAnalyses(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [router, filter]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    setIsAnalyzing(true);

    try {
      // This would be replaced with actual API call
      const response = await fetch("/api/repos/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Analysis failed");
      }

      // Redirect to analysis page
      router.push(`/analysis/${data.analysisId}`);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis");
      setIsAnalyzing(false);
    }
  };

  const toggleBookmark = async (analysisId: string, currentStatus: boolean) => {
    try {
      // This would be replaced with actual API call
      const response = await fetch(`/api/history/${analysisId}/bookmark`, {
        method: currentStatus ? "DELETE" : "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update bookmark");
      }

      // Update local state
      setAnalyses(analyses.map(analysis => 
        analysis.id === analysisId 
          ? { ...analysis, bookmarked: !currentStatus } 
          : analysis
      ));
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AuthLayout title="Dashboard">
      {/* Repository Analysis Form */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 mb-8 border border-[#333]">
        <h2 className="text-xl font-semibold mb-4">Analyze a Repository</h2>
        
        {error && (
          <div className="bg-[#3a1618] border border-[#ff3b3f] text-[#ff3b3f] px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Paste GitHub repository URL"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="flex-grow px-4 py-2 rounded-md bg-[#242424] border border-[#333] text-[#EDEDED] focus:outline-none focus:border-[#FF3B3F] focus:ring-1 focus:ring-[#FF3B3F]"
            required
          />
          <button
            type="submit"
            disabled={isAnalyzing}
            className="bg-[#FF3B3F] text-white px-6 py-2 rounded-md hover:bg-[#e03538] transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </button>
        </form>
      </div>

      {/* Analysis History */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#333]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Analysis History</h2>
          <div className="flex gap-4">
            <button 
              className={`text-sm transition-colors ${filter === 'all' ? 'text-[#FF3B3F]' : 'text-[#EDEDED] hover:text-[#FF3B3F]'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`text-sm transition-colors ${filter === 'bookmarked' ? 'text-[#FF3B3F]' : 'text-[#EDEDED] hover:text-[#FF3B3F]'}`}
              onClick={() => setFilter('bookmarked')}
            >
              Bookmarked
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF3B3F]"></div>
            <p className="mt-2 text-[#888888]">Loading...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-8 text-[#888888]">
            <p>
              {filter === 'bookmarked' 
                ? "No bookmarked analyses found." 
                : "No analysis history found. Analyze a repository to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#333] text-left">
                <tr>
                  <th className="pb-3 text-[#888888] font-medium">Repository</th>
                  <th className="pb-3 text-[#888888] font-medium">Date</th>
                  <th className="pb-3 text-[#888888] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((analysis) => (
                  <tr key={analysis.id} className="border-b border-[#333] hover:bg-[#242424]">
                    <td className="py-4">
                      <Link href={`/analysis/${analysis.id}`} className="text-[#EDEDED] hover:text-[#FF3B3F]">
                        {analysis.repoName}
                      </Link>
                      <p className="text-[#888888] text-sm truncate max-w-xs">{analysis.repoUrl}</p>
                    </td>
                    <td className="py-4 text-[#888888]">{formatDate(analysis.createdAt)}</td>
                    <td className="py-4">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => toggleBookmark(analysis.id, analysis.bookmarked)}
                          className={`p-1 rounded hover:bg-[#2a2a2a] ${analysis.bookmarked ? 'text-[#FF3B3F]' : 'text-[#888888]'}`}
                          title={analysis.bookmarked ? "Remove bookmark" : "Bookmark"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={analysis.bookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        <Link 
                          href={`/analysis/${analysis.id}`}
                          className="p-1 rounded text-[#888888] hover:text-[#EDEDED] hover:bg-[#2a2a2a]"
                          title="View analysis"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
