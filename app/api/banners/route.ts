import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { BannerPlacement } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement") as BannerPlacement | null;

    const where = {
      isActive: true,
      ...(placement ? { placement } : {}),
      // Optional: Add date filtering if startDate/endDate are used
      // OR: [
      //   { startDate: null, endDate: null },
      //   { startDate: { lte: new Date() }, endDate: { gte: new Date() } }
      // ]
    };

    const banners = await prisma.advertisementBanner.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(banners, "Banners retrieved successfully");
  } catch (error) {
    return errorResponse("Failed to retrieve banners", 500, error);
  }
}
