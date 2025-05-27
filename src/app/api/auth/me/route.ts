import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Fetch user details from database (optional, if verifyAuth provides enough data)
    // Fetching from DB ensures we have the latest user data
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { // Select specific fields to return
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!userProfile) {
       // This case should ideally not happen if verifyAuth succeeds with a user
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching user profile" },
      { status: 500 }
    );
  }
} 