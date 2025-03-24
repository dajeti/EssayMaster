// /app/api/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Retrieve all sessions
export async function GET(request: NextRequest) {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format sessions for dashboard display
    const formattedSessions = sessions.map(session => {
      // Create a title from the first ~50 chars of the essay
      const title = session.essay
        ? session.essay.substring(0, 50).trim() + (session.essay.length > 50 ? '...' : '')
        : 'Untitled Essay';
      
      // Count feedback items (this is simplified)
      const feedbackCount = session.feedback ? 
        session.feedback.split('\n').filter(line => line.trim().length > 0).length : 
        0;
      
      return {
        id: session.id,
        title,
        updatedAt: session.updatedAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
        feedback: feedbackCount
      };
    });

    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error("Error retrieving sessions:", error);
    return NextResponse.json({ error: "Failed to retrieve sessions" }, { status: 500 });
  }
}

// POST: Create a new session
export async function POST(request: NextRequest) {
  try {
    const { essay, markScheme } = await request.json();
    
    const newSession = await prisma.session.create({
      data: {
        essay: essay || "",
        chat: [],
        feedback: "",
        markScheme: markScheme || null
      },
    });

    return NextResponse.json({ 
      success: true, 
      sessionId: newSession.id
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}