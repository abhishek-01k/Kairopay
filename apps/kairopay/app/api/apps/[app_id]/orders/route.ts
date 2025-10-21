import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Order, Merchant } from "@/lib/db/models";
import { generateOrderId } from "@/lib/utils/id-generator";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { authenticateApiKey } from "@/lib/middleware/auth";
import {
  dispatchWebhook,
  createWebhookEvent,
} from "@/lib/services/webhook-service";
import { ORDER_STATUS } from "@/lib/constants";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ app_id: string }> }
) {
  try {
    const { app_id } = await params;

    // Authenticate and verify API key belongs to this app
    const { error, context } = await authenticateApiKey(request, app_id);
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
