import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return successResponse(categories, "Categories retrieved successfully");
  } catch (error) {
    return errorResponse("Failed to retrieve categories", 500, error);
  }
}
