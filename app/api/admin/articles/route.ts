import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";
import { getPagination, buildPaginationMeta } from "@/lib/pagination";
import { createSlug } from "@/lib/slug";

export async function GET(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip, take } = getPagination(searchParams);
    const search = searchParams.get("search") || "";

    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as any } },
        { excerpt: { contains: search, mode: 'insensitive' as any } },
      ]
    } : {};

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { category: true, author: true },
      }),
      prisma.article.count({ where }),
    ]);

    return successResponse(
      articles,
      "Admin articles retrieved",
      buildPaginationMeta(total, page, limit)
    );
  } catch (error) {
    return errorResponse("Failed to fetch articles", 500, error);
  }
}

export async function POST(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const body = await request.json();
    const { 
      title, excerpt, content, coverImage, status, 
      categoryId, authorId, isFeatured, isHero, isEditorPick,
      seoTitle, seoDescription, seoKeywords 
    } = body;

    const article = await prisma.article.create({
      data: {
        title,
        slug: createSlug(title),
        excerpt,
        content,
        coverImage,
        status,
        categoryId,
        authorId,
        isFeatured: isFeatured || false,
        isHero: isHero || false,
        isEditorPick: isEditorPick || false,
        seoTitle,
        seoDescription,
        seoKeywords,
        createdByAdminId: (admin as any).id,
      },
    });

    return successResponse(article, "Article created successfully");
  } catch (error) {
    return errorResponse("Failed to create article", 500, error);
  }
}
