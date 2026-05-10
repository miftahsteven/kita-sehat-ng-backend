import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  const { id } = await params;

  try {
    const body = await request.json();
    const { label, url, order, isActive, parentId } = body;

    const menu = await prisma.menuItem.update({
      where: { id },
      data: {
        label,
        url,
        order,
        isActive,
        parentId: parentId && parentId !== "" ? parentId : null
      },
    });

    return successResponse(menu, "Menu updated successfully");
  } catch (error) {
    return errorResponse("Failed to update menu", 500, error);
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
    await prisma.menuItem.delete({ where: { id } });
    return successResponse(null, "Menu deleted successfully");
  } catch (error) {
    return errorResponse("Failed to delete menu", 500, error);
  }
}
