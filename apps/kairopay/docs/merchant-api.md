# Merchant API Documentation

## 🎯 Overview

The Merchant API allows merchants to register, create apps, and manage their payment infrastructure.

---

## 📍 Endpoints

### 1. Register Merchant

**POST** `/api/merchant/register`

Creates a new merchant account with Privy DID.

**Request Body:**

```json
{
  "privy_did": "did:privy:abc123",
  "evm_wallet": "0xabc...", // Optional
  "sol_wallet": "9Zz...kT9" // Optional
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "merchant_id": "m_abc123",
    "privy_did": "did:privy:abc123",
    "evm_wallet": "0xabc...",
    "sol_wallet": "9Zz...kT9",
    "created_at": "2025-10-21T..."
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test123",
    "evm_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

---

### 2. Create App

**POST** `/api/merchant/register/app`

Creates a new app/project for a merchant.

**Request Body:**

```json
{
  "privy_did": "did:privy:abc123",
  "name": "My Shop",
  "webhook_url": "https://myshop.com/webhooks" // Optional
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "app_id": "app_xyz789",
    "api_key": "sk_test_abc123...",
    "name": "My Shop",
    "created_at": "2025-10-21T..."
  }
}
```

⚠️ **Important:** Save the `api_key` - it's only shown once!

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test123",
    "name": "Test Shop",
    "webhook_url": "https://example.com/webhooks"
  }'
```

---

### 3. Get Merchant Profile

**GET** `/api/merchant/{privy_did}`

Fetches merchant profile with all apps.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "merchant_id": "m_abc123",
    "privy_did": "did:privy:abc123",
    "evm_wallet": "0xabc...",
    "sol_wallet": "9Zz...kT9",
    "apps": [
      {
        "app_id": "app_xyz789",
        "name": "My Shop",
        "webhook_url": "https://myshop.com/webhooks",
        "created_at": "2025-10-21T..."
      }
    ],
    "created_at": "2025-10-21T..."
  }
}
```

**cURL Example:**

```bash
curl http://localhost:3000/api/merchant/did:privy:test123
```

---

### 4. Get Merchant Balances

**GET** `/api/merchant/{privy_did}/balances`

Fetches live on-chain balances for merchant wallets.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "wallets": {
      "evm": "0xabc...",
      "sol": "9Zz...kT9"
    },
    "balances": {
      "eth": "0.0342",
      "usdc": "250.12",
      "pyusd": "125.00"
    },
    "updated_at": "2025-10-21T..."
  }
}
```

⚠️ **Note:** Currently returns mock data. Alchemy integration coming soon.

**cURL Example:**

```bash
curl http://localhost:3000/api/merchant/did:privy:test123/balances
```

---

## 🚨 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes:

| Code                 | Status | Description                 |
| -------------------- | ------ | --------------------------- |
| `INVALID_REQUEST`    | 400    | Missing required fields     |
| `MERCHANT_EXISTS`    | 409    | Merchant already registered |
| `MERCHANT_NOT_FOUND` | 404    | Merchant doesn't exist      |
| `INTERNAL_ERROR`     | 500    | Server error                |

---

## 🧪 Testing Flow

1. **Register a merchant:**

   ```bash
   curl -X POST http://localhost:3000/api/merchant/register \
     -H "Content-Type: application/json" \
     -d '{"privy_did": "did:privy:test123"}'
   ```

2. **Create an app:**

   ```bash
   curl -X POST http://localhost:3000/api/merchant/register/app \
     -H "Content-Type: application/json" \
     -d '{"privy_did": "did:privy:test123", "name": "Test Shop"}'
   ```

3. **Get merchant profile:**

   ```bash
   curl http://localhost:3000/api/merchant/did:privy:test123
   ```

4. **Get balances:**
   ```bash
   curl http://localhost:3000/api/merchant/did:privy:test123/balances
   ```

---

## 📦 TypeScript Types

Import types from `types/api.ts`:

```typescript
import type {
  RegisterMerchantRequest,
  RegisterMerchantResponse,
  CreateAppRequest,
  CreateAppResponse,
  GetMerchantResponse,
  GetBalancesResponse,
} from "@/types/api";
```

---

## 🔐 Security Notes

- API keys are hashed with bcrypt before storage
- API keys are only returned once upon creation
- Merchant wallets are optional (can be added later)
- All responses follow consistent success/error format
