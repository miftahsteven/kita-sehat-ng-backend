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
      draftArticles,
      totalCategories,
      totalAuthors,
      totalSubscribers,
      recentArticles,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.category.count(),
      prisma.author.count(),
      prisma.newsletterSubscriber.count(),
      prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { category: true, author: true },
      }),
    ]);

    return successResponse({
      counts: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalCategories,
        totalAuthors,
        totalSubscribers,
      },
      recentArticles,
    }, "Dashboard statistics retrieved");
  } catch (error) {
    return errorResponse("Failed to fetch dashboard statistics", 500, error);
  }
}
