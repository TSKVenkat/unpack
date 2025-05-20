import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";



// Add bookmark
export async function POST(
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
    
    // Check if analysis exists and belongs to user
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId: user.id as string,
      },
    });
    
    if (!analysis) {
      return NextResponse.json(
        { message: "Analysis not found" },
        { status: 404 }
      );
    }
    
    // Update bookmark status
    const updatedAnalysis = await prisma.analysis.update({
      where: {
        id: analysisId,
      },
      data: {
        bookmarked: true,
      },
    });
    
    return NextResponse.json(updatedAnalysis, { status: 200 });
  } catch (error) {
    console.error("Bookmark error:", error);
    return NextResponse.json(
      { message: "An error occurred while bookmarking the analysis" },
      { status: 500 }
    );
  }
}

// Remove bookmark
export async function DELETE(
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
    
    // Check if analysis exists and belongs to user
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId: user.id as string,
      },
    });
    
    if (!analysis) {
      return NextResponse.json(
        { message: "Analysis not found" },
        { status: 404 }
      );
    }
    
    // Update bookmark status
    const updatedAnalysis = await prisma.analysis.update({
      where: {
        id: analysisId,
      },
      data: {
        bookmarked: false,
      },
    });
    
    return NextResponse.json(updatedAnalysis, { status: 200 });
  } catch (error) {
    console.error("Unbookmark error:", error);
    return NextResponse.json(
      { message: "An error occurred while removing the bookmark" },
      { status: 500 }
    );
  }
}
