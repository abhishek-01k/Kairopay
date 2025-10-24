import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Order, Merchant, Transaction } from "@/lib/db/models";
import { generateOrderId } from "@/lib/utils/id-generator";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { authenticateRequest } from "@/lib/middleware/auth";
import {
  dispatchWebhook,
  createWebhookEvent,
} from "@/lib/services/webhook-service";
import { ORDER_STATUS } from "@/lib/constants";

/**
 * GET /api/apps/{app_id}/orders
 *
 * List all orders for an app (merchant dashboard)
 * Query params: status, limit, offset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ app_id: string }> }
) {
  try {
    const { app_id } = await params;

    // Authenticate with either API key or Privy token
    const { error, context } = await authenticateRequest(request, app_id);
    if (error || !context) {
      return errorResponse(
        "UNAUTHORIZED",
        error || "Authentication failed",
        401
      );
    }

    await connectDB();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

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
    const ordersWithTxCount = await Promise.all(
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
          metadata: order.metadata,
          status: order.status,
          checkout_url: order.checkout_url,
          expires_at: order.expires_at,
          transaction_count: txCount,
          created_at: order.created_at,
          updated_at: order.updated_at,
        };
      })
    );

    return successResponse({
      orders: ordersWithTxCount,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ app_id: string }> }
) {
  try {
    const { app_id } = await params;

    // Authenticate with either API key or Privy token
    const { error, context } = await authenticateRequest(request, app_id);
    if (error || !context) {
      return errorResponse(
        "UNAUTHORIZED",
        error || "Authentication failed",
        401
      );
    }

    const body = await request.json();
    const { amount_usd, currency = "USD", metadata, webhook_url } = body;

    // Validate required fields
    if (!amount_usd || amount_usd <= 0) {
      return errorResponse(
        "INVALID_REQUEST",
        "amount_usd must be greater than 0"
      );
    }

    await connectDB();

    // Get merchant to find webhook URL
    const merchant = await Merchant.findOne({
      merchant_id: context.merchant_id,
    });
    if (!merchant) {
      return errorResponse("MERCHANT_NOT_FOUND", "Merchant not found", 404);
    }

    // Find app to get default webhook URL
    const app = merchant.apps.find((a) => a.app_id === app_id);
    const finalWebhookUrl = webhook_url || app?.webhook_url;

    // Generate order
    const order_id = body.order_id || generateOrderId();
    const checkout_url = `${process.env.NEXT_PUBLIC_APP_URL}/order/${order_id}`;
    const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const order = await Order.create({
      order_id,
      merchant_id: context.merchant_id,
      app_id,
      amount_usd,
      currency,
      metadata: metadata || {},
      webhook_url: finalWebhookUrl,
      status: ORDER_STATUS.CREATED,
      checkout_url,
      expires_at,
    });

    // Dispatch webhook
    if (finalWebhookUrl) {
      const event = createWebhookEvent("order.created", {
        order_id: order.order_id,
        merchant_id: context.merchant_id,
        app_id,
      });

      // Fire and forget (don't await)
      dispatchWebhook(finalWebhookUrl, event).catch(console.error);
    }

    return successResponse(
      {
        order_id: order.order_id,
        checkout_url: order.checkout_url,
        expires_at: order.expires_at,
      },
      201
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
