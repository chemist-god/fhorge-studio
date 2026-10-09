import { describe, expect, it } from "vitest";
import { isFeatureEnabled } from "@/server/flags";

describe("feature flags", () => {
  it("honors an environment override", () => {
    process.env.FEATURE_FLAG_WAITLIST_SYSTEM = "on";
    expect(isFeatureEnabled({ key: "waitlist_system", enabled: false, rolloutPercentage: 0 }, "member-1")).toBe(true);
    delete process.env.FEATURE_FLAG_WAITLIST_SYSTEM;
  });

  it("supports a fully enabled flag", () => {
    expect(isFeatureEnabled({ key: "ai_assistant", enabled: true, rolloutPercentage: 100 }, "member-1")).toBe(true);
  });
});
