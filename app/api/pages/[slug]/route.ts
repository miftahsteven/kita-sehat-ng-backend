import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;

    const page = await prisma.staticPage.findUnique({
      where: { slug, isActive: true },
    });

    if (!page) {
      return errorResponse("Page not found", 404);
    }

    return successResponse(page, "Page retrieved successfully");
  } catch (error) {
    return errorResponse("Failed to retrieve page", 500, error);
  }
}
