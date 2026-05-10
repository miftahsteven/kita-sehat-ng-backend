import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return successResponse(
      {
        service: "kita-sehat-ng-backend",
        database: "connected",
      },
      "Kita-Sehat API is healthy"
    );
  } catch (error) {
    return errorResponse("Database connection failed", 500, error);
  }
}
