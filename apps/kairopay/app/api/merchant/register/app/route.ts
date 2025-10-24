import { NextRequest } from "next/server";

import connectDB from "@/lib/db/mongodb";
import { Merchant } from "@/lib/db/models";
import { hashApiKey } from "@/lib/utils/crypto";
import { generateAppId, generateApiKey } from "@/lib/utils/id-generator";
import { logApiError } from "@/lib/utils/logger";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { validateRequiredFields } from "@/lib/validators";

import type { CreateAppRequest, CreateAppResponse } from "@/types/api";

/**
 * Create App
 *
 * @route POST /api/merchant/register/app
 * @description Create a new app for a merchant and generate API key
 * @access Public
 *
 * @body CreateAppRequest
 * @returns App ID, API key (shown only once), and app details
 *
 * @example
 * ```json
 * {
 *   "privy_did": "did:privy:test123",
 *   "name": "My Shop",
 *   "webhook_url": "https://myshop.com/webhooks"
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CreateAppRequest = await request.json();
    const { privy_did, name, webhook_url } = body;

    // Validate required fields
    const validation = validateRequiredFields(
      body as unknown as Record<string, unknown>,
      ["privy_did", "name"]
    );
    if (!validation.success) {
      return errorResponse("INVALID_REQUEST", validation.error!);
    }

    // Connect to database
    await connectDB();

    // Find merchant
    const merchant = await Merchant.findOne({ privy_did });
    if (!merchant) {
      return errorResponse("MERCHANT_NOT_FOUND", "Merchant not found", 404);
    }

    // Generate app credentials
    const app_id = generateAppId();
    const api_key = generateApiKey();
    const hashedApiKey = await hashApiKey(api_key);

    // Create app
    const createdAt = new Date();
    merchant.apps.push({
      app_id,
      api_key: hashedApiKey,
      name,
      webhook_url,
      created_at: createdAt,
    });

    await merchant.save();

    // Return response (API key shown only once)
    return successResponse<CreateAppResponse>(
      {
        app_id,
        api_key,
        name,
        webhook_url,
        created_at: createdAt,
      },
      201
    );
  } catch (error) {
    logApiError("POST", "/api/merchant/register/app", error, {
      privy_did: (await request.json()).privy_did,
    });

    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
