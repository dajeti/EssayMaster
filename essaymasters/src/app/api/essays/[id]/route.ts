import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma client setup

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const essay = await prisma.essay.findUnique({
    where: { id: params.id },
  });

  return NextResponse.json(essay || { essay: "" });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { essay } = await req.json();

  await prisma.essay.upsert({
    where: { id: params.id },
    update: { essay },
    create: { id: params.id, essay },
  });

  return NextResponse.json({ message: "Essay saved" });
}
