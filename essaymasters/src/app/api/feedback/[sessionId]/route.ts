
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Load feedback from DB
export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { feedback: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ feedback: session.feedback || null });
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    return NextResponse.json({ error: "Failed to retrieve feedback" }, { status: 500 });
  }
}

// PUT: Save feedback to DB
export async function PUT(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await request.json();
    const { feedback } = body;

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { feedback }, // store entire JSON as string
    });

    return NextResponse.json({ success: true, feedback: updatedSession.feedback });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}
