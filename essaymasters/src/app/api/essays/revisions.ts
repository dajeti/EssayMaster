import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const essayId = searchParams.get("essayId");

  if (!essayId) return NextResponse.json({ error: "Essay ID required" }, { status: 400 });

  try {
    const revisions = await prisma.revision.findMany({
      where: { essayId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ revisions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching revisions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
