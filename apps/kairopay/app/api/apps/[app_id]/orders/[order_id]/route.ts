import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Order, Transaction } from "@/lib/db/models";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { authenticateApiKey } from "@/lib/middleware/auth";

export async function GET(
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

    // Get associated transactions
    const transactions = await Transaction.find({ order_id });

    return successResponse({
      order_id: order.order_id,
      merchant_id: order.merchant_id,
      app_id: order.app_id,
      customer_did: order.customer_did,
      amount_usd: order.amount_usd,
      currency: order.currency,
      metadata: order.metadata,
      status: order.status,
      checkout_url: order.checkout_url,
      expires_at: order.expires_at,
      transactions: transactions.map((tx) => ({
        tx_hash: tx.tx_hash,
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
    console.error("Error fetching order:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
