// File: /app/api/sessions/[sessionId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// PUT: Update a specific session
export async function PUT(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Get the server session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user by email to get their ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sessionId = params.sessionId;
    const { title } = await req.json();

    // Update the session, ensuring it belongs to the current user
    const updatedSession = await prisma.session.updateMany({
      where: { 
        id: sessionId,
        userId: user.id
      },
      data: {
        title: title || "Untitled Session",
        updatedAt: new Date()
      }
    });

    if (updatedSession.count === 0) {
      return NextResponse.json({ error: "Session not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Session updated successfully",
      success: true
    });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}