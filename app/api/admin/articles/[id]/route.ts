import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";
import { createSlug } from "@/lib/slug";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: { category: true, author: true },
    });

    if (!article) return errorResponse("Article not found", 404);

    return successResponse(article, "Article retrieved successfully");
  } catch (error) {
    return errorResponse("Failed to fetch article", 500, error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title, excerpt, content, coverImage, status, 
      categoryId, authorId, isFeatured, isHero, isEditorPick,
      seoTitle, seoDescription, seoKeywords, slug 
    } = body;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return errorResponse("Article not found", 404);

    let publishedAtVal = existing.publishedAt;
    if (status === "PUBLISHED") {
      if (!publishedAtVal) {
        publishedAtVal = new Date();
      }
    } else {
      publishedAtVal = null;
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title,
        slug: slug || (title ? createSlug(title) : undefined),
        excerpt,
        content,
        coverImage,
        status,
        categoryId,
        authorId,
        isFeatured,
        isHero,
        isEditorPick,
        seoTitle,
        seoDescription,
        seoKeywords,
        updatedByAdminId: (admin as any).id,
        publishedAt: publishedAtVal,
      },
    });

    return successResponse(article, "Article updated successfully");
  } catch (error) {
    return errorResponse("Failed to update article", 500, error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { id } = await params;
    await prisma.article.delete({
      where: { id },
    });

    return successResponse(null, "Article deleted successfully");
  } catch (error) {
    return errorResponse("Failed to delete article", 500, error);
  }
}
