# Orders API Documentation

_Coming Soon_

The Orders API will allow merchants to create payment orders, track transactions, and manage the checkout flow.

## 📍 Planned Endpoints

### 1. Create Order

**POST** `/api/orders/register`

Creates a new payment order and returns a checkout URL.

**Request:**

```json
{
  "app_id": "app_xyz789",
  "order_id": "ord_merchant_123", // Optional merchant order ID
  "amount_usd": 25.0,
  "currency": "USD",
  "metadata": {
    "product_id": "prod_123",
    "customer_email": "user@example.com"
  },
  "webhook_url": "https://myshop.com/webhooks" // Optional override
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "order_id": "ord_xyz789abc",
    "checkout_url": "https://pay.kairopay.com/order/ord_xyz789abc",
    "expires_at": "2025-10-21T12:15:00Z"
  }
}
```

---

### 2. Submit Transaction

**POST** `/api/orders/{order_id}/tx`

Records a payment transaction for an order.

**Request:**

```json
{
  "tx_hash": "0xabc123...",
  "chain": "ethereum",
  "asset": "USDC",
  "from": "0xcustomer...",
  "to": "0xmerchant...",
  "amount": "25.00"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "pending",
    "message": "Transaction detected and queued for verification"
  }
}
```

---

### 3. Complete Order

**POST** `/api/orders/{order_id}/complete`

Marks an order as complete after payment verification.

**Response:**

```json
{
  "success": true,
  "data": {
    "order_id": "ord_xyz789",
    "status": "complete"
  }
}
```

---

### 4. Get Order Details

**GET** `/api/orders/{order_id}`

Retrieves order information and associated transactions.

**Response:**

```json
{
  "success": true,
  "data": {
    "order_id": "ord_xyz789",
    "merchant_id": "m_abc123",
    "app_id": "app_xyz789",
    "amount_usd": 25.0,
    "status": "completed",
    "transactions": [
      {
        "tx_hash": "0xabc...",
        "chain": "ethereum",
        "asset": "USDC",
        "amount": 25.0,
        "status": "confirmed"
      }
    ],
    "created_at": "2025-10-21T12:00:00Z"
  }
}
```

---

## 🔄 Order Status Flow

```
created (checkout generated)
   ↓
pending (customer initiated payment)
   ↓
completed (tx confirmed on-chain)
   ↓
verified (final validation)
```

## 📡 Webhooks

The following webhooks will be triggered during the order lifecycle:

- `order.created` - Order registered
- `order.pending` - Payment initiated
- `order.payment.completed` - Payment confirmed
- `order.payment.verified` - Final verification
- `order.complete` - Order finalized
- `order.payment.denied` - Payment rejected

See [Webhooks Guide](./webhooks.md) for details.

---

## 📚 Coming Soon

This API is under active development. Check back soon for:

- Complete endpoint specifications
- Code examples
- SDK integration guides
- Testing instructions

For now, see [Database Models](./database-models.md) to understand the Order schema.
