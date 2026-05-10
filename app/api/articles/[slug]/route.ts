import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { ArticleStatus } from "@prisma/client";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;

    const article = await prisma.article.findFirst({
      where: {
        slug,
        status: ArticleStatus.PUBLISHED,
      },
      include: {
        category: true,
        author: true,
        mediaAssets: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!article) {
      return errorResponse("Article not found", 404);
    }

    // View count increment moved to dedicated POST /api/articles/views endpoint
    // to ensure better accuracy and prevent bot inflation.

    const relatedArticles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        categoryId: article.categoryId,
        id: {
          not: article.id,
        },
      },
      take: 4,
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        category: true,
        author: true,
      },
    });

    return successResponse({
      article,
      relatedArticles,
    });
  } catch (error) {
    return errorResponse("Failed to retrieve article detail", 500, error);
  }
}
