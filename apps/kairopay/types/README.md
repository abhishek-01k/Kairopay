# KairoPay TypeScript Types

Type definitions for frontend applications using KairoPay.

## Installation

These types are available within the monorepo:

```typescript
// Import all types
import type {
  CreateOrderRequest,
  ApiResponse,
  ORDER_STATUS,
} from "kairopay/types";

// Import client types for React/Next.js
import type { KairoPayClient } from "kairopay/types/client";
```

## Usage Examples

### Creating an Order (Frontend)

```typescript
import type {
  CreateOrderRequest,
  ApiResponse,
  CreateOrderResponse,
} from "kairopay/types";

async function createOrder(data: CreateOrderRequest) {
  const response = await fetch("/api/orders/register", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<CreateOrderResponse> = await response.json();

  if (result.success) {
    console.log("Checkout URL:", result.data.checkout_url);
  } else {
    console.error("Error:", result.error.message);
  }
}
```

### Submitting a Transaction

```typescript
import type {
  SubmitTransactionRequest,
  SubmitTransactionResponse,
} from "kairopay/types";

async function submitPayment(
  orderId: string,
  txData: SubmitTransactionRequest
) {
  const response = await fetch(`/api/orders/${orderId}/tx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(txData),
  });

  const result = await response.json();
  return result;
}
```

### React Component Example

```typescript
import { useState } from "react";
import type {
  GetOrderResponse,
  ORDER_STATUS_LABELS
} from "kairopay/types/client";

export function OrderStatus({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<GetOrderResponse | null>(null);

  // Fetch order...

  return (
    <div>
      <h2>Order {order?.order_id}</h2>
      <p>Status: {ORDER_STATUS_LABELS[order?.status || ""]}</p>
      <p>Amount: ${order?.amount_usd}</p>
    </div>
  );
}
```

### Webhook Handler

```typescript
import type { WebhookEvent } from "kairopay/types";

export async function POST(request: Request) {
  const event: WebhookEvent = await request.json();

  switch (event.event) {
    case "order.pending":
      console.log("Payment initiated:", event.order_id);
      break;
    case "order.complete":
      console.log("Payment complete:", event.order_id);
      break;
  }

  return new Response("OK");
}
```

## Available Types

### API Request/Response Types

- `RegisterMerchantRequest/Response`
- `CreateAppRequest/Response`
- `GetMerchantResponse`
- `GetBalancesResponse`
- `CreateOrderRequest/Response`
- `SubmitTransactionRequest/Response`
- `GetOrderResponse`
- `CompleteOrderResponse`
- `TransactionDetails`
- `MerchantApp`
- `ApiResponse<T>` - Generic API response wrapper
- `ApiSuccessResponse<T>` - Success response
- `ApiErrorResponse` - Error response

### Database Model Types

- `IMerchant` - Merchant document interface
- `IApp` - App subdocument interface
- `IOrder` - Order document interface
- `ITransaction` - Transaction document interface

### Constants & Enums

- `ORDER_STATUS` - Order status values
- `TRANSACTION_STATUS` - Transaction status values
- `COMMON_CHAINS` - Common blockchain names
- `COMMON_ASSETS` - Common crypto assets
- `COMMON_CHAIN_IDS` - Chain ID mappings
- `ERROR_CODES` - All API error codes

### Type Helpers

- `OrderStatus` - Order status type
- `TransactionStatus` - Transaction status type
- `Chain` - Chain type (accepts any string)
- `Asset` - Asset type (accepts any string)
- `ErrorCode` - Error code type
- `DeepPartial<T>` - Make all properties optional recursively
- `ExtractData<T>` - Extract data from ApiResponse
- `RequireKeys<T, K>` - Make specific keys required
- `PartialKeys<T, K>` - Make specific keys optional

### Client Helpers (from `kairopay/types/client`)

**Interfaces:**
- `KairoPayClient` - Type-safe client interface
- `KairoPayConfig` - Client configuration

**Display Labels:**
- `ORDER_STATUS_LABELS` - Human-readable order labels
- `ORDER_STATUS_COLORS` - Status colors for UI
- `TX_STATUS_LABELS` - Transaction status labels
- `TX_STATUS_COLORS` - Transaction status colors
- `ERROR_MESSAGES` - User-friendly error messages
- `CHAIN_NAMES` - Chain display names
- `ASSET_NAMES` - Asset display names

### Webhook Types

- `WebhookEvent` - Complete webhook event payload
- `WebhookEventType` - Event type union

### Authentication Types

- `AuthContext` - Authentication context from middleware

## Type Safety

All types are fully typed and exported:

```typescript
// Type-safe API calls
const response: ApiResponse<CreateOrderResponse> = await createOrder({
  amount_usd: 25.0,
  currency: "USD",
});

// Type guards
if (response.success) {
  // response.data is CreateOrderResponse
  console.log(response.data.checkout_url);
} else {
  // response.error is { code: string, message: string }
  console.error(response.error.code);
}

// Using utility types
import type { ExtractData, DeepPartial, ERROR_CODES } from "kairopay/types";

// Extract data type
type OrderData = ExtractData<ApiResponse<GetOrderResponse>>;

// Partial updates
const partialOrder: DeepPartial<IOrder> = {
  status: ORDER_STATUS.COMPLETED,
};

// Error handling
if (response.error?.code === ERROR_CODES.ORDER_NOT_FOUND) {
  // Handle specific error
}

// Display helpers
import { 
  ORDER_STATUS_LABELS, 
  CHAIN_NAMES,
  ERROR_MESSAGES 
} from "kairopay/types/client";

console.log(ORDER_STATUS_LABELS.pending); // "Payment Pending"
console.log(CHAIN_NAMES.ethereum); // "Ethereum"
console.log(ERROR_MESSAGES.UNAUTHORIZED); // "Unauthorized. Please check your API key."
```

## Notes

- All dates are returned as ISO 8601 strings from the API
- Amount fields are numbers (not strings)
- Chain and Asset types accept any string (not limited to predefined values)
