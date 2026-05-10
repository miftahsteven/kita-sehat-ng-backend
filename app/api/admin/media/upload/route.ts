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
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return errorResponse("No file uploaded", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split(".").pop()?.toLowerCase().replace("jpeg", "jpg") || "jpg";
    const fileName = `${uuidv4()}.${fileExtension}`;
    const relativePath = `/uploads/${fileName}`;
    
    const rootDir = process.cwd();
    const uploadDir = join(rootDir, "public", "uploads");
    const path = join(uploadDir, fileName);

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    await writeFile(path, buffer);

    const asset = await prisma.mediaAsset.create({
      data: {
        url: relativePath,
        altText: file.name,
        type: file.type.startsWith("image") ? "image" : "file",
      },
    });

    return successResponse(asset, "File uploaded successfully");
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return errorResponse("Failed to upload file", 500, error);
  }
}
