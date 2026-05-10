import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { buildPaginationMeta, getPagination } from "@/lib/pagination";
import { ArticleStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
      return errorResponse("Search query is required", 400);
    }

    const { page, limit, skip, take } = getPagination(searchParams);

    const where = {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { excerpt: { contains: q, mode: "insensitive" as const } },
        { content: { contains: q, mode: "insensitive" as const } },
        { seoKeywords: { contains: q, mode: "insensitive" as const } },
      ],
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take,
        orderBy: {
          publishedAt: "desc",
        },
        include: {
          category: true,
          author: true,
        },
      }),
      prisma.article.count({ where }),
    ]);

    return successResponse(
      articles,
      "Search results retrieved successfully",
      buildPaginationMeta(total, page, limit)
    );
  } catch (error) {
    return errorResponse("Search failed", 500, error);
  }
}
