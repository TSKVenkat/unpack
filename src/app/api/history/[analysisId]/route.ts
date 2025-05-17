import { NextResponse } from 'next/server';
import { deleteAnalysis } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { analysisId: string } }
) {
  try {
    await deleteAnalysis(params.analysisId);
    return NextResponse.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
}
