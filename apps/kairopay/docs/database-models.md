# Database Models

KairoPay uses MongoDB with Mongoose for type-safe database operations. This document describes the data models and their relationships.

## 📊 Collections Overview

- **merchants** - Merchant accounts and apps
- **orders** - Payment orders
- **transactions** - On-chain transaction records

---

## 🏢 Merchant Model

Stores merchant account information and their registered apps.

### Schema

```typescript
{
  merchant_id: string      // Unique ID (e.g., "m_abc123")
  privy_did: string        // Privy DID (unique, indexed)
  evm_wallet?: string      // EVM wallet address (optional)
  sol_wallet?: string      // Solana wallet address (optional)
  apps: Array<{
    app_id: string         // Unique app ID
    api_key: string        // Hashed API key (bcrypt)
    name: string           // App name
    webhook_url?: string   // Webhook callback URL
    created_at: Date
  }>
  created_at: Date
  updated_at: Date
}
```

### Indexes

- `merchant_id` (unique)
- `privy_did` (unique)

### Example Document

```json
{
  "_id": "670f...",
  "merchant_id": "m_abc123xyz456",
  "privy_did": "did:privy:abc123",
  "evm_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "sol_wallet": null,
  "apps": [
    {
      "app_id": "app_xyz789",
      "api_key": "$2b$10$...", // bcrypt hash
      "name": "My Shop",
      "webhook_url": "https://myshop.com/webhooks",
      "created_at": "2025-10-21T12:00:00.000Z"
    }
  ],
  "created_at": "2025-10-21T10:00:00.000Z",
  "updated_at": "2025-10-21T12:00:00.000Z"
}
```

### Usage

```typescript
import { Merchant } from "@/lib/db/models";

// Find merchant by Privy DID
const merchant = await Merchant.findOne({ privy_did: "did:privy:abc" });

// Create new merchant
const newMerchant = await Merchant.create({
  merchant_id: "m_123",
  privy_did: "did:privy:abc",
  apps: [],
});

// Add app to merchant
merchant.apps.push({
  app_id: "app_xyz",
  api_key: hashedKey,
  name: "Shop",
  created_at: new Date(),
});
await merchant.save();
```

---

## 📦 Order Model

Stores payment order information.

### Schema

```typescript
{
  order_id: string           // Unique ID (e.g., "ord_abc123")
  merchant_id: string        // Reference to merchant (indexed)
  app_id: string            // Reference to app (indexed)
  customer_did?: string     // Customer Privy DID (indexed)
  amount_usd: number        // Amount in USD
  currency: string          // Default "USD"
  metadata?: object         // Custom merchant data
  webhook_url?: string      // Order-specific webhook URL
  status: OrderStatus       // Enum: created, pending, completed, verified, failed
  checkout_url: string      // Iframe checkout URL
  expires_at: Date          // Order expiration
  created_at: Date
  updated_at: Date
}
```

### Order Status Flow

```
created → pending → completed → verified
   ↓         ↓
 failed    failed
```

### Indexes

- `order_id` (unique)
- `merchant_id`
- `app_id`
- `customer_did`
- `status`

### Example Document

```json
{
  "_id": "670f...",
  "order_id": "ord_xyz789abc",
  "merchant_id": "m_abc123",
  "app_id": "app_xyz789",
  "customer_did": "did:privy:customer123",
  "amount_usd": 25.0,
  "currency": "USD",
  "metadata": {
    "product_id": "prod_123",
    "customer_email": "user@example.com"
  },
  "webhook_url": "https://myshop.com/webhooks",
  "status": "completed",
  "checkout_url": "https://pay.kairopay.com/order/ord_xyz789abc",
  "expires_at": "2025-10-21T12:15:00.000Z",
  "created_at": "2025-10-21T12:00:00.000Z",
  "updated_at": "2025-10-21T12:05:00.000Z"
}
```

### Usage

```typescript
import { Order } from "@/lib/db/models";
import { ORDER_STATUS } from "@/lib/constants";

// Find orders by app
const orders = await Order.find({ app_id: "app_xyz" });

// Find completed orders
const completed = await Order.find({ status: ORDER_STATUS.COMPLETED });

// Update order status
await Order.updateOne(
  { order_id: "ord_123" },
  { status: ORDER_STATUS.COMPLETED }
);
```

---

## 💳 Transaction Model

Stores on-chain transaction details.

### Schema

```typescript
{
  tx_hash: string              // Transaction hash (unique, indexed)
  order_id: string            // Reference to order (indexed)
  merchant_id: string         // Denormalized for queries (indexed)
  app_id: string             // Denormalized for queries (indexed)
  chain: string              // Any chain (e.g., "ethereum", "polygon")
  asset: string              // Any asset (e.g., "USDC", "ETH")
  amount: number             // Amount in asset units
  usd_value: number          // USD value at payment time
  from: string               // Sender address
  to: string                 // Recipient address (merchant wallet)
  status: TransactionStatus  // Enum: pending, confirmed, failed
  confirmed_at?: Date        // Block confirmation timestamp
  created_at: Date
  updated_at: Date
}
```

### Transaction Status Flow

```
pending → confirmed
   ↓
 failed
```

### Indexes

- `tx_hash` (unique)
- `order_id`
- `merchant_id`
- `app_id`
- `status`

### Example Document

```json
{
  "_id": "670f...",
  "tx_hash": "0xabc123...",
  "order_id": "ord_xyz789",
  "merchant_id": "m_abc123",
  "app_id": "app_xyz789",
  "chain": "ethereum",
  "asset": "USDC",
  "amount": 25.0,
  "usd_value": 25.0,
  "from": "0xcustomer123...",
  "to": "0xmerchant456...",
  "status": "confirmed",
  "confirmed_at": "2025-10-21T12:05:30.000Z",
  "created_at": "2025-10-21T12:05:00.000Z",
  "updated_at": "2025-10-21T12:05:30.000Z"
}
```

### Usage

```typescript
import { Transaction } from "@/lib/db/models";
import { TRANSACTION_STATUS } from "@/lib/constants";

// Find transaction by hash
const tx = await Transaction.findOne({ tx_hash: "0xabc..." });

// Get all transactions for an app
const txs = await Transaction.find({ app_id: "app_xyz" });

// Calculate total revenue
const revenue = await Transaction.aggregate([
  { $match: { app_id: "app_xyz", status: "confirmed" } },
  { $group: { _id: null, total: { $sum: "$usd_value" } } },
]);
```

---

## 🔗 Relationships

```
Merchant (1) ──── (N) Apps
    │
    └──── (N) Orders
              │
              └──── (N) Transactions
```

### Denormalization

`merchant_id` and `app_id` are duplicated in the Transaction model for performance:

**Benefits:**

- Direct queries without joins
- Faster analytics
- Simplified reporting

**Trade-off:**

- Slightly more storage
- Must update both Order and Transaction

---

## 🎯 Query Patterns

### Get All Data for a Merchant

```typescript
const merchant = await Merchant.findOne({ privy_did });
const orders = await Order.find({ merchant_id: merchant.merchant_id });
const txs = await Transaction.find({ merchant_id: merchant.merchant_id });
```

### Get App-Specific Analytics

```typescript
// Revenue by asset
const revenue = await Transaction.aggregate([
  { $match: { app_id: "app_xyz", status: "confirmed" } },
  {
    $group: {
      _id: "$asset",
      total: { $sum: "$usd_value" },
      count: { $sum: 1 },
    },
  },
]);

// Recent orders
const recent = await Order.find({ app_id: "app_xyz" })
  .sort({ created_at: -1 })
  .limit(10);
```

---

## 🔐 Security Considerations

- **API Keys:** Always hashed with bcrypt (10 rounds)
- **Indexes:** Ensure proper indexes for query performance
- **Validation:** Mongoose schema validation enforced
- **Soft Deletes:** Not implemented (hard deletes only)

---

## 📚 Type Definitions

All models export TypeScript interfaces:

```typescript
import type { IMerchant, IApp } from "@/lib/db/models";
import type { IOrder } from "@/lib/db/models";
import type { ITransaction } from "@/lib/db/models";
```

See `/lib/db/models/*.ts` for full type definitions.
