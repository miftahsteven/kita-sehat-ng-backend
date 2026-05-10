import { NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  message = "Success",
  meta?: Record<string, unknown>
) {
  return NextResponse.json({
    success: true,
    message,
    data,
    meta: meta ?? null,
  });
}

export function errorResponse(
  message = "Internal Server Error",
  status = 500,
  details?: unknown
) {
  const isProduction = process.env.NODE_ENV === "production";

  return NextResponse.json(
    {
      success: false,
      message,
      details: isProduction ? null : details ?? null,
    },
    { status }
  );
}
