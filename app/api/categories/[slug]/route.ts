import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { buildPaginationMeta, getPagination } from "@/lib/pagination";
import { ArticleStatus } from "@prisma/client";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const { page, limit, skip, take } = getPagination(searchParams);

    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
    });

    if (!category) {
      return errorResponse("Category not found", 404);
    }

    const where = {
      categoryId: category.id,
      status: ArticleStatus.PUBLISHED,
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
      {
        category,
        articles,
      },
      "Category articles retrieved successfully",
      buildPaginationMeta(total, page, limit)
    );
  } catch (error) {
    return errorResponse("Failed to retrieve category articles", 500, error);
  }
}
