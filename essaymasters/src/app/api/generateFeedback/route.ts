import { NextResponse } from "next/server";

/**
 * A dummy endpoint that returns a "score" 
 * and one or two snippet-based suggestions.
 * 
 * Adjust the snippet strings so you can test highlighting:
 * e.g. if your essay has "thesis statement" somewhere,
 * we’ll highlight that as an example.
 */
export async function POST(req: Request) {
  try {
    const { essay, markscheme } = await req.json();

    // Just returning dummy data for now
    // to avoid 404 and let you test the UI.
    const responseData = {
      score: "85/100",
      suggestions: [
        {
          id: "sug1",
          snippet: "thesis statement",
          advice: "Strengthen your main argument earlier in the essay.",
        },
        {
          id: "sug2",
          snippet: "second paragraph",
          advice:
            "Consider adding evidence to support your claim in the second paragraph.",
        },
      ],
    };

    // If a markscheme is provided, pretend we do something special
    if (markscheme) {
      responseData.suggestions.push({
        id: "sug3",
        snippet: "technical criteria",
        advice: "Address the markscheme’s technical criteria more explicitly.",
      });
    }

    return NextResponse.json(responseData);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error in generateFeedback: " + err.message },
      { status: 500 }
    );
  }
}
