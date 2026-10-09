import {
  boolean,
  check,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const gyms = pgTable("gyms", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  timezone: varchar("timezone", { length: 64 }).notNull().default("Africa/Accra"),
  defaultCurrency: varchar("default_currency", { length: 3 }).notNull().default("USD"),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const user = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  phone: varchar("phone", { length: 32 }),
  status: varchar("status", { length: 16 }).notNull().default("active"),
  ...timestamps,
}, (table) => [
  uniqueIndex("users_email_normalized_idx").on(sql`lower(${table.email})`),
]);

export const session = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [index("sessions_user_id_idx").on(table.userId)]);

export const account = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 100 }).notNull(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  ...timestamps,
}, (table) => [uniqueIndex("accounts_provider_account_idx").on(table.providerId, table.accountId)]);

export const verification = pgTable("verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
});

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 32 }).notNull().unique(),
  description: text("description"),
});

export const userGymRoles = pgTable("user_gym_roles", {
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.gymId, table.roleId] })]);

export const platformRoles = pgTable("platform_roles", {
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.roleId] })]);

export const trainers = pgTable("trainers", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 160 }).notNull(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  specialties: jsonb("specialties").$type<string[]>().notNull().default([]),
  active: boolean("active").notNull().default(true),
  ...timestamps,
}, (table) => [index("trainers_gym_idx").on(table.gymId)]);

export const membershipPlans = pgTable("membership_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),
  priceMinor: integer("price_minor").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  monthlyClassLimit: integer("monthly_class_limit"),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  active: boolean("active").notNull().default(true),
  ...timestamps,
}, (table) => [check("membership_plans_price_positive", sql`${table.priceMinor} > 0`)]);

export const memberships = pgTable("memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "restrict" }),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  planId: uuid("plan_id").notNull().references(() => membershipPlans.id, { onDelete: "restrict" }),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  periodStart: timestamp("period_start", { withTimezone: true }),
  periodEnd: timestamp("period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  ...timestamps,
}, (table) => [
  uniqueIndex("memberships_active_user_gym_idx")
    .on(table.gymId, table.userId)
    .where(sql`${table.status} in ('active', 'past_due')`),
  uniqueIndex("memberships_stripe_customer_idx").on(table.stripeCustomerId),
  uniqueIndex("memberships_stripe_subscription_idx").on(table.stripeSubscriptionId),
  index("memberships_gym_idx").on(table.gymId),
]);

export const classes = pgTable("classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "restrict" }),
  trainerId: uuid("trainer_id").references(() => trainers.id, { onDelete: "set null" }),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  capacity: integer("capacity").notNull(),
  status: varchar("status", { length: 24 }).notNull().default("scheduled"),
  ...timestamps,
}, (table) => [
  index("classes_gym_start_idx").on(table.gymId, table.startsAt),
  check("classes_time_order", sql`${table.endsAt} > ${table.startsAt}`),
  check("classes_capacity_positive", sql`${table.capacity} > 0`),
]);

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "restrict" }),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "restrict" }),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  status: varchar("status", { length: 24 }).notNull().default("booked"),
  bookedAt: timestamp("booked_at", { withTimezone: true }).defaultNow().notNull(),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  idempotencyKey: varchar("idempotency_key", { length: 128 }).notNull(),
}, (table) => [
  uniqueIndex("bookings_active_class_user_idx")
    .on(table.classId, table.userId)
    .where(sql`${table.status} in ('booked', 'waitlisted')`),
  uniqueIndex("bookings_user_idempotency_idx").on(table.userId, table.idempotencyKey),
  index("bookings_gym_class_idx").on(table.gymId, table.classId),
]);

export const waitlistEntries = pgTable("waitlist_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "restrict" }),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "restrict" }),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  position: integer("position").notNull(),
  status: varchar("status", { length: 24 }).notNull().default("active"),
  ...timestamps,
}, (table) => [
  uniqueIndex("waitlist_active_class_user_idx")
    .on(table.classId, table.userId)
    .where(sql`${table.status} = 'active'`),
  index("waitlist_class_position_idx").on(table.classId, table.position),
]);

export const classCreditLedger = pgTable("class_credit_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "restrict" }),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  membershipId: uuid("membership_id").notNull().references(() => memberships.id, { onDelete: "restrict" }),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "restrict" }),
  amount: integer("amount").notNull(),
  reason: varchar("reason", { length: 32 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const checkIns = pgTable("check_ins", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "restrict" }),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "restrict" }),
  checkedInBy: uuid("checked_in_by").notNull().references(() => user.id, { onDelete: "restrict" }),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("check_ins_class_user_idx").on(table.classId, table.userId)]);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").notNull().references(() => gyms.id, { onDelete: "restrict" }),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  membershipId: uuid("membership_id").references(() => memberships.id, { onDelete: "restrict" }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  amountMinor: integer("amount_minor").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: varchar("status", { length: 24 }).notNull().default("pending"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  uniqueIndex("payments_stripe_intent_idx").on(table.stripePaymentIntentId),
  index("payments_gym_created_idx").on(table.gymId, table.createdAt),
]);

export const stripeEvents = pgTable("stripe_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  stripeEventId: varchar("stripe_event_id", { length: 255 }).notNull().unique(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: jsonb("payload").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  processingError: text("processing_error"),
  ...timestamps,
});

export const emailDeliveries = pgTable("email_deliveries", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "restrict" }),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  kind: varchar("kind", { length: 48 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }),
  status: varchar("status", { length: 24 }).notNull().default("queued"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  ...timestamps,
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "restrict" }),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  kind: varchar("kind", { length: 48 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  ...timestamps,
});

export const featureFlags = pgTable("feature_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 80 }).notNull(),
  description: text("description"),
  enabled: boolean("enabled").notNull().default(false),
  rolloutPercentage: integer("rollout_percentage").notNull().default(0),
  targeting: jsonb("targeting").$type<Record<string, unknown>>(),
  ...timestamps,
}, (table) => [
  uniqueIndex("feature_flags_gym_key_idx").on(table.gymId, table.key),
  check("feature_flags_rollout_range", sql`${table.rolloutPercentage} between 0 and 100`),
]);

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "set null" }),
  eventName: varchar("event_name", { length: 80 }).notNull(),
  schemaVersion: integer("schema_version").notNull(),
  subjectId: varchar("subject_id", { length: 128 }).notNull(),
  properties: jsonb("properties").$type<Record<string, unknown>>().notNull().default({}),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "set null" }),
  objectKey: varchar("object_key", { length: 512 }).notNull().unique(),
  purpose: varchar("purpose", { length: 48 }).notNull(),
  contentType: varchar("content_type", { length: 100 }).notNull(),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text"),
  visibility: varchar("visibility", { length: 16 }).notNull().default("public"),
  ...timestamps,
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: uuid("actor_user_id").references(() => user.id, { onDelete: "set null" }),
  gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const authSchema = { user, session, account, verification };
