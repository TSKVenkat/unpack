"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";
import { Onboarding } from "@/components/ui/Onboarding";
import { FiExternalLink, FiBookmark, FiDownload, FiShare2, FiMessageCircle, FiX } from "react-icons/fi";

interface Analysis {
  id: string;
  repoName: string;
  repoUrl: string;
  createdAt: string;
  summary: string;
  features: any[];
  architecture: any;
  codeStats: any;
  bookmarked: boolean;
  analysisItems?: any[];
}

export default function AnalysisDetail({ params }: { params: { id: string } }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const router = useRouter();
  const { showToast } = useToast();
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [customQuery, setCustomQuery] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const queryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [params.id]);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`/api/repos/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch analysis");
      const data = await response.json();
      setAnalysis(data);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async () => {
    if (!analysis) return;

    try {
      const response = await fetch(`/api/history/${analysis.id}/bookmark`, {
        method: analysis.bookmarked ? "DELETE" : "POST",
      });

      if (!response.ok) throw new Error("Failed to update bookmark");

      setAnalysis(prev => prev ? { ...prev, bookmarked: !prev.bookmarked } : null);
      showToast(
        analysis.bookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        "success"
      );
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const handleExport = async (format: "pdf" | "markdown") => {
    try {
      const response = await fetch(`/api/export/${analysis?.id}?format=${format}`);
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analysis-${analysis?.repoName}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast(`Analysis exported as ${format.toUpperCase()}`, "success");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const handleCustomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    setQueryLoading(true);
    setQueryResult(null);
    try {
      // TODO: Implement the backend endpoint /api/repos/[id]/custom-query
      const response = await fetch(`/api/repos/${params.id}/custom-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: customQuery }),
      });
      if (!response.ok) throw new Error("Failed to get answer");
      const data = await response.json();
      setQueryResult(data.answer || "No answer returned.");
    } catch (error: any) {
      setQueryResult(error.message || "An error occurred.");
    } finally {
      setQueryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-playfulWhite dark:bg-dark-bg flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-playfulWhite dark:bg-dark-bg py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Onboarding
            type="analysis"
            onAction={() => router.push("/dashboard")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-playfulWhite dark:bg-dark-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-playfulBlack dark:text-dark-text mb-2">
              {analysis.repoName}
            </h1>
            <p className="text-playfulGray dark:text-dark-textSecondary">
              Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open(analysis.repoUrl, "_blank")}
            >
              <FiExternalLink /> View Repository
            </Button>
            <Button
              variant={analysis.bookmarked ? "primary" : "outline"}
              className="flex items-center gap-2"
              onClick={toggleBookmark}
            >
              <FiBookmark />
              {analysis.bookmarked ? "Unbookmark" : "Bookmark"}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => handleExport("pdf")}
            >
              <FiDownload /> Export
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast("Link copied to clipboard", "success");
              }}
            >
              <FiShare2 /> Share
            </Button>
            <a href="/analysis/compare" className="inline-flex items-center gap-2 px-4 py-2 border border-playfulGray rounded-md text-playfulGray hover:text-playfulRed hover:border-playfulRed transition">
              Compare
            </a>
          </div>
        </div>

        <Tabs
          tabs={[
            { label: "Summary", value: "summary" },
            { label: "Features", value: "features" },
            { label: "Architecture", value: "architecture" },
            { label: "Code Stats", value: "stats" },
          ]}
          value={activeTab}
          onChange={setActiveTab}
          className="mb-8"
        />

        <Card className="p-6">
          {activeTab === "summary" && (
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">Repository Summary</h2>
              <p className="text-playfulGray dark:text-dark-textSecondary">
                {analysis.summary}
              </p>
            </div>
          )}

          {activeTab === "features" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.features.map((feature, index) => (
                  <Card key={index} className="p-4">
                    <h3 className="font-bold mb-2">{feature.name}</h3>
                    <p className="text-playfulGray dark:text-dark-textSecondary">
                      {feature.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Architecture Overview</h2>
              <div className="space-y-4">
                {Object.entries(analysis.architecture).map(([key, value]) => (
                  <div key={key}>
                    <h3 className="font-bold mb-2 capitalize">{key}</h3>
                    <p className="text-playfulGray dark:text-dark-textSecondary">
                      {value as string}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Code Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analysis.codeStats).map(([key, value]) => (
                  <Card key={key} className="p-4">
                    <h3 className="font-bold mb-2 capitalize">{key}</h3>
                    <p className="text-playfulGray dark:text-dark-textSecondary">
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : value as string}
                    </p>
                  </Card>
                ))}
              </div>
              {/* Show overall code quality/complexity/maintainability if present */}
              {analysis.codeStats && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-2">Quality Metrics</h3>
                  <div className="flex flex-wrap gap-4">
                    {analysis.codeStats.complexity && (
                      <div className="bg-playfulPink text-white rounded px-4 py-2 font-bold">Complexity: {analysis.codeStats.complexity}</div>
                    )}
                    {analysis.codeStats.quality && (
                      <div className="bg-playfulBlue text-white rounded px-4 py-2 font-bold">Quality: {analysis.codeStats.quality}</div>
                    )}
                    {analysis.codeStats.maintainability && (
                      <div className="bg-playfulGreen text-white rounded px-4 py-2 font-bold">Maintainability: {analysis.codeStats.maintainability}</div>
                    )}
                  </div>
                </div>
              )}
              {/* Per-file complexity/quality if available */}
              {Array.isArray(analysis.analysisItems) && analysis.analysisItems.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-2">File Complexity & Quality</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="px-2 py-1 text-left">File</th>
                          <th className="px-2 py-1 text-left">Complexity</th>
                          <th className="px-2 py-1 text-left">Quality</th>
                          <th className="px-2 py-1 text-left">Maintainability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.analysisItems.map((item: any) => (
                          <tr key={item.id} className={item.complexity > 0.7 ? "bg-playfulRed/10" : ""}>
                            <td className="px-2 py-1 font-mono">{item.path}</td>
                            <td className="px-2 py-1">{item.complexity !== undefined ? item.complexity : "-"}</td>
                            <td className="px-2 py-1">{item.features && item.features.quality ? item.features.quality : "-"}</td>
                            <td className="px-2 py-1">{item.features && item.features.maintainability ? item.features.maintainability : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
      {/* Custom Query Modal */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 w-full max-w-lg relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-playfulGray hover:text-playfulRed"
              onClick={() => setShowQueryModal(false)}
              aria-label="Close"
            >
              <FiX className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-playfulBlack dark:text-dark-text">Ask a Custom Question</h2>
            <form onSubmit={handleCustomQuery} className="flex flex-col gap-4">
              <input
                ref={queryInputRef}
                type="text"
                className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-playfulRed"
                placeholder="e.g. What is the main architectural pattern?"
                value={customQuery}
                onChange={e => setCustomQuery(e.target.value)}
                required
                autoFocus
              />
              <Button type="submit" loading={queryLoading} className="w-full">
                Ask
              </Button>
            </form>
            {queryResult && (
              <div className="mt-6 p-4 bg-playfulGray/10 rounded text-playfulBlack dark:text-dark-text">
                <h3 className="font-semibold mb-2">AI Answer:</h3>
                <p className="whitespace-pre-line">{queryResult}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Floating Action Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-playfulRed hover:bg-playfulPink text-white rounded-full shadow-playful p-4 flex items-center gap-2 text-lg focus:outline-none focus:ring-2 focus:ring-playfulRed"
        onClick={() => setShowQueryModal(true)}
        aria-label="Ask a custom question"
      >
        <FiMessageCircle className="w-6 h-6" />
        <span className="hidden md:inline">Ask</span>
      </button>
    </div>
  );
} 