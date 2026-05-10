import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    
    // Transform to key-value object
    const settingsMap = Object.fromEntries(
      settings.map((s) => [s.key, s.value])
    );

    return successResponse(settingsMap, "Settings retrieved successfully");
  } catch (error) {
    return errorResponse("Failed to retrieve settings", 500, error);
  }
}
