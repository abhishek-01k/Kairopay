import { NextRequest } from "next/server";

import connectDB from "@/lib/db/mongodb";
import { Order, Transaction } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/middleware/auth";
import {
  dispatchWebhook,
  createWebhookEvent,
} from "@/lib/services/webhook-service";
import { logApiError } from "@/lib/utils/logger";
import { successResponse, errorResponse } from "@/lib/utils/response";

import type { CompleteOrderResponse, OrderRouteParams } from "@/types/api";

import { ORDER_STATUS, TRANSACTION_STATUS } from "@/lib/constants";

/**
 * Complete Order
 *
 * @route POST /api/apps/{app_id}/orders/{order_id}/complete
 * @description Mark an order as complete/verified (requires confirmed transaction)
 * @access Private (API Key or Privy Token)
 *
 * @param app_id - Application ID
 * @param order_id - Order ID
 * @returns Order completion status
 */
export async function POST(
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

    // Check if order has confirmed transactions
    const confirmedTx = await Transaction.findOne({
      order_id,
      status: TRANSACTION_STATUS.CONFIRMED,
    });

    if (!confirmedTx) {
      return errorResponse(
        "NO_CONFIRMED_TRANSACTION",
        "Order has no confirmed transactions",
        400
      );
    }

    // Update order status to verified
    order.status = ORDER_STATUS.VERIFIED;
    await order.save();

    // Dispatch webhook (fire and forget)
    if (order.webhook_url) {
      const event = createWebhookEvent("order.complete", {
        order_id: order.order_id,
        tx_hash: confirmedTx.tx_hash,
        chain: confirmedTx.chain,
        asset: confirmedTx.asset,
        amount: confirmedTx.amount,
        merchant_id: order.merchant_id,
        app_id: order.app_id,
      });

      dispatchWebhook(order.webhook_url, event).catch((err) =>
        logApiError("POST", "/webhook", err, { order_id })
      );
    }

    // Return success response
    return successResponse<CompleteOrderResponse>({
      order_id: order.order_id,
      status: order.status,
      message: "Order marked as complete",
    });
  } catch (error) {
    logApiError(
      "POST",
      `/api/apps/${app_id}/orders/${order_id}/complete`,
      error,
      {
        app_id,
        order_id,
      }
    );

    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
