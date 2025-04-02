// /app/api/chat/[sessionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Retrieve chat history for a session
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ chat: session.chat });
  } catch (error) {
    console.error("Error retrieving chat:", error);
    return NextResponse.json({ error: "Failed to retrieve chat" }, { status: 500 });
  }
}

// POST: Add message to chat history
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const { message, sender } = await request.json();

    // Get current chat
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Parse existing chat or create new chat array
    let chatHistory = [];
    try {
      chatHistory = JSON.parse(JSON.stringify(session.chat));
    } catch (e) {
      // If chat is not valid JSON or doesn't exist
      chatHistory = [];
    }

    // Add new message
    const newMessage = {
      id: Date.now().toString(),
      content: message,
      sender,
      timestamp: new Date().toISOString()
    };
    
    chatHistory.push(newMessage);

    // Update session with new chat
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { 
        chat: chatHistory,
        updatedAt: new Date()
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: newMessage,
      chat: chatHistory 
    });
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}