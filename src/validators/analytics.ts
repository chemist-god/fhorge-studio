import { z } from "zod";

export const analyticsEventSchema = z.object({
  eventName: z.enum([
    "membership_viewed",
    "membership_selected",
    "checkout_started",
    "checkout_completed",
    "class_booked",
    "class_cancelled",
    "ai_chat_started",
    "ai_chat_completed",
    "trainer_profile_viewed",
  ]),
  schemaVersion: z.literal(1),
  gymId: z.string().uuid().optional(),
  subjectId: z.string().min(1).max(128),
  properties: z.record(z.unknown()).default({}),
});
