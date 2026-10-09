import { PostHog } from "posthog-node";
import { getServerEnv } from "@/lib/env";

let client: PostHog | undefined;

export function getPostHog(): PostHog {
  const env = getServerEnv();
  client ??= new PostHog(env.POSTHOG_API_KEY, { host: env.POSTHOG_HOST });
  return client;
}
