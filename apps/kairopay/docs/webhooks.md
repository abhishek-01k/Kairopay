# Webhooks

Webhooks allow merchants to receive real-time notifications about payment events. When an event occurs, KairoPay sends an HTTP POST request to your configured webhook URL.

## 🔔 Event Types

| Event                     | Description        | Triggered When                      |
| ------------------------- | ------------------ | ----------------------------------- |
| `order.created`           | Order registered   | Merchant creates checkout session   |
| `order.pending`           | Payment initiated  | Customer submits transaction        |
| `order.payment.denied`    | Payment rejected   | Transaction invalid or insufficient |
| `order.payment.completed` | Payment confirmed  | Transaction verified on-chain       |
| `order.payment.verified`  | Final verification | All validations complete            |
| `order.complete`          | Order finalized    | Order marked as complete            |

## 📡 Webhook Payload

All webhooks follow this structure:

```json
{
  "event": "order.payment.completed",
  "order_id": "ord_xyz789",
  "tx_hash": "0xabc123...",
  "chain": "ethereum",
  "asset": "USDC",
  "amount": 25.0,
  "merchant_id": "m_abc123",
  "app_id": "app_xyz789",
  "timestamp": "2025-10-21T12:05:00Z",
  "signature": "sha256=abc123..."
}
```

## 🔐 Signature Verification

All webhooks are signed with HMAC SHA-256. Verify the signature to ensure authenticity.

### Verification Steps

1. **Extract signature** from `signature` field
2. **Compute HMAC** using payload + your API secret
3. **Compare** computed signature with received signature

### Example (Node.js)

```typescript
import crypto from "crypto";

function verifyWebhookSignature(
  payload: object,
  signature: string,
  secret: string
): boolean {
  const payloadString = JSON.stringify(payload);
  const computed = crypto
    .createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex");

  return `sha256=${computed}` === signature;
}

// Usage
const isValid = verifyWebhookSignature(
  webhookPayload,
  webhookPayload.signature,
  process.env.API_SECRET_KEY
);

if (!isValid) {
  throw new Error("Invalid webhook signature");
}
```

## 🛠️ Configuration

### Setting Webhook URL

#### Per-App (Recommended)

Set a default webhook URL when creating an app:

```bash
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:abc",
    "name": "My Shop",
    "webhook_url": "https://myshop.com/api/webhooks"
  }'
```

#### Per-Order (Optional)

Override the app webhook URL for specific orders:

```bash
curl -X POST http://localhost:3000/api/orders/register \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "app_xyz",
    "amount_usd": 25.00,
    "webhook_url": "https://myshop.com/api/special-webhook"
  }'
```

## 📥 Receiving Webhooks

### Example Endpoint (Next.js)

```typescript
// app/api/webhooks/route.ts
import { NextRequest } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const payload = await request.json();

  // Verify signature
  const isValid = verifySignature(payload);
  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  // Handle event
  switch (payload.event) {
    case "order.payment.completed":
      await handlePaymentCompleted(payload);
      break;
    case "order.complete":
      await handleOrderComplete(payload);
      break;
    default:
      console.log("Unhandled event:", payload.event);
  }

  return new Response("OK", { status: 200 });
}

async function handlePaymentCompleted(data: any) {
  // Update your database
  // Send confirmation email
  // Trigger fulfillment
  console.log("Payment completed:", data.order_id);
}
```

## ⚡ Best Practices

### 1. **Respond Quickly**

Return a `200 OK` response as fast as possible. Process the webhook asynchronously.

```typescript
// ✅ Good
export async function POST(request: NextRequest) {
  const payload = await request.json();

  // Quick validation
  if (!verifySignature(payload)) {
    return new Response("Invalid", { status: 401 });
  }

  // Queue for async processing
  await queue.add("process-webhook", payload);

  return new Response("OK", { status: 200 });
}

// ❌ Bad
export async function POST(request: NextRequest) {
  const payload = await request.json();

  // This takes too long!
  await sendEmail(payload);
  await updateInventory(payload);
  await notifyWarehouse(payload);

  return new Response("OK", { status: 200 });
}
```

### 2. **Handle Duplicates**

Webhooks may be sent multiple times. Use `order_id` or `tx_hash` for idempotency.

```typescript
async function handleWebhook(payload: any) {
  const existing = await db.webhooks.findOne({
    order_id: payload.order_id,
    event: payload.event,
  });

  if (existing) {
    console.log("Duplicate webhook, ignoring");
    return;
  }

  // Process webhook
  await db.webhooks.create(payload);
  await processOrder(payload);
}
```

### 3. **Implement Retries**

KairoPay will retry failed webhooks with exponential backoff:

- 1st retry: 1 minute
- 2nd retry: 5 minutes
- 3rd retry: 15 minutes
- Final retry: 1 hour

After 4 failures, webhooks are marked as failed.

### 4. **Secure Your Endpoint**

```typescript
// Verify signature
if (!verifySignature(payload)) {
  return new Response("Unauthorized", { status: 401 });
}

// Use HTTPS only
if (request.url.startsWith("http://")) {
  throw new Error("HTTPS required for webhooks");
}
```

### 5. **Log Everything**

```typescript
await db.webhookLogs.create({
  event: payload.event,
  order_id: payload.order_id,
  status: "received",
  received_at: new Date(),
  payload,
});
```

## 🧪 Testing Webhooks

### Local Testing with ngrok

```bash
# Install ngrok
brew install ngrok

# Start ngrok tunnel
ngrok http 3000

# Use the HTTPS URL
# https://abc123.ngrok.io/api/webhooks
```

### Manual Testing

```bash
curl -X POST https://yourapp.com/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.payment.completed",
    "order_id": "ord_test123",
    "tx_hash": "0xabc...",
    "chain": "ethereum",
    "asset": "USDC",
    "amount": 25.00,
    "merchant_id": "m_test",
    "app_id": "app_test",
    "timestamp": "2025-10-21T12:00:00Z",
    "signature": "sha256=..."
  }'
```

## 📊 Webhook Dashboard

_(Coming Soon)_

Monitor webhook delivery, retry status, and debug failures from your merchant dashboard.

## 🚨 Troubleshooting

### Webhook Not Received

1. Check webhook URL is correct
2. Ensure endpoint returns `200 OK`
3. Verify firewall allows incoming requests
4. Check webhook logs in dashboard

### Signature Verification Fails

1. Use the exact payload (no modifications)
2. Ensure correct API secret
3. Check for encoding issues
4. Verify HMAC algorithm (SHA-256)

### Duplicate Events

This is expected behavior. Implement idempotency using `order_id`.

---

## 📚 Related Documentation

- [Merchant API](./merchant-api.md)
- [Orders API](./orders-api.md)
- [Authentication](./authentication.md)
