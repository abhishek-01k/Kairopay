import { customAlphabet } from "nanoid";

// Alphanumeric only (no special characters)
const alphanumeric = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  16
);

// For API keys (longer, alphanumeric only, no ambiguous chars)
const apiKeyAlphabet = customAlphabet(
  "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz",
  48
);

export function generateMerchantId(): string {
  return `m_${alphanumeric()}`;
}

export function generateAppId(): string {
  return `app${alphanumeric()}`;
}

export function generateOrderId(): string {
  return `ord_${alphanumeric()}`;
}

export function generateApiKey(): string {
  return `sk${apiKeyAlphabet()}`;
}
