import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });
    return successResponse(assets, "Media assets retrieved");
  } catch (error) {
    return errorResponse("Failed to fetch media assets", 500, error);
  }
}
