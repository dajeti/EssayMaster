import { NextResponse } from "next/server";

/**
 * A dummy chat endpoint that just echoes back
 * whatever the user typed, with "AI says:"
 */
export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // For now, just respond with a dummy string 
    // so we avoid 404. 
    // Later, you can integrate with GPT-4 / OpenAI.
    const responseData = {
      response: "AI says: " + prompt,
    };

    return NextResponse.json(responseData);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error in chat: " + err.message },
      { status: 500 }
    );
  }
}
