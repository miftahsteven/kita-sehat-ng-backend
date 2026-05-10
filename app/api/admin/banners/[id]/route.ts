import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { id } = await params;
    const body = await request.json();
    
    const banner = await prisma.advertisementBanner.update({
      where: { id },
      data: body,
    });

    return successResponse(banner, "Banner updated successfully");
  } catch (error) {
    return errorResponse("Failed to update banner", 500, error);
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
    await prisma.advertisementBanner.delete({
      where: { id },
    });
    return successResponse(null, "Banner deleted successfully");
  } catch (error) {
    return errorResponse("Failed to delete banner", 500, error);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
