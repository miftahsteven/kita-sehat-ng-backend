import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";

export async function POST(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { url } = await request.json();

    if (!url) {
      return errorResponse("URL is required", 400);
    }

    console.log(`[DEBUG] RECEIVED URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    console.log(`[DEBUG] FETCH STATUS: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    console.log(`[DEBUG] CONTENT TYPE: ${contentType}`);
    
    let extension = "jpg";
    if (contentType.includes("png")) extension = "png";
    else if (contentType.includes("webp")) extension = "webp";
    else if (contentType.includes("gif")) extension = "gif";
    
    const bytes = await response.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`[DEBUG] DOWNLOADED SIZE: ${buffer.length} bytes`);

    if (buffer.length === 0) {
      throw new Error("Downloaded buffer is empty");
    }

    const fileName = `${uuidv4()}.${extension}`;
    const relativePath = `/uploads/${fileName}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    const path = join(uploadDir, fileName);

    console.log(`[DEBUG] ATTEMPTING TO SAVE TO: ${path}`);

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      console.log(`[DEBUG] CREATING DIRECTORY: ${uploadDir}`);
      await mkdir(uploadDir, { recursive: true });
    }

    await writeFile(path, buffer);
    console.log(`[DEBUG] SAVE SUCCESSFUL`);

    const asset = await prisma.mediaAsset.create({
      data: {
        url: relativePath,
        altText: "Downloaded from Unsplash",
        type: "image",
      },
    });

    return successResponse(asset, "Image fetched and saved successfully");
  } catch (error: any) {
    console.error("[DEBUG] FETCH URL ERROR:", error);
    return errorResponse(error.message || "Failed to fetch image from URL", 500);
  }
}
