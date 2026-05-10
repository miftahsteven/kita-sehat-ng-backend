import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { ArticleStatus, BannerPlacement } from "@prisma/client";

export async function GET() {
  try {
    const [
      heroArticles,
      featuredArticles,
      latestArticles,
      popularArticles,
      categories,
      headerTopBanners,
      belowHeroBanners,
    ] = await Promise.all([
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, isHero: true },
        take: 5,
        orderBy: { publishedAt: "desc" },
        include: { category: true, author: true },
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, isFeatured: true },
        take: 8,
        orderBy: { publishedAt: "desc" },
        include: { category: true, author: true },
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        take: 10,
        orderBy: { publishedAt: "desc" },
        include: { category: true, author: true },
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        take: 8,
        orderBy: { viewCount: "desc" },
        include: { category: true, author: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.advertisementBanner.findMany({
        where: { isActive: true, placement: BannerPlacement.HEADER_TOP },
      }),
      prisma.advertisementBanner.findMany({
        where: { isActive: true, placement: BannerPlacement.BELOW_HERO },
      }),
    ]);

    return successResponse({
      heroArticles,
      featuredArticles,
      latestArticles,
      popularArticles,
      categories,
      banners: {
        headerTop: headerTopBanners,
        belowHero: belowHeroBanners,
      },
    });
  } catch (error) {
    return errorResponse("Failed to retrieve homepage data", 500, error);
  }
}
