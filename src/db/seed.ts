import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { auth } from "@/server/auth";
import { gyms, membershipPlans, platformRoles, roles, user } from "./schema";
import { billingConfig } from "@/lib/env";

const planSeeds = [
  { slug: "base", name: "Base", priceMinor: billingConfig.planPricesMinor.base, monthlyClassLimit: 4 },
  { slug: "plus", name: "Plus", priceMinor: billingConfig.planPricesMinor.plus, monthlyClassLimit: 12 },
  { slug: "unlimited", name: "Unlimited", priceMinor: billingConfig.planPricesMinor.unlimited, monthlyClassLimit: null },
] as const;

async function getOrCreateGym() {
  const existing = await db.query.gyms.findFirst({ where: eq(gyms.slug, "forge-accra") });
  if (existing) return existing;
  const [created] = await db.insert(gyms).values({
    slug: "forge-accra",
    name: "FORGE Studio - Accra",
    timezone: "Africa/Accra",
    defaultCurrency: "USD",
  }).returning();
  return created;
}

async function getOrCreateRole(name: string) {
  const existing = await db.query.roles.findFirst({ where: eq(roles.name, name) });
  if (existing) return existing;
  const [created] = await db.insert(roles).values({ name }).returning();
  return created;
}

async function seed() {
  await getOrCreateGym();
  for (const plan of planSeeds) {
    const existing = await db.query.membershipPlans.findFirst({ where: eq(membershipPlans.slug, plan.slug) });
    if (!existing) {
      await db.insert(membershipPlans).values({ ...plan, currency: "USD" });
    }
  }

  const superAdminRole = await getOrCreateRole("super_admin");
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("Seeded gym, plans, and roles. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create the demo admin.");
    return;
  }

  const existingAdmin = await db.query.user.findFirst({ where: eq(user.email, email) });
  const admin = existingAdmin ?? (await auth.api.signUpEmail({
    body: { email, password, name: "FORGE Demo Admin" },
  })).user;

  if (!admin) throw new Error("Better Auth did not return the seeded admin user.");
  await db.insert(platformRoles).values({ userId: admin.id, roleId: superAdminRole.id }).onConflictDoNothing();
  console.log(`Seeded demo admin: ${email}`);
}

await seed();
console.log("Database seed complete.");
