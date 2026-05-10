import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { newsletterSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = newsletterSchema.safeParse(body);

    if (!result.success) {
      return errorResponse("Invalid input", 400, result.error.format());
    }

    const { email, name } = result.data;

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return successResponse(
        null,
        "Email ini sudah terdaftar sebagai subscriber kami. Terima kasih!"
      );
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        name,
        source: "public_site",
      },
    });

    return successResponse(subscriber, "Berhasil mendaftar newsletter!");
  } catch (error) {
    return errorResponse("Failed to subscribe", 500, error);
  }
}
