import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authorizeAdmin, unauthorized } from "@/lib/admin-auth";
import { createSlug } from "@/lib/slug";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function GET(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const authors = await prisma.author.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });
    return successResponse(authors, "Authors retrieved");
  } catch (error) {
    return errorResponse("Failed to fetch authors", 500, error);
  }
}

export async function POST(request: Request) {
  const admin = await authorizeAdmin(request);
  if (!admin) return unauthorized();

  try {
    const body = await request.json();
    const { name, email, role, bio } = body;

    if (!name || !email) {
      return errorResponse("Name and email are required", 400);
    }

    // Check if email exists
    const existing = await prisma.author.findUnique({ where: { email } });
    if (existing) return errorResponse("Email already registered", 400);

    // Generate secure password
    const rawPassword = crypto.randomBytes(8).toString("hex"); // e.g., 'a1b2c3d4e5f6g7h8' -> 16 chars hex
    // Better format: mix of letters and numbers
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let securePassword = "";
    for (let i = 0; i < 12; i++) {
      securePassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const passwordHash = await bcrypt.hash(securePassword, 10);

    const author = await prisma.author.create({
      data: {
        name,
        email,
        slug: createSlug(name),
        role: role || "Health Writer",
        bio,
        passwordHash,
        isActive: true,
      },
    });

    return successResponse({
      author,
      credentials: {
        email: author.email,
        password: securePassword,
      }
    }, "Author created successfully with credentials");
  } catch (error) {
    return errorResponse("Failed to create author", 500, error);
  }
}
