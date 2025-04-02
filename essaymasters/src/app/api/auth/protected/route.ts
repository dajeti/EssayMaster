import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET || "your_secret_key";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]; // Get token from headers

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, SECRET);
    return NextResponse.json({ message: "Protected content", user: decoded });
  } catch (error) {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}
