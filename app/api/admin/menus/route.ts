import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "HEADER";

  try {
    if (!(prisma as any).menuItem) {
      console.error("PRISMA MODELS AVAILABLE:", Object.keys(prisma).filter(k => !k.startsWith("_") && !k.startsWith("$")));
      throw new Error("MenuItem model is not available in Prisma Client. Please restart the backend server.");
    }
    const menus = await (prisma as any).menuItem.findMany({
      where: { 
        type,
        parentId: null 
      },
      include: {
        children: {
          orderBy: { order: "asc" }
        }
      },
      orderBy: { order: "asc" },
    });
    return successResponse(menus, "Menus retrieved");
  } catch (error: any) {
    console.error("GET MENU ERROR:", error);
    return errorResponse(`Failed to fetch menus: ${error.message}`, 500);
  }
}

export async function POST(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    if (!(prisma as any).menuItem) {
      throw new Error("MenuItem model is not available in Prisma Client. Please restart the backend server.");
    }
    const { label, url, type, order, parentId } = await request.json();
    
    if (!label || !url) return errorResponse("Label and URL are required", 400);

    const menu = await (prisma as any).menuItem.create({
      data: {
        label,
        url,
        type: type || "HEADER",
        order: order || 0,
        parentId: parentId && parentId !== "" ? parentId : null,
      },
    });

    return successResponse(menu, "Menu item created successfully");
  } catch (error: any) {
    console.error("CREATE MENU ERROR:", error);
    return errorResponse(`Failed to create menu item: ${error.message}`, 500);
  }
}
