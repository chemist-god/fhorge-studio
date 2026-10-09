import { Resend } from "resend";
import { getServerEnv } from "@/lib/env";

let client: Resend | undefined;

export function getResend(): Resend {
  client ??= new Resend(getServerEnv().RESEND_API_KEY);
  return client;
}

export function getResendSender(): string {
  return getServerEnv().RESEND_FROM_EMAIL;
}
