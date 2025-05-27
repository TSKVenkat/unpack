import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { callGeminiAPI } from '@/lib/gemini';

export async function POST(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    // Authenticate user
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = authResult.user;

    // Parse body
    const { query } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Fetch analysis for context
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: params.analysisId,
        userId: user!.id,
      },
      include: {
        analysisItems: true,
      },
    });
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Build context string for Gemini
    const context = `Repository: ${analysis.repoName}\nSummary: ${analysis.summary}\nFeatures: ${JSON.stringify(analysis.features)}\nArchitecture: ${JSON.stringify(analysis.architecture)}\nCode Stats: ${JSON.stringify(analysis.codeStats)}\n`;

    // Compose prompt
    const prompt = `You are an expert code analysis assistant. Given the following repository analysis context, answer the user's question as helpfully as possible.\n\nContext:\n${context}\n\nUser question: ${query}`;

    // Call Gemini API
    const answer = await callGeminiAPI(prompt);

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error('Custom query error:', error);
    return NextResponse.json({ error: 'Failed to process custom query' }, { status: 500 });
  }
} 