import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";


export async function GET(request: Request) {
  try {
    const banners = await prisma.advertisementBanner.findMany({
      orderBy: [
        { placement: "asc" }
      ]
    });
    return successResponse(banners);
  } catch (error) {
    console.error("DEBUG BANNERS ERROR:", error);
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch banners", 500, error);
  }
}

export async function POST(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const body = await request.json();
    const { 
      name, placement, imageUrlDesktop, imageUrlMobile, 
      targetUrl, title, description, order 
    } = body;

    const banner = await prisma.advertisementBanner.create({
      data: {
        name,
        placement,
        imageUrlDesktop,
        imageUrlMobile,
        targetUrl,
        title,
        description,
        order: order || 0,
      },
    });

    return successResponse(banner, "Banner created successfully");
  } catch (error) {
    return errorResponse("Failed to create banner", 500, error);
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
