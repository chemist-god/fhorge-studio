import { describe, expect, it } from "vitest";
import { hasPermission, permissions } from "@/server/authorization";

describe("authorization", () => {
  it("keeps member access limited to member operations", () => {
    const context = { gymId: "gym-1", userId: "user-1", roles: ["member"] } as const;
    expect(hasPermission(context, permissions.bookingsWrite)).toBe(true);
    expect(hasPermission(context, permissions.classesWrite)).toBe(false);
  });

  it("allows admin operations for admins", () => {
    const context = { gymId: "gym-1", userId: "user-1", roles: ["admin"] } as const;
    expect(hasPermission(context, permissions.rolesManage)).toBe(true);
  });
});
