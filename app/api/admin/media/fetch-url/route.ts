import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { url } = await request.json();

    if (!url) {
      return errorResponse("URL is required", 400);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image from URL");

    const contentType = response.headers.get("content-type");
    const extension = contentType?.split("/")[1] || "jpg";
    
    const bytes = await response.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${uuidv4()}.${extension}`;
    const relativePath = `/uploads/${fileName}`;
    const path = join(process.cwd(), "public", "uploads", fileName);

    await writeFile(path, buffer);

    const asset = await prisma.mediaAsset.create({
      data: {
        url: relativePath,
        altText: "Downloaded from URL",
        type: "image",
      },
    });

    return successResponse(asset, "Image fetched and saved successfully");
  } catch (error) {
    console.error("FETCH URL ERROR:", error);
    return errorResponse("Failed to fetch image from URL", 500, error);
  }
}
