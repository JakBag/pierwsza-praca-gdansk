import { Resend } from "resend";

let cachedResend: Resend | null = null;

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (cachedResend) return cachedResend;
  cachedResend = new Resend(apiKey);
  return cachedResend;
}
