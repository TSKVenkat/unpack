import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Analysis } from '@/types/declarations';
import { getRecentAnalyses, getBookmarkedAnalyses } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [bookmarkedAnalyses, setBookmarkedAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const [recent, bookmarked] = await Promise.all([
          getRecentAnalyses(),
          getBookmarkedAnalyses()
        ]);
        setRecentAnalyses(recent);
        setBookmarkedAnalyses(bookmarked);
      } catch (error) {
        console.error('Failed to fetch analyses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  const handleAnalysisClick = (analysisId: string) => {
    router.push(`/analysis/${analysisId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Analyses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
          {recentAnalyses.length === 0 ? (
            <p className="text-gray-500">No recent analyses yet</p>
          ) : (
            <div className="space-y-4">
              {recentAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  onClick={() => handleAnalysisClick(analysis.id)}
                  className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{analysis.repoName}</h3>
                      <p className="text-sm text-gray-500">{new Date(analysis.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle bookmark toggle
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {analysis.bookmarked ? '⭐' : '⭐️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarked Analyses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Bookmarked Analyses</h2>
          {bookmarkedAnalyses.length === 0 ? (
            <p className="text-gray-500">No bookmarked analyses yet</p>
          ) : (
            <div className="space-y-4">
              {bookmarkedAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  onClick={() => handleAnalysisClick(analysis.id)}
                  className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{analysis.repoName}</h3>
                      <p className="text-sm text-gray-500">{new Date(analysis.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle bookmark toggle
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {analysis.bookmarked ? '⭐' : '⭐️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
