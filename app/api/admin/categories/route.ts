import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";
import { createSlug } from "@/lib/slug";

export async function GET(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });
    return successResponse(categories, "Categories retrieved");
  } catch (error) {
    return errorResponse("Failed to fetch categories", 500, error);
  }
}

export async function POST(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { name, description, color, order } = await request.json();
    
    if (!name) return errorResponse("Name is required", 400);

    const category = await prisma.category.create({
      data: {
        name,
        slug: createSlug(name),
        description,
        color,
        order: order || 0,
      },
    });

    return successResponse(category, "Category created successfully");
  } catch (error) {
    return errorResponse("Failed to create category", 500, error);
  }
}
