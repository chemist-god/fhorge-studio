import { z } from "zod";

export const membershipPlanSlugSchema = z.enum(["base", "plus", "unlimited"]);

export const membershipChangeSchema = z.object({
  gymId: z.string().uuid(),
  planSlug: membershipPlanSlugSchema,
});
