import { NextResponse } from 'next/server';
import { getAnalysisStatus } from '@/lib/analysis';

export async function GET(
  request: Request,
  { params }: { params: { analysisId: string } }
) {
  try {
    const status = await getAnalysisStatus(params.analysisId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching analysis status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis status' },
      { status: 500 }
    );
  }
}
