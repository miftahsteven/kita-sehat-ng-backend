import { verifyToken } from "@/lib/auth";
import { errorResponse } from "@/lib/api-response";

export interface AdminPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

export async function authorizeAdmin(request: Request): Promise<AdminPayload | null> {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);

  return payload as AdminPayload | null;
}

export function unauthorized() {
  return errorResponse("Unauthorized", 401);
}
