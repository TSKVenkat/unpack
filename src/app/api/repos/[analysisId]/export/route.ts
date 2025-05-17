import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/prisma';
import { generatePDF } from '@/lib/pdf';
import { generateMarkdown } from '@/lib/markdown';

export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const format = request.nextUrl.searchParams.get('format') || 'pdf';
    const analysis = await getAnalysisById(params.analysisId);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    let content: string | Uint8Array;
    let contentType: string;

    if (format === 'pdf') {
      content = await generatePDF(analysis);
      contentType = 'application/pdf';
    } else {
      content = generateMarkdown(analysis);
      contentType = 'text/markdown';
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=analysis-${analysis.id}.${format}`,
      },
    });
  } catch (error) {
    console.error('Error exporting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to export analysis' },
      { status: 500 }
    );
  }
}
