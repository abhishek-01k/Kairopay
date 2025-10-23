import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Order, Transaction } from "@/lib/db/models";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { authenticateApiKey } from "@/lib/middleware/auth";
import {
  dispatchWebhook,
  createWebhookEvent,
} from "@/lib/services/webhook-service";
import { ORDER_STATUS, TRANSACTION_STATUS } from "@/lib/constants";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ app_id: string; order_id: string }> }
) {
  try {
    const { app_id, order_id } = await params;

    // Authenticate and verify API key belongs to this app
    const { error, context } = await authenticateApiKey(request, app_id);
    if (error || !context) {
      return errorResponse(
        "UNAUTHORIZED",
        error || "Authentication failed",
        401
      );
    }

    await connectDB();

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

    // Update order status
    order.status = ORDER_STATUS.VERIFIED;
    await order.save();

    // Dispatch webhook
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

      dispatchWebhook(order.webhook_url, event).catch(console.error);
    }

    return successResponse({
      order_id: order.order_id,
      status: order.status,
      message: "Order marked as complete",
    });
  } catch (error) {
    console.error("Error completing order:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
