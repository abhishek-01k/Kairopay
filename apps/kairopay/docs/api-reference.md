# API Quick Reference

Quick reference for all KairoPay API endpoints.

## 🔑 Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://pay.kairopay.com/api`

## 📊 Response Format

All responses follow this structure:

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
    "message": "Human-readable message"
  }
}
```

---

## 🏥 Health Check

| Method | Endpoint  | Description                   |
| ------ | --------- | ----------------------------- |
| GET    | `/health` | Check API and database status |

---

## 👤 Merchant Endpoints

| Method | Endpoint                         | Description             | Auth   |
| ------ | -------------------------------- | ----------------------- | ------ |
| POST   | `/merchant/register`             | Register new merchant   | None   |
| POST   | `/merchant/register/app`         | Create app for merchant | None\* |
| GET    | `/merchant/{privy_did}`          | Get merchant profile    | None\* |
| GET    | `/merchant/{privy_did}/balances` | Get wallet balances     | None\* |

_\*Will require Privy authentication in production_

### Quick Examples

**Register Merchant:**

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{"privy_did": "did:privy:abc"}'
```

**Create App:**

```bash
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{"privy_did": "did:privy:abc", "name": "Shop"}'
```

**Get Merchant:**

```bash
curl http://localhost:3000/api/merchant/did:privy:abc
```

**Get Balances:**

```bash
curl http://localhost:3000/api/merchant/did:privy:abc/balances
```

---

## 📦 Order Endpoints

_Coming Soon_

| Method | Endpoint                | Description          | Auth    |
| ------ | ----------------------- | -------------------- | ------- |
| POST   | `/orders/register`      | Create payment order | API Key |
| POST   | `/orders/{id}/tx`       | Submit transaction   | API Key |
| POST   | `/orders/{id}/complete` | Mark order complete  | API Key |
| GET    | `/orders/{id}`          | Get order details    | API Key |

---

## 🔐 Authentication

### Merchant Dashboard

- Uses **Privy** for authentication
- DID-based identity (`did:privy:...`)

### Server-to-Server API

- Uses **API Keys** (`sk_test_...` or `sk_live_...`)
- Include in request header:
  ```
  Authorization: Bearer sk_test_abc123...
  ```

---

## 📡 Webhooks

Merchants receive real-time event notifications via webhooks.

### Events

| Event                     | Triggered When     |
| ------------------------- | ------------------ |
| `order.created`           | Order registered   |
| `order.pending`           | Payment initiated  |
| `order.payment.completed` | Payment confirmed  |
| `order.payment.verified`  | Final verification |
| `order.complete`          | Order finalized    |
| `order.payment.denied`    | Payment rejected   |

### Signature Verification

All webhooks include HMAC SHA-256 signature:

```typescript
const signature = crypto
  .createHmac("sha256", API_SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest("hex");
```

---

## 🚨 Common Error Codes

| Code                 | Status | Description                   |
| -------------------- | ------ | ----------------------------- |
| `INVALID_REQUEST`    | 400    | Missing or invalid parameters |
| `UNAUTHORIZED`       | 401    | Invalid or missing API key    |
| `MERCHANT_NOT_FOUND` | 404    | Merchant doesn't exist        |
| `ORDER_NOT_FOUND`    | 404    | Order doesn't exist           |
| `MERCHANT_EXISTS`    | 409    | Merchant already registered   |
| `INTERNAL_ERROR`     | 500    | Server error                  |

---

## 🧪 Testing

### Test Merchant Flow

```bash
# 1. Register merchant
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{"privy_did": "did:privy:test123"}'

# 2. Create app
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test123",
    "name": "Test Shop",
    "webhook_url": "https://webhook.site/unique-id"
  }'

# 3. Get profile
curl http://localhost:3000/api/merchant/did:privy:test123

# 4. Check balances
curl http://localhost:3000/api/merchant/did:privy:test123/balances
```

### Webhook Testing

Use [webhook.site](https://webhook.site) to inspect webhook payloads.

---

## 📚 Detailed Documentation

For complete documentation with examples and guides:

- [Getting Started](./getting-started.md)
- [Merchant API](./merchant-api.md)
- [Orders API](./orders-api.md)
- [Webhooks Guide](./webhooks.md)
- [Database Models](./database-models.md)

---

## 🔄 Rate Limits

_To be implemented_

Current: No rate limits in development

---

## 🌍 SDKs

_Coming Soon_

- JavaScript/TypeScript SDK
- React integration
- Payment widget

---

**Last Updated:** October 21, 2025
