import { z } from "zod";

export type ToolContext = {
  gymId: string;
  subjectId: string;
  isAuthenticated: boolean;
};

export type ToolDefinition<Input, Output> = {
  name: string;
  description: string;
  input: z.ZodType<Input>;
  execute: (input: Input, context: ToolContext) => Promise<Output>;
};

export type MembershipPlanSummary = {
  slug: string;
  name: string;
  priceMinor: number;
  currency: string;
  monthlyClassLimit: number | null;
};

export type ClassSummary = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  trainerName: string | null;
  remainingCapacity: number;
};

export type TrainerSummary = {
  name: string;
  bio: string | null;
  specialties: string[];
};

export type FacilitySummary = { name: string; description: string };
export type OpeningHours = { day: string; open: string; close: string };

const noInput = z.object({});

export const machoToolNames = [
  "getMembershipPlans",
  "getTodayClasses",
  "getTrainerProfiles",
  "getOpeningHours",
  "getFacilities",
  "getSignupLink",
] as const;

export type MachoToolName = (typeof machoToolNames)[number];

export type PublicGymDataSource = {
  getMembershipPlans: (gymId: string) => Promise<MembershipPlanSummary[]>;
  getTodayClasses: (gymId: string) => Promise<ClassSummary[]>;
  getTrainerProfiles: (gymId: string) => Promise<TrainerSummary[]>;
  getOpeningHours: (gymId: string) => Promise<OpeningHours[]>;
  getFacilities: (gymId: string) => Promise<FacilitySummary[]>;
};

export function createMachoTools(source: PublicGymDataSource): Record<MachoToolName, ToolDefinition<unknown, unknown>> {
  return {
    getMembershipPlans: { name: "getMembershipPlans", description: "Return active public membership plans.", input: noInput, execute: async (_, context) => source.getMembershipPlans(context.gymId) },
    getTodayClasses: { name: "getTodayClasses", description: "Return today's published classes and availability.", input: noInput, execute: async (_, context) => source.getTodayClasses(context.gymId) },
    getTrainerProfiles: { name: "getTrainerProfiles", description: "Return public trainer profiles.", input: noInput, execute: async (_, context) => source.getTrainerProfiles(context.gymId) },
    getOpeningHours: { name: "getOpeningHours", description: "Return public gym opening hours.", input: noInput, execute: async (_, context) => source.getOpeningHours(context.gymId) },
    getFacilities: { name: "getFacilities", description: "Return public facilities and amenities.", input: noInput, execute: async (_, context) => source.getFacilities(context.gymId) },
    getSignupLink: { name: "getSignupLink", description: "Return the public membership signup URL.", input: noInput, execute: async () => ({ path: "/register" }) },
  };
}
