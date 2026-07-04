import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const { name, phone, categories, otherCategory, recaptchaToken, articleId } = await request.json();

    if (!name || !phone || !articleId || !recaptchaToken) {
      return errorResponse("Semua field wajib diisi termasuk verifikasi reCAPTCHA.", 400);
    }

    // Verify reCAPTCHA token
    const secretKey = "6LfwVUQtAAAAAHLYcdVEfuLbAJ6_1dk3mRTBUAnj";
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    const recaptchaRes = await fetch(verificationUrl, { method: "POST" });
    const recaptchaJson = await recaptchaRes.json();

    if (!recaptchaJson.success) {
      return errorResponse("Verifikasi reCAPTCHA gagal. Silakan coba lagi.", 400);
    }

    // Generate unique-ish 4 digit verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Verify that the article exists and has feedback enabled
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      return errorResponse("Artikel tidak ditemukan.", 404);
    }

    if (!article.feedbackFormEnabled) {
      return errorResponse("Form feedback tidak aktif untuk artikel ini.", 400);
    }

    // Save feedback to database
    const feedback = await prisma.feedback.create({
      data: {
        name,
        phone,
        categories: categories || [],
        otherCategory: otherCategory || null,
        verificationCode,
        articleId,
      }
    });

    return successResponse({
      id: feedback.id,
      verificationCode: feedback.verificationCode,
    }, "Feedback berhasil disimpan");
  } catch (error) {
    return errorResponse("Gagal memproses feedback", 500, error);
  }
}
