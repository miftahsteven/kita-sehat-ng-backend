import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: admin.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user);
  } catch (error) {
    return errorResponse("Failed to fetch profile", 500, error);
  }
}

export async function PATCH(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const body = await request.json();
    const { name, email, avatarUrl, password } = body;

    const data: any = { name, email, avatarUrl };
    
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.adminUser.update({
      where: { id: admin.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
      }
    });

    return successResponse(updated, "Profile updated successfully");
  } catch (error) {
    return errorResponse("Failed to update profile", 500, error);
  }
}
