import { NextRequest } from "next/server";

import connectDB from "@/lib/db/mongodb";
import { Order, Transaction } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/middleware/auth";
import { logApiError } from "@/lib/utils/logger";
import { successResponse, errorResponse } from "@/lib/utils/response";

import type { GetOrderResponse, OrderRouteParams } from "@/types/api";

/**
 * Get Order Details
 *
 * @route GET /api/apps/{app_id}/orders/{order_id}
 * @description Get detailed information about a specific order with all transactions
 * @access Private (API Key or Privy Token)
 *
 * @param app_id - Application ID
 * @param order_id - Order ID
 * @returns Order details with list of associated transactions
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<OrderRouteParams> }
) {
  try {
    // Extract route params
    const params = await context.params;
    const { app_id, order_id } = params;

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

    // Find order
    const order = await Order.findOne({ order_id, app_id });
    if (!order) {
      return errorResponse("ORDER_NOT_FOUND", "Order not found", 404);
    }

    // Get associated transactions
    const transactions = await Transaction.find({ order_id }).lean();

    // Return order details with transactions
    return successResponse<GetOrderResponse>({
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
      transactions: transactions.map((tx) => ({
        tx_hash: tx.tx_hash,
        order_id: tx.order_id,
        chain: tx.chain,
        asset: tx.asset,
        amount: tx.amount,
        usd_value: tx.usd_value,
        from: tx.from,
        to: tx.to,
        status: tx.status,
        confirmed_at: tx.confirmed_at,
        created_at: tx.created_at,
      })),
      created_at: order.created_at,
      updated_at: order.updated_at,
    });
  } catch (error) {
    const params = await context.params;
    const { app_id, order_id } = params;
    logApiError("GET", `/api/apps/${app_id}/orders/${order_id}`, error, {
      app_id,
      order_id,
    });

    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
