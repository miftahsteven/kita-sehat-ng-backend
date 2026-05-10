import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100).optional(),
});
