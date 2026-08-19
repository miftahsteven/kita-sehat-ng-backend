import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "BANNER_HEADER_ENABLED", 
            "BANNER_MIDDLE_ENABLED",
            "BANNER_SUB_TOPIC_ENABLED",
            "BANNER_MINI_ADS_ENABLED"
          ]
        }
      }
    });

    // Map to a more useful object
    const result = {
      BANNER_HEADER_ENABLED: settings.find(s => s.key === "BANNER_HEADER_ENABLED")?.value === "true",
      BANNER_MIDDLE_ENABLED: settings.find(s => s.key === "BANNER_MIDDLE_ENABLED")?.value === "true",
      BANNER_SUB_TOPIC_ENABLED: settings.find(s => s.key === "BANNER_SUB_TOPIC_ENABLED")?.value === "true",
      BANNER_MINI_ADS_ENABLED: settings.find(s => s.key === "BANNER_MINI_ADS_ENABLED")?.value === "true",
    };

    return successResponse(result);
  } catch (error) {
    console.error("DEBUG BANNER SETTINGS ERROR:", error);
    return errorResponse("Failed to fetch banner settings", 500, error);
  }
}

export async function POST(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const body = await request.json(); // { key: string, value: boolean }
    const { key, value } = body;

    const allowedKeys = [
      "BANNER_HEADER_ENABLED", 
      "BANNER_MIDDLE_ENABLED",
      "BANNER_SUB_TOPIC_ENABLED",
      "BANNER_MINI_ADS_ENABLED"
    ];

    if (!allowedKeys.includes(key)) {
      return errorResponse("Invalid setting key", 400);
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value.toString() },
      create: { key, value: value.toString(), group: "banners" }
    });

    return successResponse(setting, "Setting updated successfully");
  } catch (error) {
    return errorResponse("Failed to update setting", 500, error);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
