import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";



// Helper to extract user ID from JWT token
const getUserFromToken = (request: NextRequest) => {
  const accessToken = request.cookies.get("accessToken")?.value;
  
  if (!accessToken) {
    return null;
  }

  try {
    // This is a simplified version - in production, you would verify the token
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    return payload.id;
  } catch (error) {
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    // Get user ID from token
    const userId = getUserFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const bookmarked = url.searchParams.get("bookmarked") === "true";
    
    // Build query
    const query: any = {
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      }
    };
    
    // Filter by bookmarked if specified
    if (bookmarked) {
      query.where.bookmarked = true;
    }

    // Fetch user's analysis history
    const analyses = await prisma.analysis.findMany(query);

    return NextResponse.json(analyses, { status: 200 });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching analysis history" },
      { status: 500 }
    );
  }
}
