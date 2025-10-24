# Authentication System

KairoPay uses a **dual authentication system** that supports both API keys and Privy access tokens.

## Overview

```
┌─────────────────────┐              ┌──────────────────────┐
│  External Merchant  │              │  Dashboard Frontend  │
│   (Your Backend)    │              │   (React/Next.js)    │
└──────────┬──────────┘              └──────────┬───────────┘
           │                                    │
           │ API Key (sk...)                    │ Privy JWT Token
           │ Authorization: Bearer sk...        │ Authorization: Bearer eyJ...
           │                                    │
           └────────────────┬───────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │  KairoPay Backend  │
                  │ authenticateRequest │
                  └─────────┬──────────┘
                            │
                  ┌─────────▼──────────┐
                  │  Token Detection   │
                  │  Starts with "sk"? │
                  └─────────┬──────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
     ┌──────▼────────┐            ┌────────▼────────┐
     │  API Key Auth │            │ Privy Token Auth│
     │  (bcrypt)     │            │ (JWT verify)    │
     └──────┬────────┘            └────────┬────────┘
            │                               │
            └───────────────┬───────────────┘
                            │
                  ┌─────────▼──────────┐
                  │   Auth Context     │
                  │ - merchant_id      │
                  │ - app_id           │
                  │ - privy_did        │
                  └────────────────────┘
```

---

## Authentication Methods

### 1. API Keys (for External Merchants)

**Use Case:** Server-to-server integration, external merchant backends

**Token Format:**

```
Authorization: Bearer skXYZ123abc456DEF789ghi012JKL345mno678PQR901stu234VWX
```

**How it works:**

1. Merchant creates an app via `POST /merchant/register/app`
2. Receives API key (starts with `sk`, 50 chars)
3. Includes API key in `Authorization` header
4. Backend verifies API key using bcrypt
5. Returns merchant context

**Example:**

```bash
curl http://localhost:3000/api/apps/appABC123/orders \
  -H "Authorization: Bearer skXYZ123abc456..."
```

---

### 2. Privy Access Tokens (for Dashboard)

**Use Case:** Dashboard authentication, internal use

**Token Format:**

```
Authorization: Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How it works:**

1. User logs in to dashboard via Privy
2. Privy issues JWT access token
3. Dashboard includes token in API requests
4. Backend verifies JWT signature with Privy
5. Extracts Privy DID, looks up merchant
6. Returns merchant context

**Example:**

```typescript
// Dashboard frontend
const { getAccessToken } = usePrivy();
const token = await getAccessToken();

const response = await fetch("/api/apps/appABC123/orders", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## Implementation

### Backend Auth Middleware

```typescript
// apps/kairopay/lib/middleware/auth.ts

export async function authenticateRequest(
  request: NextRequest,
  expectedAppId?: string
): Promise<{ error?: string; context?: AuthContext }> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader.replace("Bearer ", "").trim();

  // Auto-detect authentication type
  if (token.startsWith("sk")) {
    return authenticateApiKey(request, expectedAppId);
  } else {
    return authenticatePrivyToken(request, expectedAppId);
  }
}
```

### Dashboard API Client

```typescript
// apps/dashboard/lib/queries/config.ts

export async function apiFetch<T>(endpoint: string, options?: RequestInit) {
  // Automatically get and include Privy access token
  const accessToken = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  return response.json();
}
```

---

## Environment Variables

### KairoPay Backend (`apps/kairopay/.env`)

```bash
# Privy Configuration (for dashboard authentication)
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017/kairopay
```

### Dashboard (`apps/dashboard/.env`)

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your-privy-client-id

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## API Endpoints

### Public Endpoints (No Auth)

- `GET /api/health` - Health check
- `POST /api/merchant/register` - Register merchant
- `POST /api/merchant/register/app` - Create app
- `GET /api/merchant/{privy_did}` - Get merchant profile
- `POST /api/orders/{order_id}/tx` - Submit payment

### Authenticated Endpoints (API Key OR Privy Token)

- `POST /api/apps/{app_id}/orders` - Create order
- `GET /api/apps/{app_id}/orders` - List orders
- `GET /api/apps/{app_id}/transactions` - List transactions
- `GET /api/apps/{app_id}/balances` - Dashboard stats
- `GET /api/apps/{app_id}/orders/{order_id}` - Order details
- `POST /api/apps/{app_id}/orders/{order_id}/complete` - Complete order

---

## Security Features

### API Key Security

- ✅ Stored hashed with bcrypt (never plaintext)
- ✅ Shown only once at creation
- ✅ 50 characters, alphanumeric
- ✅ Prefix `sk` for easy identification

### Privy Token Security

- ✅ ES256 signed JWT
- ✅ Verified against Privy's public key
- ✅ Auto-expires (1 hour)
- ✅ Auto-refreshes via `getAccessToken()`
- ✅ Contains user's Privy DID

### Token Rotation

- API Keys: Manual rotation (revoke/create new app)
- Privy Tokens: Automatic (refreshed every hour)

---

## Error Handling

### Common Errors

| Error                                 | Cause                         | Solution                                |
| ------------------------------------- | ----------------------------- | --------------------------------------- |
| `Missing Authorization header`        | No token provided             | Include `Authorization: Bearer <token>` |
| `Invalid API key format`              | Token doesn't start with `sk` | Use correct API key                     |
| `Invalid or expired access token`     | Privy JWT expired/invalid     | Call `getAccessToken()` to refresh      |
| `Merchant not found for this user`    | User not registered           | Register via `/merchant/register`       |
| `API key does not belong to this app` | Wrong app ID                  | Use correct app_id in URL               |

---

## Testing

### Test API Key Authentication

```bash
# 1. Create app
curl -X POST http://localhost:3000/api/merchant/register/app \
  -H "Content-Type: application/json" \
  -d '{"privy_did": "did:privy:test123", "name": "Test App"}'

# Save the api_key and app_id from response

# 2. Use API key
curl http://localhost:3000/api/apps/APP_ID/orders \
  -H "Authorization: Bearer API_KEY"
```

### Test Privy Token Authentication

```typescript
// Dashboard component
const { getAccessToken } = usePrivy();

const testAuth = async () => {
  const token = await getAccessToken();
  console.log("Access token:", token);

  const response = await fetch("/api/apps/APP_ID/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("Response:", await response.json());
};
```

---

## Migration Guide

If you have existing code using only `authenticateApiKey`:

**Before:**

```typescript
import { authenticateApiKey } from "@/lib/middleware/auth";

const { error, context } = await authenticateApiKey(request, app_id);
```

**After:**

```typescript
import { authenticateRequest } from "@/lib/middleware/auth";

const { error, context } = await authenticateRequest(request, app_id);
```

All existing API key integrations will continue to work without changes!

---

## Benefits

1. ✅ **No API keys in frontend** - Dashboard users don't need API keys
2. ✅ **Backward compatible** - External merchants still use API keys
3. ✅ **Automatic token refresh** - Privy handles token expiration
4. ✅ **Single codebase** - One auth middleware for both use cases
5. ✅ **Secure by default** - JWT verification + bcrypt hashing
6. ✅ **Easy to extend** - Add more auth methods if needed

---

**Last Updated:** October 24, 2025
