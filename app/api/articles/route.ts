import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { buildPaginationMeta, getPagination } from "@/lib/pagination";
import { ArticleStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip, take } = getPagination(searchParams);

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sort = searchParams.get("sort") ?? "latest";
    const hero = searchParams.get("hero") === "true";
    const featured = searchParams.get("featured") === "true";
    const editorPick = searchParams.get("editorPick") === "true";

    const where: any = {
      status: ArticleStatus.PUBLISHED,
      ...(category
        ? {
            category: {
              slug: category,
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { excerpt: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(startDate || endDate
        ? {
            publishedAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
      ...(hero ? { isHero: true } : {}),
      ...(featured ? { isFeatured: true } : {}),
      ...(editorPick ? { isEditorPick: true } : {}),
    };

    const orderBy: any =
      sort === "popular"
        ? [{ viewCount: "desc" }, { publishedAt: "desc" }]
        : sort === "featured"
          ? [{ isFeatured: "desc" }, { publishedAt: "desc" }]
          : [{ publishedAt: "desc" }];

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: true,
          author: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return successResponse(
      articles,
      "Articles retrieved successfully",
      buildPaginationMeta(total, page, limit)
    );
  } catch (error) {
    return errorResponse("Failed to retrieve articles", 500, error);
  }
}
