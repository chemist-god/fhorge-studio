import { AppError } from "@/lib/errors";
import type { GymContext } from "@/types/domain";

export const permissions = {
  profileRead: "profile:read",
  profileWrite: "profile:write",
  bookingsRead: "bookings:read",
  bookingsWrite: "bookings:write",
  billingManage: "billing:manage",
  checkInsWrite: "check_ins:write",
  classesRead: "classes:read",
  classesWrite: "classes:write",
  classesDelete: "classes:delete",
  membersRead: "members:read",
  membersWrite: "members:write",
  trainersWrite: "trainers:write",
  analyticsRead: "analytics:read",
  rolesManage: "roles:manage",
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];

const rolePermissions: Record<string, readonly Permission[]> = {
  member: [permissions.profileRead, permissions.profileWrite, permissions.bookingsRead, permissions.bookingsWrite, permissions.classesRead, permissions.billingManage],
  staff: [permissions.profileRead, permissions.bookingsRead, permissions.classesRead, permissions.checkInsWrite, permissions.classesWrite, permissions.membersRead],
  admin: Object.values(permissions),
  super_admin: Object.values(permissions),
};

export function hasPermission(context: GymContext, permission: Permission): boolean {
  return context.roles.some((role) => rolePermissions[role]?.includes(permission));
}

export function requirePermission(context: GymContext, permission: Permission): void {
  if (!hasPermission(context, permission)) {
    throw new AppError("FORBIDDEN", "You do not have permission for this action.", 403);
  }
}

export function requireGymContext(context: GymContext, gymId: string): void {
  if (context.gymId !== gymId) {
    throw new AppError("TENANT_CONTEXT_REQUIRED", "The selected gym is not available in this session.", 403);
  }
}
