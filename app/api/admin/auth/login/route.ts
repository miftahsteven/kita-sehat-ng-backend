import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { comparePassword, createToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      return errorResponse("Invalid credentials", 401);
    }

    const isPasswordValid = await comparePassword(password, admin.passwordHash);

    if (!isPasswordValid) {
      return errorResponse("Invalid credentials", 401);
    }

    // Create token
    const token = await createToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return successResponse({
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatarUrl: admin.avatarUrl,
      },
      token,
    }, "Login successful");
  } catch (error) {
    return errorResponse("Login failed", 500, error);
  }
}
