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

    console.log(`FETCHING IMAGE FROM: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    const contentType = response.headers.get("content-type");
    const extension = contentType?.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    
    const bytes = await response.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${uuidv4()}.${extension}`;
    const relativePath = `/uploads/${fileName}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    const path = join(uploadDir, fileName);

    console.log(`SAVING TO: ${path}`);

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    await writeFile(path, buffer);

    const asset = await prisma.mediaAsset.create({
      data: {
        url: relativePath,
        altText: "Downloaded from Unsplash",
        type: "image",
      },
    });

    return successResponse(asset, "Image fetched and saved successfully");
  } catch (error: any) {
    console.error("FETCH URL ERROR:", error);
    return errorResponse(error.message || "Failed to fetch image from URL", 500);
  }
}
