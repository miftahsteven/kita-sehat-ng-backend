import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  // Resolve params
  const resolvedParams = await params;
  const filename = resolvedParams?.filename;
  
  if (!filename) {
    return new Response("Filename missing", { status: 400 });
  }
  
  const isLinux = process.platform === "linux";
  const uploadDir = isLinux 
    ? "/var/www/kita-sehat-storage/uploads"
    : join(process.cwd(), "public", "uploads");
    
  const filePath = join(uploadDir, filename);
  
  if (!existsSync(filePath)) {
    return new Response("Image Not Found", { status: 404 });
  }
  
  try {
    const fileBuffer = await readFile(filePath);
    
    // Determine content type
    let contentType = "application/octet-stream";
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    else if (ext === "png") contentType = "image/png";
    else if (ext === "gif") contentType = "image/gif";
    else if (ext === "webp") contentType = "image/webp";
    else if (ext === "svg") contentType = "image/svg+xml";
    
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("DYNAMIC FILE SERVE ERROR:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
