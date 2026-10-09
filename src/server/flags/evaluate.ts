import { createHash } from "node:crypto";

export type FeatureFlagRecord = {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
  targeting?: Record<string, unknown> | null;
};

function environmentOverride(key: string): boolean | undefined {
  const value = process.env[`FEATURE_FLAG_${key.toUpperCase()}`]?.toLowerCase();
  if (value === "on" || value === "true") return true;
  if (value === "off" || value === "false") return false;
  return undefined;
}

export function isFeatureEnabled(flag: FeatureFlagRecord, subjectId: string): boolean {
  const override = environmentOverride(flag.key);
  if (override !== undefined) return override;
  if (!flag.enabled || flag.rolloutPercentage <= 0) return false;
  if (flag.rolloutPercentage >= 100) return true;

  const digest = createHash("sha256").update(`${flag.key}:${subjectId}`).digest();
  const bucket = digest.readUInt32BE(0) % 100;
  return bucket < flag.rolloutPercentage;
}
