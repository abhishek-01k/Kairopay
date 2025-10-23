# KairoPay API Reference

Complete API documentation with examples for all endpoints.

---

## 🔗 Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://api.kairopay.com`

---

## 🔐 Authentication

### API Keys

Server-to-server requests require an API key in the Authorization header:

```bash
Authorization: Bearer skXYZ123abc456DEF789...
```

Get your API key by creating an app:

```bash
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{"privy_did": "did:privy:your_did", "name": "My App"}'
```

**API Key Format:**

- Prefix: `sk` (no underscore)
- Length: 50 characters (alphanumeric only)
- Example: `skXYZ123abc456DEF789ghi012JKL345mno678PQR901stu234VWX`

**App ID Format:**

- Prefix: `app` (no underscore)
- Length: 19 characters (alphanumeric only)
- Example: `appABCD1234xyz5678`

⚠️ **Save the API key** - it's only shown once!

---

## 📊 Response Format

**Success:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description"
  }
}
```

---

## 🏥 Health Check

### GET `/health`

Check API and database status.

```bash
curl http://localhost:3000/api/health
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2025-10-21T12:00:00.000Z"
  }
}
```

---

## 👤 Merchant Endpoints

### POST `/merchant/register`

Register a new merchant with Privy DID.

**Request:**

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test123",
    "evm_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "sol_wallet": "FqE7vN9nDxDQAKXX4mhPJvS5vt6y4T9rC1qG9xKT9"
  }'
```

**Fields:**

- `privy_did` (required)
- `evm_wallet` (optional)
- `sol_wallet` (optional)

**Response (201):**

```json
{
  "success": true,
  "data": {
    "merchant_id": "m_abc123",
    "privy_did": "did:privy:test123",
    "evm_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "sol_wallet": "FqE7vN9nDxDQAKXX4mhPJvS5vt6y4T9rC1qG9xKT9",
    "created_at": "2025-10-21T12:00:00.000Z"
  }
}
```

---

### POST `/merchant/register/app`

Create an app for a merchant and get API key.

**Request:**

```bash
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test123",
    "name": "My Shop",
    "webhook_url": "https://myshop.com/webhooks"
  }'
```

**Fields:**

- `privy_did` (required)
- `name` (required)
- `webhook_url` (optional)

**Response (201):**

```json
{
  "success": true,
  "data": {
    "app_id": "appABCD1234xyz5678",
    "api_key": "skXYZ123abc456DEF789ghi012JKL345mno678PQR901stu234VWX",
    "name": "My Shop",
    "created_at": "2025-10-21T12:00:00.000Z"
  }
}
```

---

### GET `/merchant/{privy_did}`

Get merchant profile with all apps.

**Request:**

```bash
curl http://localhost:3000/api/merchant/did:privy:test123
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "merchant_id": "m_abc123",
    "privy_did": "did:privy:test123",
    "evm_wallet": "0x742d...",
    "sol_wallet": null,
    "apps": [
      {
        "app_id": "app_xyz789",
        "name": "My Shop",
        "webhook_url": "https://myshop.com/webhooks",
        "created_at": "2025-10-21T12:00:00.000Z"
      }
    ],
    "created_at": "2025-10-21T11:00:00.000Z"
  }
}
```

---

### GET `/merchant/{privy_did}/balances`

Get live wallet balances (via Alchemy).

**Request:**

```bash
curl http://localhost:3000/api/merchant/did:privy:test123/balances
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "wallets": {
      "evm": "0x742d...",
      "sol": null
    },
    "balances": {
      "eth": "0.0342",
      "usdc": "250.12",
      "pyusd": "125.00"
    },
    "updated_at": "2025-10-21T12:00:00.000Z"
  }
}
```

---

## 📦 Order Endpoints

All order endpoints require **API key authentication** and are scoped to a specific app.

### POST `/apps/{app_id}/orders`

Create a payment order and get checkout URL.

**Request:**

```bash
curl -X POST http://localhost:3000/api/apps/appABCD1234xyz5678/orders \
  -H "Authorization: Bearer skXYZ123abc456DEF789ghi012JKL345mno678PQR901stu234VWX" \
  -H "Content-Type: application/json" \
  -d '{
    "amount_usd": 25.0,
    "currency": "USD",
    "metadata": {
      "product": "T-shirt",
      "size": "M"
    },
    "webhook_url": "https://myshop.com/webhooks"
  }'
```

**Fields:**

- `amount_usd` (required) - Amount in USD
- `currency` (optional) - Default "USD"
- `order_id` (optional) - Custom order ID
- `metadata` (optional) - Custom data
- `webhook_url` (optional) - Override app webhook

**Response (201):**

```json
{
  "success": true,
  "data": {
    "order_id": "ord_xyz789",
    "checkout_url": "http://localhost:3000/order/ord_xyz789",
    "expires_at": "2025-10-21T12:15:00.000Z"
  }
}
```

**Triggers:** `order.created` webhook

---

### POST `/orders/{order_id}/tx`

Submit a payment transaction (called by checkout frontend).

**No authentication required.**

**Request:**

```bash
curl -X POST http://localhost:3000/api/orders/ord_xyz789/tx \
  -H "Content-Type: application/json" \
  -d '{
    "tx_hash": "0xabc123def456...",
    "chain": "ethereum",
    "asset": "USDC",
    "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "to": "0xmerchant...",
    "amount": "25.00"
  }'
```

**Fields:**

- `tx_hash` (required)
- `chain` (required)
- `asset` (required)
- `from` (required)
- `to` (required)
- `amount` (required)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "status": "pending",
    "message": "Transaction detected and queued for verification",
    "tx_hash": "0xabc123...",
    "order_id": "ord_xyz789"
  }
}
```

**Triggers:** `order.pending` webhook

---

### POST `/apps/{app_id}/orders/{order_id}/complete`

Mark order as complete (requires API key).

**Request:**

```bash
curl -X POST http://localhost:3000/api/apps/app_xyz789/orders/ord_xyz789/complete \
  -H "Authorization: Bearer sk_test_abc123..."
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "order_id": "ord_xyz789",
    "status": "verified",
    "message": "Order marked as complete"
  }
}
```

**Triggers:** `order.complete` webhook

---

### GET `/apps/{app_id}/orders/{order_id}`

Get order details with all transactions (requires API key).

**Request:**

```bash
curl http://localhost:3000/api/apps/app_xyz789/orders/ord_xyz789 \
  -H "Authorization: Bearer sk_test_abc123..."
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "order_id": "ord_xyz789",
    "merchant_id": "m_abc123",
    "app_id": "app_xyz789",
    "customer_did": "did:privy:customer123",
    "amount_usd": 25.0,
    "currency": "USD",
    "metadata": { "product": "T-shirt" },
    "status": "completed",
    "checkout_url": "http://localhost:3000/order/ord_xyz789",
    "expires_at": "2025-10-21T12:15:00.000Z",
    "transactions": [
      {
        "tx_hash": "0xabc123...",
        "chain": "ethereum",
        "asset": "USDC",
        "amount": 25.0,
        "usd_value": 25.0,
        "from": "0xcustomer...",
        "to": "0xmerchant...",
        "status": "confirmed",
        "confirmed_at": "2025-10-21T12:05:30.000Z",
        "created_at": "2025-10-21T12:05:00.000Z"
      }
    ],
    "created_at": "2025-10-21T12:00:00.000Z",
    "updated_at": "2025-10-21T12:05:30.000Z"
  }
}
```

---

## 🔔 Webhooks

KairoPay sends HTTP POST requests to your webhook URL when events occur.

### Events

| Event                     | Triggered When    |
| ------------------------- | ----------------- |
| `order.created`           | Order registered  |
| `order.pending`           | Payment initiated |
| `order.payment.completed` | Payment confirmed |
| `order.complete`          | Order finalized   |

### Payload

```json
{
  "event": "order.pending",
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

### Verify Signature

```typescript
import crypto from "crypto";

function verifyWebhook(payload: any, secret: string): boolean {
  const signature = payload.signature.replace("sha256=", "");
  const computed = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
  return signature === computed;
}
```

### Example Handler (Next.js)

```typescript
// app/api/webhooks/route.ts
export async function POST(request: Request) {
  const payload = await request.json();

  if (!verifyWebhook(payload, process.env.API_SECRET_KEY!)) {
    return new Response("Invalid signature", { status: 401 });
  }

  switch (payload.event) {
    case "order.pending":
      // Handle payment initiated
      break;
    case "order.complete":
      // Handle order complete
      break;
  }

  return new Response("OK", { status: 200 });
}
```

---

## 🚨 Error Codes

| Code                 | Status | Description                  |
| -------------------- | ------ | ---------------------------- |
| `INVALID_REQUEST`    | 400    | Missing/invalid parameters   |
| `UNAUTHORIZED`       | 401    | Invalid API key              |
| `MERCHANT_NOT_FOUND` | 404    | Merchant doesn't exist       |
| `ORDER_NOT_FOUND`    | 404    | Order doesn't exist          |
| `ORDER_EXPIRED`      | 400    | Order expired (>15 min)      |
| `MERCHANT_EXISTS`    | 409    | Merchant already registered  |
| `TRANSACTION_EXISTS` | 409    | Transaction already recorded |
| `INTERNAL_ERROR`     | 500    | Server error                 |

---

## 🔄 Complete Payment Flow

```bash
# 1. Register merchant
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{"privy_did": "did:privy:merchant1"}'

# 2. Create app (get API key and app_id)
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{"privy_did": "did:privy:merchant1", "name": "Shop"}'
# Save the API key (skXYZ...) and app_id (appABCD...)!

# 3. Create order (use app_id in URL)
curl -X POST http://localhost:3000/api/apps/appABCD1234xyz5678/orders \
  -H "Authorization: Bearer skXYZ123abc456DEF789ghi012JKL345mno678PQR901stu234VWX" \
  -H "Content-Type: application/json" \
  -d '{"amount_usd": 25.0}'
# Get checkout_url and share with customer

# 4. Customer pays (frontend calls - public endpoint)
curl -X POST http://localhost:3000/api/orders/ord_xyz789/tx \
  -H "Content-Type: application/json" \
  -d '{
    "tx_hash": "0xabc...",
    "chain": "ethereum",
    "asset": "USDC",
    "from": "0xcustomer...",
    "to": "0xmerchant...",
    "amount": "25.00"
  }'

# 5. Complete order (after verification - use app_id in URL)
curl -X POST http://localhost:3000/api/apps/app_xyz789/orders/ord_xyz789/complete \
  -H "Authorization: Bearer sk_test_abc123..."

# 6. Get order details (use app_id in URL)
curl http://localhost:3000/api/apps/app_xyz789/orders/ord_xyz789 \
  -H "Authorization: Bearer sk_test_abc123..."
```

---

## 📚 Order Status Flow

```
created → pending → completed → verified
   ↓         ↓
failed    failed
```

---

## 🧪 Testing

Use [webhook.site](https://webhook.site) to test webhooks:

```bash
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test",
    "name": "Test",
    "webhook_url": "https://webhook.site/your-unique-id"
  }'
```

---

**Version:** 0.1.0  
**Last Updated:** October 21, 2025
