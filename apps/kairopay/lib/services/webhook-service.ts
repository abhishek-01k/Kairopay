import { generateWebhookSignature } from "@/lib/utils/crypto";

export interface WebhookEvent {
  event: string;
  order_id: string;
  tx_hash?: string;
  chain?: string;
  asset?: string;
  amount?: number;
  merchant_id: string;
  app_id: string;
  timestamp: string;
}

export async function dispatchWebhook(
  webhookUrl: string,
  event: WebhookEvent
): Promise<boolean> {
  try {
    const secret = process.env.API_SECRET_KEY! || "dev_secret";
    const signature = generateWebhookSignature(event, secret);

    const payload = {
      ...event,
      signature: `sha256=${signature}`,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-KairoPay-Signature": `sha256=${signature}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `Webhook failed: ${response.status}`,
        await response.text()
      );
      return false;
    }

    console.log(`✅ Webhook dispatched: ${event.event} → ${webhookUrl}`);
    return true;
  } catch (error) {
    console.error("Webhook dispatch error:", error);
    return false;
  }
}

export function createWebhookEvent(
  eventType: string,
  data: Partial<WebhookEvent>
): WebhookEvent {
  return {
    event: eventType,
    order_id: data.order_id || "",
    tx_hash: data.tx_hash,
    chain: data.chain,
    asset: data.asset,
    amount: data.amount,
    merchant_id: data.merchant_id || "",
    app_id: data.app_id || "",
    timestamp: new Date().toISOString(),
  };
}
