import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cacheManager } from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = authResult.user;

    // Get analysis ID from params
    const { analysisId } = params;

    // Check if analysis exists and belongs to user
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId: user.id,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Check cache first
    const cachedAnalysis = await cacheManager.checkCache(analysis.repoUrl, 'repository');
    if (cachedAnalysis && cachedAnalysis.features) {
      return NextResponse.json({ features: cachedAnalysis.features });
    }

    return NextResponse.json({ features: analysis.features });
  } catch (error) {
    console.error('Error fetching analysis features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis features' },
      { status: 500 }
    );
  }
}
