import { Analysis } from '@/types/declarations';

export async function getRecentAnalyses(): Promise<Analysis[]> {
  try {
    const response = await fetch('/api/history');
    if (!response.ok) throw new Error('Failed to fetch recent analyses');
    return await response.json();
  } catch (error) {
    console.error('Error fetching recent analyses:', error);
    return [];
  }
}

export async function getBookmarkedAnalyses(): Promise<Analysis[]> {
  try {
    const response = await fetch('/api/history/bookmarked');
    if (!response.ok) throw new Error('Failed to fetch bookmarked analyses');
    return await response.json();
  } catch (error) {
    console.error('Error fetching bookmarked analyses:', error);
    return [];
  }
}

export async function toggleBookmark(analysisId: string): Promise<void> {
  try {
    const response = await fetch(`/api/history/${analysisId}/bookmark`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to toggle bookmark');
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
}

export async function exportAnalysis(analysisId: string, format: 'pdf' | 'markdown'): Promise<Blob> {
  try {
    const response = await fetch(`/api/repos/${analysisId}/export?format=${format}`);
    if (!response.ok) throw new Error('Failed to export analysis');
    return await response.blob();
  } catch (error) {
    console.error('Error exporting analysis:', error);
    throw error;
  }
}
