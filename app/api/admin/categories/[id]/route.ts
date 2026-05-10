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

  const { id } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) return errorResponse("Category not found", 404);
    return successResponse(category, "Category retrieved");
  } catch (error) {
    return errorResponse("Failed to fetch category", 500, error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, description, color, order, isActive } = body;

    const data: any = { description, color, order, isActive };
    if (name) {
      data.name = name;
      data.slug = createSlug(name);
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return successResponse(category, "Category updated successfully");
  } catch (error) {
    return errorResponse("Failed to update category", 500, error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  const { id } = await params;

  try {
    // Check if category has articles
    const articleCount = await prisma.article.count({ where: { categoryId: id } });
    if (articleCount > 0) {
      return errorResponse("Cannot delete category with existing articles", 400);
    }

    await prisma.category.delete({ where: { id } });
    return successResponse(null, "Category deleted successfully");
  } catch (error) {
    return errorResponse("Failed to delete category", 500, error);
  }
}
