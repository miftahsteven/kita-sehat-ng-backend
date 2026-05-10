import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";
import { existsSync } from "fs";
import { join } from "path";

export async function POST(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const assets = await prisma.mediaAsset.findMany();
    let deletedCount = 0;

    for (const asset of assets) {
      // Check if file exists on disk
      // asset.url is something like /uploads/filename.jpg
      const filePath = join(process.cwd(), "public", asset.url);
      
      if (!existsSync(filePath)) {
        await prisma.mediaAsset.delete({
          where: { id: asset.id }
        });
        deletedCount++;
      }
    }

    return successResponse({ deletedCount }, `Cleaned up ${deletedCount} broken media assets`);
  } catch (error) {
    return errorResponse("Failed to cleanup media", 500, error);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
