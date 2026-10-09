import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";

let client: Stripe | undefined;

export function getStripe(): Stripe {
  client ??= new Stripe(getServerEnv().STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
  return client;
}
