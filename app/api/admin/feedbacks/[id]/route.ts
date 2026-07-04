import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { id } = await params;
    
    const existing = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!existing) {
      return errorResponse("Feedback tidak ditemukan", 404);
    }

    await prisma.feedback.delete({
      where: { id }
    });

    return successResponse(null, "Feedback deleted successfully");
  } catch (error) {
    return errorResponse("Failed to delete feedback", 500, error);
  }
}
