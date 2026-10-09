export const gymRoles = ["member", "staff", "admin"] as const;
export const platformRoles = ["super_admin"] as const;
export type GymRole = (typeof gymRoles)[number];
export type PlatformRole = (typeof platformRoles)[number];

export type GymContext = {
  gymId: string;
  userId: string;
  roles: readonly string[];
};

export type MembershipPlan = {
  slug: "base" | "plus" | "unlimited";
  name: string;
  priceMinor: number;
  currency: "USD";
  monthlyClassLimit: number | null;
};
