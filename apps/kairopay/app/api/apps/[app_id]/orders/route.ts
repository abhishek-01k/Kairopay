import { NextRequest } from "next/server";

import connectDB from "@/lib/db/mongodb";
import { Order, Merchant, Transaction } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/middleware/auth";
import {
  dispatchWebhook,
  createWebhookEvent,
} from "@/lib/services/webhook-service";
import { generateOrderId } from "@/lib/utils/id-generator";
import { logApiError } from "@/lib/utils/logger";
import { successResponse, errorResponse } from "@/lib/utils/response";
import {
  validatePaginationParams,
  validatePositiveNumber,
  validateRequiredFields,
} from "@/lib/validators";

import type {
  AppRouteParams,
  CreateOrderRequest,
  CreateOrderResponse,
  ListOrdersResponse,
  OrderDetails,
} from "@/types/api";

import { ORDER_STATUS } from "@/lib/constants";

/**
 * List Orders
 *
 * @route GET /api/apps/{app_id}/orders
 * @description List all orders for an app with pagination and filtering
 * @access Private (API Key or Privy Token)
 *
 * @query status - Filter by order status (optional)
 * @query limit - Number of orders per page (default: 50, max: 100)
 * @query offset - Pagination offset (default: 0)
 *
 * @returns Paginated list of orders with transaction counts
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<AppRouteParams> }
) {
  try {
    // Extract route params
    const params = await context.params;
    const { app_id } = params;

    // Authenticate with either API key or Privy token
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

    // Connect to database
    await connectDB();

    // Parse and validate query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const { limit, offset } = validatePaginationParams(searchParams);

    // Build query
    const query: Record<string, unknown> = { app_id };
    if (status) {
      query.status = status;
    }

    // Fetch orders
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      Order.countDocuments(query),
    ]);

    // Get transaction counts for each order
    const ordersWithTxCount: OrderDetails[] = await Promise.all(
      orders.map(async (order) => {
        const txCount = await Transaction.countDocuments({
          order_id: order.order_id,
        });
        return {
          order_id: order.order_id,
          merchant_id: order.merchant_id,
          app_id: order.app_id,
          customer_did: order.customer_did,
          amount_usd: order.amount_usd,
          currency: order.currency,
          metadata: order.metadata || {},
          status: order.status,
          checkout_url: order.checkout_url,
          expires_at: order.expires_at,
          transaction_count: txCount,
          created_at: order.created_at,
          updated_at: order.updated_at,
        };
      })
    );

    // Return paginated response
    return successResponse<ListOrdersResponse>({
      orders: ordersWithTxCount,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    });
  } catch (error) {
    const params = await context.params;
    const { app_id } = params;
    const { searchParams } = new URL(request.url);
    const errorStatus = searchParams.get("status") || undefined;
    logApiError("GET", `/api/apps/${app_id}/orders`, error, {
      app_id,
      status: errorStatus,
    });

    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}

/**
 * Create Order
 *
 * @route POST /api/apps/{app_id}/orders
 * @description Create a new payment order and get checkout URL
 * @access Private (API Key or Privy Token)
 *
 * @body CreateOrderRequest
 * @returns Order ID, checkout URL, and expiration time
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<AppRouteParams> }
) {
  try {
    // Extract route params
    const params = await context.params;
    const { app_id } = params;

    // Authenticate with either API key or Privy token
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

    // Parse request body
    const body: CreateOrderRequest = await request.json();
    const { amount_usd, currency = "USD", metadata, webhook_url } = body;

    // Validate required fields
    const amountValidation = validatePositiveNumber(amount_usd, "amount_usd");
    if (!amountValidation.success) {
      return errorResponse("INVALID_REQUEST", amountValidation.error!);
    }

    // Connect to database
    await connectDB();

    // Get merchant to find webhook URL
    const merchant = await Merchant.findOne({
      merchant_id: authContext.merchant_id,
    });
    if (!merchant) {
      return errorResponse("MERCHANT_NOT_FOUND", "Merchant not found", 404);
    }

    // Find app to get default webhook URL
    const app = merchant.apps.find((a) => a.app_id === app_id);
    const finalWebhookUrl = webhook_url || app?.webhook_url;

    // Generate order details
    const order_id = body.order_id || generateOrderId();
    const checkout_url = `${process.env.NEXT_PUBLIC_APP_URL}/order/${order_id}`;
    const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create order
    const order = await Order.create({
      order_id,
      merchant_id: authContext.merchant_id,
      app_id,
      amount_usd,
      currency,
      metadata: metadata || {},
      webhook_url: finalWebhookUrl,
      status: ORDER_STATUS.CREATED,
      checkout_url,
      expires_at,
    });

    // Dispatch webhook (fire and forget)
    if (finalWebhookUrl) {
      const event = createWebhookEvent("order.created", {
        order_id: order.order_id,
        merchant_id: authContext.merchant_id,
        app_id,
      });

      dispatchWebhook(finalWebhookUrl, event).catch((err) =>
        logApiError("POST", "/webhook", err, { order_id })
      );
    }

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
    const params = await context.params;
    const { app_id } = params;
    let errorAmountUsd: number | undefined;
    try {
      const body = await request.json();
      errorAmountUsd = body.amount_usd;
    } catch {
      errorAmountUsd = undefined;
    }
    logApiError("POST", `/api/apps/${app_id}/orders`, error, {
      app_id,
      amount_usd: errorAmountUsd,
    });

    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
