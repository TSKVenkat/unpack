import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { fetchDirectoryContents } from '@/lib/github';
import { analyzeDirectory } from '@/lib/gemini';
import { cacheManager } from '@/lib/redis';

export async function POST(
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

    // Get directory path from request body
    const { dirPath } = await request.json();

    if (!dirPath) {
      return NextResponse.json({ error: 'Directory path is required' }, { status: 400 });
    }

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
    const cachedAnalysis = await cacheManager.checkCache(analysis.repoUrl, 'directory', dirPath);
    if (cachedAnalysis) {
      return NextResponse.json(cachedAnalysis);
    }

    // Fetch directory contents from GitHub
    const directoryContents = await fetchDirectoryContents(analysis.repoUrl, dirPath);
    
    if (!directoryContents || directoryContents.length === 0) {
      return NextResponse.json({ error: 'Directory not found or empty' }, { status: 404 });
    }

    // Analyze directory with Gemini API
    const directoryAnalysis = await analyzeDirectory(directoryContents, dirPath, analysis.repoUrl);

    // Store analysis in database
    const analysisItem = await prisma.analysisItem.create({
      data: {
        analysisId,
        path: dirPath,
        type: 'DIRECTORY',
        summary: directoryAnalysis.summary,
        features: directoryAnalysis.features,
      },
    });

    // Store in cache
    await cacheManager.storeInCache(analysis.repoUrl, 'directory', {
      ...directoryAnalysis,
      id: analysisItem.id,
      path: dirPath,
      createdAt: analysisItem.createdAt,
    }, dirPath);

    return NextResponse.json({
      ...directoryAnalysis,
      id: analysisItem.id,
      path: dirPath,
      createdAt: analysisItem.createdAt,
    });
  } catch (error) {
    console.error('Error analyzing directory:', error);
    return NextResponse.json(
      { error: 'Failed to analyze directory' },
      { status: 500 }
    );
  }
}

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

    // Get directory path from query params
    const url = new URL(request.url);
    const dirPath = url.searchParams.get('path');

    if (!dirPath) {
      return NextResponse.json({ error: 'Directory path is required' }, { status: 400 });
    }

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
    const cachedAnalysis = await cacheManager.checkCache(analysis.repoUrl, 'directory', dirPath);
    if (cachedAnalysis) {
      return NextResponse.json(cachedAnalysis);
    }

    // Check if directory analysis exists in database
    const analysisItem = await prisma.analysisItem.findFirst({
      where: {
        analysisId,
        path: dirPath,
        type: 'DIRECTORY',
      },
    });

    if (!analysisItem) {
      return NextResponse.json({ error: 'Directory analysis not found' }, { status: 404 });
    }

    const directoryAnalysis = {
      id: analysisItem.id,
      path: analysisItem.path,
      summary: analysisItem.summary,
      features: analysisItem.features,
      createdAt: analysisItem.createdAt,
    };

    // Store in cache
    await cacheManager.storeInCache(analysis.repoUrl, 'directory', directoryAnalysis, dirPath);

    return NextResponse.json(directoryAnalysis);
  } catch (error) {
    console.error('Error fetching directory analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch directory analysis' },
      { status: 500 }
    );
  }
}
