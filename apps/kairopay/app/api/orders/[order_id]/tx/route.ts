import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Order, Transaction } from "@/lib/db/models";
import { successResponse, errorResponse } from "@/lib/utils/response";
import {
  dispatchWebhook,
  createWebhookEvent,
} from "@/lib/services/webhook-service";
import { ORDER_STATUS, TRANSACTION_STATUS } from "@/lib/constants";

/**
 * Public endpoint - No authentication required
 * Called by checkout frontend when customer submits payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  try {
    const { order_id } = await params;
    const body = await request.json();
    const { tx_hash, chain, asset, from, to, amount } = body;

    // Validate required fields
    if (!tx_hash || !chain || !asset || !from || !to || !amount) {
      return errorResponse(
        "INVALID_REQUEST",
        "Missing required fields: tx_hash, chain, asset, from, to, amount"
      );
    }

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

    // Dispatch webhook
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

      dispatchWebhook(order.webhook_url, event).catch(console.error);
    }

    return successResponse({
      status: "pending",
      message: "Transaction detected and queued for verification",
      tx_hash: transaction.tx_hash,
      order_id: order.order_id,
    });
  } catch (error) {
    console.error("Error submitting transaction:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
