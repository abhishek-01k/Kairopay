import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 10;

export async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, SALT_ROUNDS);
}

export async function verifyApiKey(
  apiKey: string,
  hashedKey: string
): Promise<boolean> {
  return bcrypt.compare(apiKey, hashedKey);
}

export function generateWebhookSignature(
  payload: unknown,
  secret: string
): string {
  const payloadString = JSON.stringify(payload);
  return crypto
    .createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex");
}
