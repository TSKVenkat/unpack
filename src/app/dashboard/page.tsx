"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Loader, Skeleton } from "@/components/ui/Loader";
import { useToast, ToastProvider } from "@/components/ui/Toast";
import { FiSearch, FiBookmark, FiTrash2, FiExternalLink } from "react-icons/fi";
import { Onboarding } from "@/components/ui/Onboarding";

interface Analysis {
  id: string;
  repoName: string;
  repoUrl: string;
  createdAt: string;
  bookmarked: boolean;
}

function DashboardContent() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'bookmarked'>('all');
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { showToast } = useToast();

  // Helper to attempt token refresh and retry request
  const attemptTokenRefreshAndRetry = async (originalRequest: () => Promise<Response>): Promise<Response> => {
    try {
      const refreshResponse = await fetch("/api/auth/refresh", {
        method: "POST",
      });

      if (!refreshResponse.ok) {
        // If refresh fails, redirect to login
        router.push("/login");
        throw new Error("Could not refresh token.");
      }

      // If refresh is successful, retry the original request
      const retryResponse = await originalRequest();
      return retryResponse;

    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      // Ensure redirection if refresh fails
      if (!window.location.pathname.includes("/login")) {
         router.push("/login");
      }
      throw refreshError; // Re-throw to be caught by the original caller's catch block
    }
  };

  // Fetch user's analysis history
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setLoading(true);
        // Add filter parameter if needed
        const url = filter === 'bookmarked' 
          ? "/api/history?bookmarked=true" 
          : "/api/history";
          
        let response = await fetch(url);
        
        if (!response.ok) {
          // If not authenticated (401), attempt token refresh and retry
          if (response.status === 401) {
            console.log("Access token expired. Attempting refresh...");
            response = await attemptTokenRefreshAndRetry(() => fetch(url));
             if (!response.ok) {
                 // If retry still fails, handle error (will likely redirect to login)
                  throw new Error("Failed to fetch analysis history after refresh");
             }
          } else {
             // Handle other non-401 errors
             throw new Error(`Failed to fetch analysis history: ${response.statusText}`);
          }
        }

        const data = await response.json();
        setAnalyses(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        // If the error is due to failed refresh and redirect hasn't happened yet
         if (err.message !== "Could not refresh token." && !window.location.pathname.includes("/login")) {
           // Handle other errors
         }
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
      const originalRequest = () => fetch("/api/repos/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      });

      let response = await originalRequest();

       if (!response.ok) {
          if (response.status === 401) {
             console.log("Access token expired during analyze. Attempting refresh...");
             response = await attemptTokenRefreshAndRetry(originalRequest);
              if (!response.ok) {
                 throw new Error("Failed to analyze after refresh");
              }
           } else {
              throw new Error(`Analysis failed: ${response.statusText}`);
           }
        }

      const data = await response.json();

      // Redirect to analysis page
      router.push(`/analysis/${data.analysisId}`);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis");
      setIsAnalyzing(false);
    }
  };

  const toggleBookmark = async (analysisId: string, currentStatus: boolean) => {
    try {
      const originalRequest = () => fetch(`/api/history/${analysisId}/bookmark`, {
        method: currentStatus ? "DELETE" : "POST",
      });

      let response = await originalRequest();

      if (!response.ok) {
         if (response.status === 401) {
             console.log("Access token expired during bookmark toggle. Attempting refresh...");
             response = await attemptTokenRefreshAndRetry(originalRequest);
              if (!response.ok) {
                 throw new Error("Failed to toggle bookmark after refresh");
              }
           } else {
              throw new Error(`Failed to update bookmark: ${response.statusText}`);
           }
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

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (!confirm("Are you sure you want to delete this analysis?")) {
      return;
    }

    try {
      setLoading(true); // Or a specific loading state for deletion
      setError(""); // Clear previous errors

       const originalRequest = () => fetch(`/api/history/${analysisId}`, {
        method: "DELETE",
      });

      let response = await originalRequest();

      if (!response.ok) {
         if (response.status === 401) {
             console.log("Access token expired during delete. Attempting refresh...");
             response = await attemptTokenRefreshAndRetry(originalRequest);
              if (!response.ok) {
                 throw new Error("Failed to delete analysis after refresh");
              }
           } else {
              throw new Error(`Failed to delete analysis: ${response.statusText}`);
           }
        }

      // Remove the deleted analysis from the state
      setAnalyses(analyses.filter(analysis => analysis.id !== analysisId));
      
    } catch (err: any) {
      setError(err.message || "An error occurred during deletion");
    } finally {
      setLoading(false); // Or clear specific loading state
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

  const filteredAnalyses = analyses.filter(a =>
    (filter === 'all' || a.bookmarked) &&
    (a.repoName.toLowerCase().includes(search.toLowerCase()) || a.repoUrl.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative min-h-screen bg-playfulWhite pb-24">
      <div className="max-w-4xl mx-auto pt-10 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-playfulBlack">Your Repository Analyses</h1>
          <a href="/analysis/compare" className="inline-block px-4 py-2 border border-playfulGray rounded-md text-playfulGray hover:text-playfulRed hover:border-playfulRed transition mb-4 md:mb-0">Compare</a>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <Input
            icon={<FiSearch />}
            placeholder="Search analyses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            fullWidth
          />
          <Tabs
            tabs={[
              { label: "All", value: "all" },
              { label: "Bookmarked", value: "bookmarked" },
            ]}
            value={filter}
            onChange={v => setFilter(v as 'all' | 'bookmarked')}
          />
        </div>
        <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4 mb-10">
          <Input
            placeholder="Paste GitHub repository URL"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            fullWidth
          />
          <Button type="submit" loading={isAnalyzing} className="whitespace-nowrap">
            Analyze
          </Button>
        </form>
        {error && (
          <div className="mb-4"><Card className="bg-playfulRed text-white">{error}</Card></div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <Onboarding
            type="dashboard"
            onAction={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-playfulBlack">{analysis.repoName}</span>
                    {analysis.bookmarked && <FiBookmark className="text-playfulRed" />}
                  </div>
                  <div className="text-sm text-playfulGray mb-2 truncate">{analysis.repoUrl}</div>
                  <div className="text-xs text-playfulGray mb-4">Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                    onClick={() => router.push(`/analysis/${analysis.id}`)}
                  >
                    <FiExternalLink /> View
                  </Button>
                  <Button
                    variant={analysis.bookmarked ? "primary" : "outline"}
                    className="flex-1 flex items-center gap-2"
                    onClick={() => toggleBookmark(analysis.id, analysis.bookmarked)}
                  >
                    <FiBookmark />
                    {analysis.bookmarked ? "Unbookmark" : "Bookmark"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center gap-2 text-playfulRed border-playfulRed"
                    onClick={() => handleDeleteAnalysis(analysis.id)}
                  >
                    <FiTrash2 /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Button
        className="fixed bottom-8 right-8 shadow-playful text-lg px-8 py-4 z-40"
        variant="primary"
        onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
      >
        + Analyze New Repo
      </Button>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ToastProvider>
      <AuthLayout>
        <DashboardContent />
      </AuthLayout>
    </ToastProvider>
  );
}
