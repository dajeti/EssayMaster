import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { essayId, original, revised } = await req.json();
    
    // Save a new revision entry
    const newRevision = await prisma.revision.create({
      data: {
        userId: session.user.id,
        essayId,
        original,
        revised
      },
    });

    return NextResponse.json({ message: "Revision saved", newRevision }, { status: 201 });
  } catch (error) {
    console.error("Error saving revision:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
