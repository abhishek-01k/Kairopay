# Complete cURL Examples

All cURL requests for KairoPay API endpoints. Copy and paste to test.

## 🏥 Health Check

### Check API Status

```bash
curl http://localhost:3000/api/health
```

**Expected Response:**

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

### 1. Register Merchant

**Basic Registration (No Wallets):**

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test_merchant_001"
  }'
```

**With EVM Wallet:**

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test_merchant_002",
    "evm_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

**With Both Wallets:**

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test_merchant_003",
    "evm_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "sol_wallet": "FqE7vN9nDxDQAKXX4mhPJvS5vt6y4T9rC1qG9xKT9"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "merchant_id": "m_abc123xyz456",
    "privy_did": "did:privy:test_merchant_001",
    "evm_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "sol_wallet": null,
    "created_at": "2025-10-21T12:00:00.000Z"
  }
}
```

---

### 2. Create App for Merchant

**Basic App (No Webhook):**

```bash
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test_merchant_001",
    "name": "My Shop"
  }'
```

**With Webhook URL:**

```bash
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test_merchant_001",
    "name": "Production Shop",
    "webhook_url": "https://myshop.com/api/webhooks/kairopay"
  }'
```

**With webhook.site for Testing:**

```bash
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:test_merchant_001",
    "name": "Test Shop",
    "webhook_url": "https://webhook.site/unique-uuid-here"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "app_id": "app_xyz789abc",
    "api_key": "sk_test_abc123def456ghi789jkl012mno345",
    "name": "My Shop",
    "created_at": "2025-10-21T12:05:00.000Z"
  }
}
```

⚠️ **Important:** Save the `api_key` - it's only shown once!

---

### 3. Get Merchant Profile

**Get Single Merchant:**

```bash
curl http://localhost:3000/api/merchant/did:privy:test_merchant_001
```

**Pretty Print JSON (with jq):**

```bash
curl http://localhost:3000/api/merchant/did:privy:test_merchant_001 | jq
```

**Save to File:**

```bash
curl http://localhost:3000/api/merchant/did:privy:test_merchant_001 > merchant.json
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "merchant_id": "m_abc123xyz456",
    "privy_did": "did:privy:test_merchant_001",
    "evm_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "sol_wallet": null,
    "apps": [
      {
        "app_id": "app_xyz789abc",
        "name": "My Shop",
        "webhook_url": "https://myshop.com/api/webhooks/kairopay",
        "created_at": "2025-10-21T12:05:00.000Z"
      },
      {
        "app_id": "app_def456ghi",
        "name": "Production Shop",
        "webhook_url": null,
        "created_at": "2025-10-21T13:10:00.000Z"
      }
    ],
    "created_at": "2025-10-21T12:00:00.000Z"
  }
}
```

---

### 4. Get Merchant Balances

**Get Balances:**

```bash
curl http://localhost:3000/api/merchant/did:privy:test_merchant_001/balances
```

**Pretty Print:**

```bash
curl http://localhost:3000/api/merchant/did:privy:test_merchant_001/balances | jq
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "wallets": {
      "evm": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "sol": null
    },
    "balances": {
      "eth": "0.0000",
      "usdc": "0.00",
      "pyusd": "0.00"
    },
    "updated_at": "2025-10-21T12:30:00.000Z"
  }
}
```

⚠️ **Note:** Currently returns mock data. Real balances via Alchemy coming soon.

---

## 🧪 Complete Test Flow

Run these commands in sequence to test the full merchant flow:

### Step 1: Check Health

```bash
curl http://localhost:3000/api/health
```

### Step 2: Register Merchant

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:demo_merchant",
    "evm_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

### Step 3: Create First App

```bash
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:demo_merchant",
    "name": "Demo Store",
    "webhook_url": "https://webhook.site/your-unique-id"
  }'
```

### Step 4: Create Second App

```bash
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:demo_merchant",
    "name": "Mobile App"
  }'
```

### Step 5: Get Merchant Profile

```bash
curl http://localhost:3000/api/merchant/did:privy:demo_merchant | jq
```

### Step 6: Check Balances

```bash
curl http://localhost:3000/api/merchant/did:privy:demo_merchant/balances | jq
```

---

## 🚨 Error Examples

### Invalid Request (Missing Field)

```bash
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "privy_did is required"
  }
}
```

---

### Duplicate Merchant

```bash
# Try registering the same merchant twice
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:demo_merchant"
  }'
```

**Response:**

```json
{
  "success": false,
  "error": {
    "code": "MERCHANT_EXISTS",
    "message": "Merchant with this Privy DID already exists"
  }
}
```

---

### Merchant Not Found

```bash
curl http://localhost:3000/api/merchant/did:privy:nonexistent
```

**Response:**

```json
{
  "success": false,
  "error": {
    "code": "MERCHANT_NOT_FOUND",
    "message": "Merchant not found"
  }
}
```

---

## 🛠️ Useful cURL Options

### Verbose Output (See Headers)

```bash
curl -v http://localhost:3000/api/health
```

### Silent Mode (No Progress Bar)

```bash
curl -s http://localhost:3000/api/health
```

### Save Response to File

```bash
curl http://localhost:3000/api/merchant/did:privy:demo_merchant \
  -o merchant.json
```

### Include Response Headers

```bash
curl -i http://localhost:3000/api/health
```

### Follow Redirects

```bash
curl -L http://localhost:3000/api/health
```

### Set Timeout

```bash
curl --max-time 10 http://localhost:3000/api/health
```

---

## 📊 Testing with Variables

### Bash Script Example

```bash
#!/bin/bash

# Set variables
PRIVY_DID="did:privy:script_test"
API_URL="http://localhost:3000/api"

# Register merchant
echo "Registering merchant..."
curl -X POST $API_URL/merchant/register \
  -H "Content-Type: application/json" \
  -d "{\"privy_did\": \"$PRIVY_DID\"}"

# Create app
echo "Creating app..."
curl -X POST $API_URL/merchant/register/app \
  -H "Content-Type: application/json" \
  -d "{\"privy_did\": \"$PRIVY_DID\", \"name\": \"Scripted App\"}"

# Get profile
echo "Fetching profile..."
curl $API_URL/merchant/$PRIVY_DID | jq
```

---

## 🌐 Production URLs

When deploying to production, replace `localhost:3000` with your production URL:

```bash
# Production example
curl -X POST https://api.kairopay.com/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "privy_did": "did:privy:prod_merchant",
    "evm_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

---

## 🔧 Troubleshooting

### Connection Refused

```bash
# Check if server is running
curl http://localhost:3000/api/health

# If fails, start dev server:
cd apps/kairopay && pnpm dev
```

### Database Not Connected

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# If database: "disconnected", start MongoDB:
brew services start mongodb-community
```

### Invalid JSON

```bash
# ❌ Bad (missing quotes)
curl -X POST http://localhost:3000/api/merchant/register \
  -d '{privy_did: did:privy:test}'

# ✅ Good (valid JSON)
curl -X POST http://localhost:3000/api/merchant/register \
  -H "Content-Type: application/json" \
  -d '{"privy_did": "did:privy:test"}'
```

---

## 📚 Related Documentation

- [API Reference](./api-reference.md)
- [Merchant API](./merchant-api.md)
- [Getting Started](./getting-started.md)

---

**Last Updated:** October 21, 2025
