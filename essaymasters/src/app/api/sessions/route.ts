import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Retrieve sessions for the logged-in user
export async function GET(request: NextRequest) {
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

    // Retrieve sessions only for the logged-in user
    const sessions = await prisma.session.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format sessions for dashboard display
    const formattedSessions = sessions.map(session => {
      return {
        id: session.id,
        title: session.title || 'Untitled Session',
        updatedAt: session.updatedAt.toISOString(),
        feedback: session.feedback ? 
          session.feedback.split('\n').filter(line => line.trim().length > 0).length : 
          0
      };
    });

    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error("Error retrieving sessions:", error);
    return NextResponse.json({ error: "Failed to retrieve sessions" }, { status: 500 });
  }
}

// POST: Create a new session for the logged-in user
export async function POST(request: NextRequest) {
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

    const { essay, markScheme, title } = await request.json();
    
    const newSession = await prisma.session.create({
      data: {
        userId: user.id,
        essay: essay || "",
        title: title || "Untitled Session", // Use provided title or default
        chat: [], // Ensure this matches the Json type in your schema
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

// PUT: Update a session (for title updates)
export async function PUT(request: NextRequest) {
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

    // Get the session ID from the request
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const { title } = await request.json();

    // Update the session, ensuring it belongs to the current user
    await prisma.session.updateMany({
      where: { 
        id: sessionId,
        userId: user.id
      },
      data: {
        title: title || "Untitled Session",
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ message: "Session updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

// DELETE: Delete a session for the logged-in user
export async function DELETE(req: NextRequest) {
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

    // Get the session ID from the request
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Delete the session, ensuring it belongs to the current user
    await prisma.session.deleteMany({
      where: { 
        id: sessionId,
        userId: user.id
      },
    });

    return NextResponse.json({ message: "Session deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}