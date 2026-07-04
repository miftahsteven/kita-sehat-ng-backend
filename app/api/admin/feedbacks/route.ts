import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";
import { getPagination, buildPaginationMeta } from "@/lib/pagination";

export async function GET(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const exportMode = searchParams.get("export") === "true";

    const where = search ? {
      OR: [
        { verificationCode: { contains: search, mode: 'insensitive' as any } },
        { name: { contains: search, mode: 'insensitive' as any } },
        { phone: { contains: search, mode: 'insensitive' as any } },
      ]
    } : {};

    if (exportMode) {
      const feedbacks = await prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          article: {
            select: {
              title: true,
              slug: true,
            }
          }
        },
      });
      return successResponse(
        feedbacks,
        "All feedbacks retrieved for export"
      );
    }

    const { page, limit, skip, take } = getPagination(searchParams);

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          article: {
            select: {
              title: true,
              slug: true,
            }
          }
        },
      }),
      prisma.feedback.count({ where }),
    ]);

    return successResponse(
      feedbacks,
      "Admin feedbacks retrieved successfully",
      buildPaginationMeta(total, page, limit)
    );
  } catch (error) {
    return errorResponse("Failed to fetch feedbacks", 500, error);
  }
}
