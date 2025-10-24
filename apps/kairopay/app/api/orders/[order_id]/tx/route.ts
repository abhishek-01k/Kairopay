import { NextRequest } from "next/server";

import connectDB from "@/lib/db/mongodb";
import { Order, Transaction } from "@/lib/db/models";
import {
  dispatchWebhook,
  createWebhookEvent,
} from "@/lib/services/webhook-service";
import { logApiError } from "@/lib/utils/logger";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { validateRequiredFields } from "@/lib/validators";

import type {
  SubmitTransactionRequest,
  SubmitTransactionResponse,
} from "@/types/api";

import { ORDER_STATUS, TRANSACTION_STATUS } from "@/lib/constants";

/**
 * Submit Transaction
 *
 * @route POST /api/orders/{order_id}/tx
 * @description Submit a payment transaction for an order (called by checkout frontend)
 * @access Public (No authentication required)
 *
 * @param order_id - Order ID
 * @body SubmitTransactionRequest
 * @returns Transaction submission status
 *
 * @example
 * ```json
 * {
 *   "tx_hash": "0xabc123...",
 *   "chain": "ethereum",
 *   "asset": "USDC",
 *   "from": "0xcustomer...",
 *   "to": "0xmerchant...",
 *   "amount": "25.00"
 * }
 * ```
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ order_id: string }> }
) {
  try {
    // Extract route params
    const params = await context.params;
    const { order_id } = params;

    // Parse request body
    const body: SubmitTransactionRequest = await request.json();
    const { tx_hash, chain, asset, from, to, amount } = body;

    // Validate required fields
    const validation = validateRequiredFields(body, [
      "tx_hash",
      "chain",
      "asset",
      "from",
      "to",
      "amount",
    ]);
    if (!validation.success) {
      return errorResponse("INVALID_REQUEST", validation.error!);
    }

    // Connect to database
    await connectDB();

    // Find order
    const order = await Order.findOne({ order_id });
    if (!order) {
      return errorResponse("ORDER_NOT_FOUND", "Order not found", 404);
    }

    // Check if order is still valid
    if (order.expires_at < new Date()) {
      return errorResponse("ORDER_EXPIRED", "Order has expired", 400);
    }

    // Check if transaction already exists
    const existingTx = await Transaction.findOne({ tx_hash });
    if (existingTx) {
      return errorResponse(
        "TRANSACTION_EXISTS",
        "Transaction already recorded",
        409
      );
    }

    // Create transaction record
    // TODO: Verify transaction on-chain via Alchemy
    const usd_value = parseFloat(amount); // Simplified, should convert via price oracle

    const transaction = await Transaction.create({
      tx_hash,
      order_id,
      merchant_id: order.merchant_id,
      app_id: order.app_id,
      chain,
      asset,
      amount: parseFloat(amount),
      usd_value,
      from,
      to,
      status: TRANSACTION_STATUS.PENDING,
    });

    // Update order status to pending
    order.status = ORDER_STATUS.PENDING;
    await order.save();

    // Dispatch webhook (fire and forget)
    if (order.webhook_url) {
      const event = createWebhookEvent("order.pending", {
        order_id: order.order_id,
        tx_hash,
        chain,
        asset,
        amount: parseFloat(amount),
        merchant_id: order.merchant_id,
        app_id: order.app_id,
      });

      dispatchWebhook(order.webhook_url, event).catch((err) =>
        logApiError("POST", "/webhook", err, { order_id })
      );
    }

    // Return success response
    return successResponse<SubmitTransactionResponse>({
      status: "pending",
      message: "Transaction detected and queued for verification",
      tx_hash: transaction.tx_hash,
      order_id: order.order_id,
    });
  } catch (error) {
    logApiError("POST", `/api/orders/${order_id}/tx`, error, {
      order_id,
    });

    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
