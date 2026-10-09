import { z } from "zod";

export const assistantMessageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
});
