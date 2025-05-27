"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";

interface AnalysisItem {
  id: string;
  path: string;
  type: "FILE" | "DIRECTORY";
  summary: string | null;
  content: string | null; // Only for files
  features: any | null; // JSON
  complexity: number | null; // Only for files
  createdAt: string;
}

interface Analysis {
  id: string;
  repoName: string;
  repoUrl: string;
  createdAt: string;
  summary: string;
  features: any; // JSON
  architecture: any; // JSON
  codeStats: any; // JSON
  bookmarked: boolean;
  analysisItems: AnalysisItem[]; // Add analysisItems here
}

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const params = useParams();
  const router = useRouter();
  const analysisId = params.analysisId as string;
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [selectedAnalysisItem, setSelectedAnalysisItem] = useState<AnalysisItem | null>(null);
  const [itemDetailLoading, setItemDetailLoading] = useState(false);
  const [itemDetailError, setItemDetailError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // This would be replaced with actual API call
        const response = await fetch(`/api/repos/${analysisId}`);
        
        if (!response.ok) {
          // If not authenticated, redirect to login
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch analysis");
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [analysisId, router]);

  const toggleBookmark = async () => {
    if (!analysis) return;

    try {
      // This would be replaced with actual API call
      const response = await fetch(`/api/history/${analysisId}/bookmark`, {
        method: analysis.bookmarked ? "DELETE" : "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update bookmark");
      }

      // Update local state
      setAnalysis({
        ...analysis,
        bookmarked: !analysis.bookmarked
      });
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  const handleExport = async (format: 'pdf' | 'md') => {
    if (!analysis) return;

    try {
      const exportUrl = `/api/repos/${analysisId}/export?format=${format}`;
      // Trigger download by navigating to the URL
      window.open(exportUrl, '_blank');
    } catch (err: any) {
      setError(err.message || `An error occurred during ${format} export`);
    }
  };

  const handleReanalyze = async () => {
    if (!analysis) return;

    setIsReanalyzing(true);
    setError(""); // Clear previous errors

    try {
      const response = await fetch("/api/repos/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: analysis.repoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Re-analysis failed");
      }

      // Redirect to the new analysis page
      router.push(`/analysis/${data.analysisId}`);
    } catch (err: any) {
      setError(err.message || "An error occurred during re-analysis");
      setIsReanalyzing(false);
    }
  };

  const handleItemClick = async (item: AnalysisItem) => {
    if (selectedAnalysisItem?.id === item.id) {
      // Deselect if already selected
      setSelectedAnalysisItem(null);
      setItemDetailError(null);
      return;
    }

    setSelectedAnalysisItem(null); // Clear previous selection
    setItemDetailLoading(true);
    setItemDetailError(null);

    try {
      const endpoint = item.type === 'FILE' ? `/api/repos/${analysisId}/file?path=${encodeURIComponent(item.path)}` : `/api/repos/${analysisId}/directory?path=${encodeURIComponent(item.path)}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch ${item.type.toLowerCase()} details`);
      }

      const data = await response.json();
      // Update the selected item with full details. Ensure complexity is handled correctly if it's null.
      setSelectedAnalysisItem({ ...item, ...data, complexity: data.complexity !== undefined ? data.complexity : item.complexity });

    } catch (err: any) {
      console.error(`Error fetching ${item.type.toLowerCase()} details:`, err);
      setItemDetailError(err.message || `An error occurred while fetching ${item.type.toLowerCase()} details`);
    } finally {
      setItemDetailLoading(false);
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
    <AuthLayout>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF3B3F]"></div>
          <p className="ml-4 text-[#EDEDED]">Loading analysis...</p>
        </div>
      ) : error ? (
        <div className="bg-[#3a1618] border border-[#ff3b3f] text-[#ff3b3f] px-6 py-4 rounded">
          <p>{error}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-white hover:underline">
            Return to Dashboard
          </Link>
        </div>
      ) : analysis ? (
        <>
          {/* Analysis Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{analysis.repoName}</h1>
                <button 
                  onClick={toggleBookmark}
                  className={`p-1 rounded hover:bg-[#2a2a2a] ${analysis.bookmarked ? 'text-[#FF3B3F]' : 'text-[#888888]'}`}
                  title={analysis.bookmarked ? "Remove bookmark" : "Bookmark"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={analysis.bookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <p className="text-[#888888] mt-1">
                <a href={analysis.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF3B3F]">
                  {analysis.repoUrl}
                </a>
              </p>
              <p className="text-[#888888] mt-1">Analyzed on {formatDate(analysis.createdAt)}</p>
            </div>
            <div className="flex gap-3">
              <button 
                className="bg-[#242424] hover:bg-[#2a2a2a] text-[#EDEDED] px-4 py-2 rounded-md transition-colors"
                onClick={() => handleExport('pdf')}
              >
                Export PDF
              </button>
              {/* Optionally add a dropdown for other formats */}
              <button 
                className="bg-[#FF3B3F] hover:bg-[#e03538] text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                onClick={handleReanalyze}
                disabled={isReanalyzing}
              >
                {isReanalyzing ? "Re-analyzing..." : "Re-analyze"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#333] mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("summary")}
                className={`py-4 px-1 font-medium border-b-2 ${
                  activeTab === "summary"
                    ? "border-[#FF3B3F] text-[#FF3B3F]"
                    : "border-transparent text-[#888888] hover:text-[#EDEDED]"
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab("features")}
                className={`py-4 px-1 font-medium border-b-2 ${
                  activeTab === "features"
                    ? "border-[#FF3B3F] text-[#FF3B3F]"
                    : "border-transparent text-[#888888] hover:text-[#EDEDED]"
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab("architecture")}
                className={`py-4 px-1 font-medium border-b-2 ${
                  activeTab === "architecture"
                    ? "border-[#FF3B3F] text-[#FF3B3F]"
                    : "border-transparent text-[#888888] hover:text-[#EDEDED]"
                }`}
              >
                Architecture
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`py-4 px-1 font-medium border-b-2 ${
                  activeTab === "stats"
                    ? "border-[#FF3B3F] text-[#FF3B3F]"
                    : "border-transparent text-[#888888] hover:text-[#EDEDED]"
                }`}
              >
                Code Stats
              </button>
              <button
                onClick={() => setActiveTab("items")}
                className={`py-4 px-1 font-medium border-b-2 ${
                  activeTab === "items"
                    ? "border-[#FF3B3F] text-[#FF3B3F]"
                    : "border-transparent text-[#888888] hover:text-[#EDEDED]"
                }`}
              >
                Files & Directories
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#333]">
            {activeTab === "summary" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Repository Summary</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-[#EDEDED] whitespace-pre-line">{analysis.summary}</p>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.features.map((feature: any, index: number) => (
                    <div key={index} className="bg-[#242424] p-4 rounded-lg border border-[#333]">
                      <h3 className="text-lg font-medium mb-2">{feature.name}</h3>
                      <p className="text-[#EDEDED]">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "architecture" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Architecture</h2>
                <div className="prose prose-invert max-w-none">
                  <pre className="bg-[#242424] p-4 rounded-lg overflow-x-auto">
                    <code>{JSON.stringify(analysis.architecture, null, 2)}</code>
                  </pre>
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Code Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#242424] p-4 rounded-lg border border-[#333]">
                    <h3 className="text-lg font-medium mb-2">Languages</h3>
                    <div className="space-y-2">
                      {Object.entries(analysis.codeStats.languages || {}).map(([lang, percentage]: [string, any]) => (
                        <div key={lang} className="flex justify-between items-center">
                          <span className="text-[#EDEDED]">{lang}</span>
                          <span className="text-[#888888]">{percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#242424] p-4 rounded-lg border border-[#333]">
                    <h3 className="text-lg font-medium mb-2">File Count</h3>
                    <div className="space-y-2">
                      {Object.entries(analysis.codeStats.fileCount || {}).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-[#EDEDED]">{type}</span>
                          <span className="text-[#888888]">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#242424] p-4 rounded-lg border border-[#333]">
                    <h3 className="text-lg font-medium mb-2">Lines of Code</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[#EDEDED]">Total</span>
                        <span className="text-[#888888]">{analysis.codeStats.totalLines || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#EDEDED]">Code</span>
                        <span className="text-[#888888]">{analysis.codeStats.codeLines || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#EDEDED]">Comments</span>
                        <span className="text-[#888888]">{analysis.codeStats.commentLines || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#EDEDED]">Blank</span>
                        <span className="text-[#888888]">{analysis.codeStats.blankLines || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "items" && analysis.analysisItems && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Analyzed Files and Directories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#242424] p-4 rounded-lg border border-[#333] max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-medium mb-3">Items</h3>
                    <ul>
                      {analysis.analysisItems.map(item => (
                        <li 
                          key={item.id}
                          className={`cursor-pointer text-sm py-1 truncate ${selectedAnalysisItem?.id === item.id ? 'text-[#FF3B3F]' : 'text-[#EDEDED] hover:text-[#FF3B3F]'}`}
                          onClick={() => handleItemClick(item)}
                        >
                          {item.type === 'DIRECTORY' ? '📁 ' : '📄 '}{item.path}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#242424] p-4 rounded-lg border border-[#333]">
                    <h3 className="text-lg font-medium mb-3">Selected Item Details</h3>
                    {itemDetailLoading ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#FF3B3F]"></div>
                        <p className="mt-2 text-[#888888]">Loading details...</p>
                      </div>
                    ) : itemDetailError ? (
                      <div className="text-[#ff3b3f]">
                        Error: {itemDetailError}
                      </div>
                    ) : selectedAnalysisItem ? (
                      <div>
                        <p className="text-[#EDEDED] font-semibold mb-2">Path: {selectedAnalysisItem.path}</p>
                        <p className="text-[#EDEDED] mb-4">Type: {selectedAnalysisItem.type}</p>
                        {selectedAnalysisItem.summary && (
                          <div className="mb-4">
                            <h4 className="text-md font-medium mb-1">Summary:</h4>
                            <p className="text-[#888888] whitespace-pre-line">{selectedAnalysisItem.summary}</p>
                          </div>
                        )}
                        {selectedAnalysisItem.type === 'FILE' && selectedAnalysisItem.complexity !== null && (
                          <p className="text-[#EDEDED] mb-4">Complexity Score: {selectedAnalysisItem.complexity !== undefined ? selectedAnalysisItem.complexity : 'N/A'}</p>
                        )}
                        {selectedAnalysisItem.features && Object.keys(selectedAnalysisItem.features).length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-md font-medium mb-1">Features:</h4>
                            {Array.isArray(selectedAnalysisItem.features) ? (
                              <ul className="list-disc list-inside text-[#888888]">
                                {selectedAnalysisItem.features.map((feature: any, idx: number) => (
                                  <li key={idx}><span className="font-medium text-[#EDEDED]">{feature.name}:</span> {feature.description}</li>
                                ))}
                              </ul>
                            ) : (Object.keys(selectedAnalysisItem.features).length > 0 && (
                               <pre className="bg-[#1a1a1a] p-2 rounded-md text-xs overflow-x-auto"><code>{JSON.stringify(selectedAnalysisItem.features, null, 2)}</code></pre>
                            ))}
                          </div>
                        )}
                        {selectedAnalysisItem.type === 'FILE' && selectedAnalysisItem.content && (
                          <div className="mb-4">
                            <h4 className="text-md font-medium mb-1">Content (Snippet):</h4>
                             <pre className="bg-[#1a1a1a] p-2 rounded-md text-xs overflow-x-auto max-h-40"><code>{selectedAnalysisItem.content.substring(0, 500)}...</code></pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[#888888]">Select an item from the list to view details.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </AuthLayout>
  );
}
