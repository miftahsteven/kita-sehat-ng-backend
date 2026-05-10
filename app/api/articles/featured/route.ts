import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { ArticleStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 8), 1), 20);

    const articles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        isFeatured: true,
      },
      take: limit,
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        category: true,
        author: true,
      },
    });

    return successResponse(articles, "Featured articles retrieved successfully");
  } catch (error) {
    return errorResponse("Failed to retrieve featured articles", 500, error);
  }
}
