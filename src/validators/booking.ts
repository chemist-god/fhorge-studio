import { z } from "zod";

export const bookingRequestSchema = z.object({
  gymId: z.string().uuid(),
  classId: z.string().uuid(),
  idempotencyKey: z.string().min(16).max(128),
});

export const bookingCancellationSchema = z.object({
  gymId: z.string().uuid(),
  bookingId: z.string().uuid(),
});
