import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { fetchFileContent } from '@/lib/github';
import { analyzeFile } from '@/lib/gemini';
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

    // Get file path from request body
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
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
    const cachedAnalysis = await cacheManager.checkCache(analysis.repoUrl, 'file', filePath);
    if (cachedAnalysis) {
      return NextResponse.json(cachedAnalysis);
    }

    // Fetch file content from GitHub
    const fileContent = await fetchFileContent(analysis.repoUrl, filePath);
    
    if (!fileContent) {
      return NextResponse.json({ error: 'File not found or inaccessible' }, { status: 404 });
    }

    // Analyze file with Gemini API
    const fileAnalysis = await analyzeFile(fileContent, filePath, analysis.repoUrl);

    // Store analysis in database
    const analysisItem = await prisma.analysisItem.create({
      data: {
        analysisId,
        path: filePath,
        type: 'FILE',
        summary: fileAnalysis.summary,
        content: fileContent,
        features: fileAnalysis.features,
        complexity: fileAnalysis.complexity || 0,
      },
    });

    // Store in cache
    await cacheManager.storeInCache(analysis.repoUrl, 'file', {
      ...fileAnalysis,
      id: analysisItem.id,
      path: filePath,
      createdAt: analysisItem.createdAt,
    }, filePath);

    return NextResponse.json({
      ...fileAnalysis,
      id: analysisItem.id,
      path: filePath,
      createdAt: analysisItem.createdAt,
    });
  } catch (error) {
    console.error('Error analyzing file:', error);
    return NextResponse.json(
      { error: 'Failed to analyze file' },
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

    // Get file path from query params
    const url = new URL(request.url);
    const filePath = url.searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
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
    const cachedAnalysis = await cacheManager.checkCache(analysis.repoUrl, 'file', filePath);
    if (cachedAnalysis) {
      return NextResponse.json(cachedAnalysis);
    }

    // Check if file analysis exists in database
    const analysisItem = await prisma.analysisItem.findFirst({
      where: {
        analysisId,
        path: filePath,
        type: 'FILE',
      },
    });

    if (!analysisItem) {
      return NextResponse.json({ error: 'File analysis not found' }, { status: 404 });
    }

    const fileAnalysis = {
      id: analysisItem.id,
      path: analysisItem.path,
      summary: analysisItem.summary,
      content: analysisItem.content,
      features: analysisItem.features,
      complexity: analysisItem.complexity,
      createdAt: analysisItem.createdAt,
    };

    // Store in cache
    await cacheManager.storeInCache(analysis.repoUrl, 'file', fileAnalysis, filePath);

    return NextResponse.json(fileAnalysis);
  } catch (error) {
    console.error('Error fetching file analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file analysis' },
      { status: 500 }
    );
  }
}
