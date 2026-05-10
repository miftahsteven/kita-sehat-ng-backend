import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const [
      totalArticles,
      publishedArticles,
      totalViews,
      totalMedia,
      totalAuthors
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.mediaAsset.count(),
      prisma.author.count(),
    ]);

    const latestArticles = await prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      }
    });

    return successResponse({
      stats: {
        totalArticles,
        publishedArticles,
        totalViews: totalViews._sum.viewCount || 0,
        totalMedia,
        totalAuthors,
      },
      latestArticles
    });
  } catch (error) {
    return errorResponse("Failed to fetch dashboard stats", 500, error);
  }
}
