import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";



export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const analysisId = params.analysisId;
    
    // Get user from request
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Fetch analysis with items
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId: user.id as string,
      },
      include: {
        analysisItems: true,
      },
    });
    
    if (!analysis) {
      return NextResponse.json(
        { message: "Analysis not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    console.error("Analysis fetch error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the analysis" },
      { status: 500 }
    );
  }
}
