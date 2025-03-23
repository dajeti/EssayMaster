import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const markScheme = await prisma.markScheme.findUnique({
    where: { sessionId: params.sessionId },
  });

  return NextResponse.json(markScheme || {});
}

export async function POST(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const { fileUrl } = await req.json();

  await prisma.markScheme.upsert({
    where: { sessionId: params.sessionId },
    update: { fileUrl },
    create: { sessionId: params.sessionId, fileUrl },
  });

  return NextResponse.json({ message: "Mark scheme uploaded" });
}
