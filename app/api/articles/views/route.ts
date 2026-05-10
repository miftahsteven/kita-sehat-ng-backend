import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return errorResponse("Article ID is required", 400);
    }

    // Get client info to prevent spam (basic check)
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Skip common bots
    const botPatterns = [/bot/i, /spider/i, /crawl/i, /lighthouse/i, /headless/i];
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
      return successResponse({ skipped: true, reason: "bot" }, "View skipped (bot)");
    }

    // Increment view count
    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        viewCount: true
      }
    });

    // Optional: Log the view in a separate table for auditing if needed in the future
    // await prisma.articleViewLog.create({ data: { articleId, ip, userAgent } });

    return successResponse(updated, "View count incremented");
  } catch (error) {
    return errorResponse("Failed to increment view count", 500, error);
  }
}
