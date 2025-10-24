# KairoPay Coding Standards

Modern, consistent patterns for the entire codebase.

---

## 📋 Table of Contents

1. [File Structure](#file-structure)
2. [Import Organization](#import-organization)
3. [Type Definitions](#type-definitions)
4. [API Route Structure](#api-route-structure)
5. [Validation Patterns](#validation-patterns)
6. [Error Handling](#error-handling)
7. [Database Operations](#database-operations)
8. [Response Formatting](#response-formatting)
9. [Constants & Configuration](#constants--configuration)
10. [Documentation](#documentation)

---

## 🗂️ File Structure

### API Routes

```
app/api/
├── [endpoint]/
│   ├── route.ts          # GET, POST, PUT, DELETE handlers
│   ├── types.ts          # Request/Response types
│   └── validation.ts     # Validation schemas (optional)
```

### Utilities

```
lib/
├── constants/            # All constants
├── db/                   # Database models & connection
├── middleware/           # Authentication, logging, etc.
├── services/             # Business logic
├── utils/                # Helper functions
└── validators/           # Reusable validation functions
```

---

## 📦 Import Organization

**Order: External → Internal → Types → Constants**

```typescript
// ✅ Good
import { NextRequest } from "next/server";
import { z } from "zod";

import connectDB from "@/lib/db/mongodb";
import { Order, Merchant } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/middleware/auth";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { generateOrderId } from "@/lib/utils/id-generator";

import type { CreateOrderRequest, CreateOrderResponse } from "./types";

import { ORDER_STATUS } from "@/lib/constants";

// ❌ Bad
import { ORDER_STATUS } from "@/lib/constants";
import { NextRequest } from "next/server";
import { Merchant } from "@/lib/db/models";
import connectDB from "@/lib/db/mongodb";
```

---

## 🎯 Type Definitions

### Request/Response Types

**Always define types for:**

- Request bodies
- Response data
- Query parameters
- Route parameters

```typescript
// types.ts
export interface CreateOrderRequest {
  amount_usd: number;
  currency?: string;
  metadata?: Record<string, unknown>;
  webhook_url?: string;
  order_id?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  checkout_url: string;
  expires_at: Date;
}

export interface OrderQueryParams {
  status?: string;
  limit?: string;
  offset?: string;
}

export interface RouteParams {
  app_id: string;
  order_id?: string;
}
```

---

## 🔧 API Route Structure

**Standard Template:**

```typescript
import { NextRequest } from "next/server";

import connectDB from "@/lib/db/mongodb";
import { Model } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/middleware/auth";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { validateRequestBody } from "@/lib/validators";

import type { RequestType, ResponseType, RouteParams } from "./types";

import { CONSTANTS } from "@/lib/constants";

/**
 * @route METHOD /api/endpoint
 * @description What this endpoint does
 * @access Private/Public
 */
export async function METHOD(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    // 1. Extract route params
    const params = await context.params;
    const { param_id } = params;

    // 2. Authentication (if required)
    const { error, context: authContext } = await authenticateRequest(
      request,
      param_id
    );
    if (error || !authContext) {
      return errorResponse(
        "UNAUTHORIZED",
        error || "Authentication failed",
        401
      );
    }

    // 3. Parse request body/query params
    const body = await request.json();

    // 4. Validate input
    const validation = validateRequestBody(body);
    if (!validation.success) {
      return errorResponse("INVALID_REQUEST", validation.error);
    }

    // 5. Connect to database
    await connectDB();

    // 6. Business logic
    const result = await performOperation(validation.data);

    // 7. Return response
    return successResponse<ResponseType>(result, 200);
  } catch (error) {
    console.error("[METHOD /api/endpoint] Error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
```

---

## ✅ Validation Patterns

### Using Zod (Recommended)

```typescript
import { z } from "zod";

// Define schema
const createOrderSchema = z.object({
  amount_usd: z.number().positive("Amount must be greater than 0"),
  currency: z.string().length(3).default("USD"),
  metadata: z.record(z.unknown()).optional(),
  webhook_url: z.string().url().optional(),
  order_id: z.string().optional(),
});

// Validate
export function validateCreateOrder(data: unknown) {
  try {
    const validated = createOrderSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", "),
      };
    }
    return { success: false, error: "Validation failed" };
  }
}
```

### Manual Validation (Simple Cases)

```typescript
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): { success: boolean; error?: string } {
  for (const field of fields) {
    if (!data[field]) {
      return { success: false, error: `${String(field)} is required` };
    }
  }
  return { success: true };
}

// Usage
const validation = validateRequiredFields(body, ["amount_usd", "currency"]);
if (!validation.success) {
  return errorResponse("INVALID_REQUEST", validation.error!);
}
```

---

## 🚨 Error Handling

### Error Codes

```typescript
// lib/constants/error-codes.ts
export const ERROR_CODES = {
  // Client errors (400s)
  INVALID_REQUEST: { code: "INVALID_REQUEST", status: 400 },
  UNAUTHORIZED: { code: "UNAUTHORIZED", status: 401 },
  FORBIDDEN: { code: "FORBIDDEN", status: 403 },
  NOT_FOUND: { code: "NOT_FOUND", status: 404 },
  CONFLICT: { code: "CONFLICT", status: 409 },

  // Specific business errors
  MERCHANT_EXISTS: { code: "MERCHANT_EXISTS", status: 409 },
  MERCHANT_NOT_FOUND: { code: "MERCHANT_NOT_FOUND", status: 404 },
  ORDER_NOT_FOUND: { code: "ORDER_NOT_FOUND", status: 404 },
  ORDER_EXPIRED: { code: "ORDER_EXPIRED", status: 400 },
  TRANSACTION_EXISTS: { code: "TRANSACTION_EXISTS", status: 409 },

  // Server errors (500s)
  INTERNAL_ERROR: { code: "INTERNAL_ERROR", status: 500 },
  DATABASE_ERROR: { code: "DATABASE_ERROR", status: 500 },
} as const;
```

### Usage

```typescript
import { ERROR_CODES } from "@/lib/constants/error-codes";

// With error code constant
return errorResponse(
  ERROR_CODES.ORDER_NOT_FOUND.code,
  "Order not found",
  ERROR_CODES.ORDER_NOT_FOUND.status
);

// Or directly
return errorResponse("ORDER_NOT_FOUND", "Order not found", 404);
```

### Logging

```typescript
// Always log errors with context
try {
  // ... code
} catch (error) {
  console.error("[POST /api/orders] Error creating order:", {
    error: error instanceof Error ? error.message : error,
    app_id,
    merchant_id,
  });

  return errorResponse(
    "INTERNAL_ERROR",
    error instanceof Error ? error.message : "Unknown error",
    500
  );
}
```

---

## 💾 Database Operations

### Connection

```typescript
// Always connect before operations
await connectDB();
```

### Queries

```typescript
// ✅ Good - Use lean() for read operations
const orders = await Order.find({ app_id })
  .sort({ created_at: -1 })
  .limit(limit)
  .skip(offset)
  .lean();

// ✅ Good - Use Promise.all for parallel queries
const [orders, total] = await Promise.all([
  Order.find(query).lean(),
  Order.countDocuments(query),
]);

// ❌ Bad - Sequential queries
const orders = await Order.find(query).lean();
const total = await Order.countDocuments(query);
```

### Error Handling

```typescript
try {
  const result = await Model.create(data);
  return successResponse(result);
} catch (error) {
  // Handle MongoDB duplicate key error
  if (error instanceof Error && error.message.includes("E11000")) {
    return errorResponse("CONFLICT", "Resource already exists", 409);
  }

  throw error; // Re-throw for general error handler
}
```

---

## 📤 Response Formatting

### Success Responses

```typescript
// Simple data
return successResponse({ id: "123" });

// With status code
return successResponse(data, 201);

// With pagination
return successResponse({
  items: results,
  pagination: {
    total,
    limit,
    offset,
    has_more: offset + limit < total,
  },
});
```

### Error Responses

```typescript
// Simple error
return errorResponse("NOT_FOUND", "Resource not found", 404);

// Validation error with details
return errorResponse(
  "INVALID_REQUEST",
  `Validation failed: ${validationErrors.join(", ")}`
);
```

---

## ⚙️ Constants & Configuration

### Organization

```typescript
// lib/constants/index.ts
export * from "./order-status";
export * from "./transaction-status";
export * from "./error-codes";
export * from "./chains";
export * from "./assets";

// lib/constants/order-status.ts
export const ORDER_STATUS = {
  CREATED: "created",
  PENDING: "pending",
  COMPLETED: "completed",
  VERIFIED: "verified",
  FAILED: "failed",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
```

### Usage

```typescript
import { ORDER_STATUS } from "@/lib/constants";

// ✅ Good
order.status = ORDER_STATUS.COMPLETED;

// ❌ Bad
order.status = "completed";
```

---

## 📝 Documentation

### JSDoc Comments

````typescript
/**
 * Create a new payment order
 *
 * @route POST /api/apps/{app_id}/orders
 * @access Private (API Key or Privy Token)
 *
 * @param request - Next.js request object
 * @param context - Route context with app_id
 *
 * @returns Order created with checkout URL
 *
 * @example
 * ```typescript
 * POST /api/apps/app123/orders
 * {
 *   "amount_usd": 25.0,
 *   "currency": "USD",
 *   "metadata": { "product": "T-shirt" }
 * }
 * ```
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ app_id: string }> }
) {
  // ...
}
````

### Inline Comments

```typescript
// ✅ Good - Explain WHY, not WHAT
// Fire and forget - don't block response on webhook delivery
dispatchWebhook(url, event).catch(console.error);

// ❌ Bad - States the obvious
// Create an order
const order = await Order.create(data);
```

---

## 🎨 Code Style

### Naming Conventions

```typescript
// Constants - SCREAMING_SNAKE_CASE
export const MAX_LIMIT = 100;
export const ORDER_STATUS = { ... };

// Types/Interfaces - PascalCase
type OrderStatus = string;
interface CreateOrderRequest { ... }

// Functions/Variables - camelCase
const createOrder = async () => { ... };
const orderData = { ... };

// Files - kebab-case
// order-service.ts
// id-generator.ts
// error-codes.ts
```

### Async/Await

```typescript
// ✅ Good - Use async/await
try {
  const result = await operation();
  return successResponse(result);
} catch (error) {
  return errorResponse("ERROR", error.message);
}

// ❌ Bad - Don't use .then()
operation()
  .then((result) => successResponse(result))
  .catch((error) => errorResponse("ERROR", error.message));
```

### Destructuring

```typescript
// ✅ Good
const { amount_usd, currency, metadata } = body;
const { app_id, order_id } = params;

// ❌ Bad
const amount_usd = body.amount_usd;
const currency = body.currency;
```

---

## 📋 Checklist for New APIs

- [ ] Proper TypeScript types defined
- [ ] Imports organized correctly
- [ ] JSDoc comment added
- [ ] Input validation implemented
- [ ] Authentication added (if required)
- [ ] Error handling with try-catch
- [ ] Database connection established
- [ ] Response formatted correctly
- [ ] Constants used (no magic strings/numbers)
- [ ] Logged errors with context
- [ ] Added to API documentation

---

## 🔄 Migration Example

### Before (Non-standardized)

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.amount_usd) {
    return NextResponse.json({ error: "Amount required" }, { status: 400 });
  }

  const order = await Order.create({
    amount: body.amount_usd,
    status: "created",
  });

  return NextResponse.json({ data: order });
}
```

### After (Standardized)

```typescript
import { NextRequest } from "next/server";

import connectDB from "@/lib/db/mongodb";
import { Order } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/middleware/auth";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { validateCreateOrder } from "./validation";

import type { CreateOrderRequest, CreateOrderResponse } from "./types";

import { ORDER_STATUS } from "@/lib/constants";

/**
 * Create a new payment order
 * @route POST /api/apps/{app_id}/orders
 * @access Private
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ app_id: string }> }
) {
  try {
    const { app_id } = await context.params;

    // Authenticate
    const { error, context: authContext } = await authenticateRequest(
      request,
      app_id
    );
    if (error || !authContext) {
      return errorResponse(
        "UNAUTHORIZED",
        error || "Authentication failed",
        401
      );
    }

    // Parse and validate
    const body: CreateOrderRequest = await request.json();
    const validation = validateCreateOrder(body);

    if (!validation.success) {
      return errorResponse("INVALID_REQUEST", validation.error!);
    }

    // Database operation
    await connectDB();
    const order = await Order.create({
      ...validation.data,
      app_id,
      merchant_id: authContext.merchant_id,
      status: ORDER_STATUS.CREATED,
    });

    // Return response
    return successResponse<CreateOrderResponse>(
      {
        order_id: order.order_id,
        checkout_url: order.checkout_url,
        expires_at: order.expires_at,
      },
      201
    );
  } catch (error) {
    console.error("[POST /api/apps/:app_id/orders] Error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
```

---

**Version:** 1.0.0  
**Last Updated:** October 24, 2025
