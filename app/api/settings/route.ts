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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { settings } = body; // Expected format: { settings: { key1: value1, key2: value2 } }

    if (!settings || typeof settings !== "object") {
      return errorResponse("Invalid settings data", 400);
    }

    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    });

    await Promise.all(updatePromises);

    return successResponse(null, "Settings updated successfully");
  } catch (error) {
    return errorResponse("Failed to update settings", 500, error);
  }
}
