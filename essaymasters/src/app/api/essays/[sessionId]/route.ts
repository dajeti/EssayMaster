// /app/api/essays/[sessionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Retrieve an essay by sessionId
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

    return NextResponse.json({ essay: session.essay });
  } catch (error) {
    console.error("Error retrieving essay:", error);
    return NextResponse.json({ error: "Failed to retrieve essay" }, { status: 500 });
  }
}

// POST: Update an essay by sessionId
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const { essay } = await request.json();

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { 
        essay,
        updatedAt: new Date()
      },
    });

    return NextResponse.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error("Error updating essay:", error);
    return NextResponse.json({ error: "Failed to update essay" }, { status: 500 });
  }
}