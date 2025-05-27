"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";

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
}

export default function AnalysisCompare() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");
  const [analysisA, setAnalysisA] = useState<Analysis | null>(null);
  const [analysisB, setAnalysisB] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/history");
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setAnalyses(data);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (id: string, setAnalysis: (a: Analysis | null) => void) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/repos/${id}`);
      if (!response.ok) throw new Error("Failed to fetch analysis");
      const data = await response.json();
      setAnalysis(data);
    } catch (error: any) {
      showToast(error.message, "error");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedA) fetchAnalysis(selectedA, setAnalysisA);
  }, [selectedA]);
  useEffect(() => {
    if (selectedB) fetchAnalysis(selectedB, setAnalysisB);
  }, [selectedB]);

  return (
    <div className="min-h-screen bg-playfulWhite py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-playfulBlack mb-8 text-center">Compare Analyses</h1>
        <div className="flex flex-col md:flex-row gap-8 mb-8 justify-center">
          <div className="flex-1">
            <label className="block mb-2 text-playfulGray font-medium">Select Analysis A</label>
            <select
              className="w-full p-3 border rounded-md"
              value={selectedA}
              onChange={e => setSelectedA(e.target.value)}
            >
              <option value="">-- Select --</option>
              {analyses.map(a => (
                <option key={a.id} value={a.id}>{a.repoName} ({new Date(a.createdAt).toLocaleDateString()})</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-2 text-playfulGray font-medium">Select Analysis B</label>
            <select
              className="w-full p-3 border rounded-md"
              value={selectedB}
              onChange={e => setSelectedB(e.target.value)}
            >
              <option value="">-- Select --</option>
              {analyses.map(a => (
                <option key={a.id} value={a.id}>{a.repoName} ({new Date(a.createdAt).toLocaleDateString()})</option>
              ))}
            </select>
          </div>
        </div>
        {loading && <Loader />}
        {analysisA && analysisB && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {[analysisA, analysisB].map((a, idx) => (
              <Card key={a.id} className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-playfulBlack">{a.repoName}</h2>
                <p className="text-playfulGray mb-2">Analyzed on {new Date(a.createdAt).toLocaleDateString()}</p>
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Summary</h3>
                  <p className="text-playfulGray whitespace-pre-line">{a.summary}</p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Features</h3>
                  <ul className="list-disc list-inside text-playfulGray">
                    {a.features.map((f: any, i: number) => (
                      <li key={i}><span className="font-bold text-playfulBlack">{f.name}:</span> {f.description}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Architecture</h3>
                  <pre className="bg-gray-50 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(a.architecture, null, 2)}</pre>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Code Stats</h3>
                  <pre className="bg-gray-50 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(a.codeStats, null, 2)}</pre>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 