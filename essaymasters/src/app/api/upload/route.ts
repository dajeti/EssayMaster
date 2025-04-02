import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Handle file uploads
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create unique filename
    const safeName = file.name.replace(/\s/g, "_");
    const filename = `${uuidv4()}_${safeName}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });  

    // Save file to disk
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return the URL for the uploaded file
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
