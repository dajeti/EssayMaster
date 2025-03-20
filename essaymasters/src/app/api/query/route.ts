import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, inputText } = await req.json();

    if (!inputText) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    // WARNING: Do not expose real API keys in public repos!
    // Replace "sk-proj..." with your actual OpenAI secret key or use an .env
    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer REMOVED`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: inputText },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error("OpenAI API Error:", data);
      return NextResponse.json(
        { error: data.error?.message || "OpenAI API request failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: data.choices?.[0]?.message?.content || "No response received.",
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
