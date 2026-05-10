import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "kita-sehat-super-secret-key-2024"
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    // 1. Try finding in AdminUser
    let user = await prisma.adminUser.findUnique({ where: { email } }) as any;
    let userType = "ADMIN";

    // 2. If not found, try Author
    if (!user) {
      user = await prisma.author.findUnique({ where: { email } }) as any;
      userType = "AUTHOR";
    }

    if (!user || !user.isActive) {
      return errorResponse("Invalid credentials or account inactive", 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return errorResponse("Invalid credentials", 401);
    }

    // Update last login
    if (userType === "ADMIN") {
      await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    } else {
      await prisma.author.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    }

    const token = await new SignJWT({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      type: userType 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    const { passwordHash, ...userWithoutPassword } = user;

    return successResponse({
      token,
      user: {
        ...userWithoutPassword,
        type: userType
      }
    }, "Login successful");
  } catch (error) {
    return errorResponse("Login failed", 500, error);
  }
}
