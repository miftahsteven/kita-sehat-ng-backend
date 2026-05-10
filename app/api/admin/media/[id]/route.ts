import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { id } = await params;

    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!asset) {
      return errorResponse("Asset not found", 404);
    }

    // Delete physical file
    try {
      const filePath = join(process.cwd(), "public", asset.url);
      await unlink(filePath);
    } catch (err) {
      console.warn("Could not delete file from disk:", err);
      // Continue deleting from DB even if file is missing
    }

    // Delete from DB
    await prisma.mediaAsset.delete({
      where: { id },
    });

    return successResponse(null, "Media asset deleted successfully");
  } catch (error) {
    console.error("DELETE MEDIA ERROR:", error);
    return errorResponse("Failed to delete media asset", 500, error);
  }
}
