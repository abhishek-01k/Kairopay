import { nanoid } from "nanoid";

export function generateMerchantId(): string {
  return `m_${nanoid(16)}`;
}

export function generateAppId(): string {
  return `app_${nanoid(16)}`;
}

export function generateOrderId(): string {
  return `ord_${nanoid(16)}`;
}

export function generateApiKey(
  prefix: "sk_test" | "sk_live" = "sk_test"
): string {
  return `${prefix}_${nanoid(32)}`;
}
