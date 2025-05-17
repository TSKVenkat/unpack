import { Analysis } from '@/types/declarations';
import { getAnalysisById } from '@/lib/prisma';
import redisClient from '@/lib/redis';

export type AnalysisStatus = {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
};

export async function getAnalysisStatus(analysisId: string): Promise<AnalysisStatus> {
  try {
    const analysis = await getAnalysisById(analysisId);

    if (!analysis) {
      throw new Error('Analysis not found');
    }

    // Check cache first
    const cachedStatus = await checkCacheStatus(analysisId);
    if (cachedStatus) {
      return cachedStatus;
    }

    // If analysis has summary and features, it's completed
    if (analysis.summary && analysis.features) {
      await updateCacheStatus(analysisId, {
        status: 'completed',
        progress: 100,
      });
      return {
        status: 'completed',
        progress: 100,
      };
    }

    // If analysis has been created but no summary, it's processing
    if (analysis.createdAt) {
      await updateCacheStatus(analysisId, {
        status: 'processing',
        progress: 50,
      });
      return {
        status: 'processing',
        progress: 50,
      };
    }

    // Default to pending
    await updateCacheStatus(analysisId, {
      status: 'pending',
      progress: 0,
    });
    return {
      status: 'pending',
      progress: 0,
    };
  } catch (error) {
    console.error('Error getting analysis status:', error);
    return {
      status: 'failed',
      progress: 0,
      message: 'Failed to get analysis status',
    };
  }
}

async function checkCacheStatus(analysisId: string): Promise<AnalysisStatus | null> {
  try {
    const status = await redisClient.get(`analysis:${analysisId}:status`);
    if (status) {
      return JSON.parse(status);
    }
    return null;
  } catch (error) {
    console.error('Error checking cache status:', error);
    return null;
  }
}

async function updateCacheStatus(analysisId: string, status: AnalysisStatus): Promise<void> {
  try {
    await redisClient.setex(`analysis:${analysisId}:status`, 3600, JSON.stringify(status));
  } catch (error) {
    console.error('Error updating cache status:', error);
  }
}
