import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { fetchRepository } from "@/lib/github";
import { analyzeCode } from "@/lib/gemini";
import { cacheManager } from "@/lib/redis";

const prisma = new PrismaClient();

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

export async function POST(request: NextRequest) {
  try {
    // Get user ID from token
    const userId = getUserFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { repoUrl } = await request.json();

    if (!repoUrl) {
      return NextResponse.json(
        { message: "Repository URL is required" },
        { status: 400 }
      );
    }

    // Extract repo name from URL
    const repoName = repoUrl.split('/').pop() || repoUrl;

    // Check if analysis already exists in cache
    const cachedAnalysis = await cacheManager.checkCache(repoUrl, 'repository');
    
    if (cachedAnalysis) {
      console.log('Using cached analysis for repository:', repoUrl);
      
      // Store analysis in database for history tracking
      const analysis = await prisma.analysis.create({
        data: {
          repoUrl,
          repoName,
          userId,
          summary: cachedAnalysis.summary,
          features: cachedAnalysis.features,
          architecture: cachedAnalysis.architecture,
          codeStats: cachedAnalysis.codeStats,
        },
      });
      
      return NextResponse.json(
        { 
          message: "Analysis retrieved from cache",
          analysisId: analysis.id
        },
        { status: 200 }
      );
    }
    
    // Fetch repository structure
    const repoData = await fetchRepository(repoUrl);
    
    // Analyze code with Gemini API
    const analysisResult = await analyzeCode(repoData.structure);
    
    // Store analysis in database
    const analysis = await prisma.analysis.create({
      data: {
        repoUrl,
        repoName,
        userId,
        summary: analysisResult.summary,
        features: analysisResult.features,
        architecture: analysisResult.architecture,
        codeStats: analysisResult.codeStats,
      },
    });

    // Store analysis items
    for (const item of analysisResult.items || []) {
      await prisma.analysisItem.create({
        data: {
          analysisId: analysis.id,
          path: item.path,
          type: item.type,
          summary: item.summary,
          content: item.content,
          features: item.features,
          complexity: item.complexity,
        },
      });
    }

    // Store analysis in cache for future requests
    await cacheManager.storeInCache(
      repoUrl,
      'repository',
      analysisResult
    );
    
    return NextResponse.json(
      { 
        message: "Analysis completed successfully",
        analysisId: analysis.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { message: "An error occurred during repository analysis" },
      { status: 500 }
    );
  }
}
