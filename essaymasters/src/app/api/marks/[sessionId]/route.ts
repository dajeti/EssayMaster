// /app/api/marks/[sessionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Retrieve mark scheme for a session
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    
    const markScheme = await prisma.markScheme.findUnique({
      where: { sessionId },
    });

    if (!markScheme) {
      return NextResponse.json({ error: "Mark scheme not found" }, { status: 404 });
    }

    return NextResponse.json({ markScheme });
  } catch (error) {
    console.error("Error retrieving mark scheme:", error);
    return NextResponse.json({ error: "Failed to retrieve mark scheme" }, { status: 500 });
  }
}

// POST: Add or update mark scheme for a session
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const { fileUrl } = await request.json();

    // Check if mark scheme exists
    const existingMarkScheme = await prisma.markScheme.findUnique({
      where: { sessionId },
    });

    if (existingMarkScheme) {
      // Update existing mark scheme
      const updatedMarkScheme = await prisma.markScheme.update({
        where: { sessionId },
        data: { 
          fileUrl,
          uploadedAt: new Date()
        },
      });
      
      // Also update the session
      await prisma.session.update({
        where: { id: sessionId },
        data: { markScheme: fileUrl },
      });

      return NextResponse.json({ success: true, markScheme: updatedMarkScheme });
    } else {
      // Create new mark scheme
      const newMarkScheme = await prisma.markScheme.create({
        data: {
          sessionId,
          fileUrl,
          uploadedAt: new Date(),
        },
      });
      
      // Also update the session
      await prisma.session.update({
        where: { id: sessionId },
        data: { markScheme: fileUrl },
      });

      return NextResponse.json({ success: true, markScheme: newMarkScheme });
    }
  } catch (error) {
    console.error("Error saving mark scheme:", error);
    return NextResponse.json({ error: "Failed to save mark scheme" }, { status: 500 });
  }
}