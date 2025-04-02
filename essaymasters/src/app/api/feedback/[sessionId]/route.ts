// // /app/api/feedback/[sessionId]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// // GET: Retrieve feedback for a session
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     const { sessionId } = params;
    
//     const session = await prisma.session.findUnique({
//       where: { id: sessionId },
//     });

//     if (!session) {
//       return NextResponse.json({ error: "Session not found" }, { status: 404 });
//     }

//     return NextResponse.json({ feedback: session.feedback });
//   } catch (error) {
//     console.error("Error retrieving feedback:", error);
//     return NextResponse.json({ error: "Failed to retrieve feedback" }, { status: 500 });
//   }
// }

// // POST: Update feedback for a session
// export async function POST(
//   request: NextRequest,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     const { sessionId } = params;
//     const { feedback } = await request.json();

//     const updatedSession = await prisma.session.update({
//       where: { id: sessionId },
//       data: { 
//         feedback,
//         updatedAt: new Date()
//       },
//     });

//     return NextResponse.json({ success: true, feedback: updatedSession.feedback });
//   } catch (error) {
//     console.error("Error updating feedback:", error);
//     return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
//   }
// }

// File: /app/api/feedback/[sessionId]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/route";

// const prisma = new PrismaClient();

// // GET: Get feedback data for a specific session
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     // Get the server session
//     const session = await getServerSession(authOptions);
    
//     // Check if user is authenticated
//     if (!session || !session.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
    
//     // Find the user by email to get their ID
//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });
    
//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }
    
//     const sessionId = params.sessionId;
    
//     // Get the session data including feedback
//     const sessionData = await prisma.session.findFirst({
//       where: { 
//         id: sessionId,
//         userId: user.id
//       },
//       select: {
//         feedback: true
//       }
//     });
    
//     if (!sessionData) {
//       return NextResponse.json({ error: "Session not found or not authorized" }, { status: 404 });
//     }
    
//     return NextResponse.json({ 
//       feedback: sessionData.feedback
//     });
//   } catch (error) {
//     console.error("Error fetching feedback data:", error);
//     return NextResponse.json({ error: "Failed to fetch feedback data" }, { status: 500 });
//   }
// }

// // PUT: Update feedback data for a specific session
// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { sessionId: string } }
// ) {
//   try {
//     // Get the server session
//     const session = await getServerSession(authOptions);
    
//     // Check if user is authenticated
//     if (!session || !session.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
    
//     // Find the user by email to get their ID
//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });
    
//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }
    
//     const sessionId = params.sessionId;
//     const { feedback } = await req.json();
    
//     // Update the session's feedback data
//     const updatedSession = await prisma.session.updateMany({
//       where: { 
//         id: sessionId,
//         userId: user.id
//       },
//       data: {
//         feedback: feedback,
//         updatedAt: new Date()
//       }
//     });
    
//     if (updatedSession.count === 0) {
//       return NextResponse.json({ error: "Session not found or not authorized" }, { status: 404 });
//     }
    
//     return NextResponse.json({ 
//       message: "Feedback data updated successfully",
//       success: true
//     });
//   } catch (error) {
//     console.error("Error updating feedback data:", error);
//     return NextResponse.json({ error: "Failed to update feedback data" }, { status: 500 });
//   }
// }

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
