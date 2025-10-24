import { NextRequest } from "next/server";

import connectDB from "@/lib/db/mongodb";
import { Merchant } from "@/lib/db/models";
import { logApiError } from "@/lib/utils/logger";
import { successResponse, errorResponse } from "@/lib/utils/response";

import type { GetMerchantResponse, PrivyDidRouteParams } from "@/types/api";

/**
 * Get Merchant Profile
 *
 * @route GET /api/merchant/{privy_did}
 * @description Get merchant profile with all apps (API keys not included)
 * @access Public
 *
 * @param privy_did - Merchant's Privy DID
 * @returns Merchant profile with apps list
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<PrivyDidRouteParams> }
) {
  // Extract route params
  const params = await context.params;
  const { privy_did } = params;

  try {
    // Connect to database
    await connectDB();

    // Find merchant
    const merchant = await Merchant.findOne({ privy_did });
    if (!merchant) {
      return errorResponse("MERCHANT_NOT_FOUND", "Merchant not found", 404);
    }

    // Return merchant profile (API keys excluded for security)
    return successResponse<GetMerchantResponse>({
      merchant_id: merchant.merchant_id,
      privy_did: merchant.privy_did,
      evm_wallet: merchant.evm_wallet,
      sol_wallet: merchant.sol_wallet,
      apps: merchant.apps.map((app) => ({
        app_id: app.app_id,
        name: app.name,
        webhook_url: app.webhook_url,
        created_at: app.created_at,
      })),
      created_at: merchant.created_at,
    });
  } catch (error) {
    logApiError("GET", `/api/merchant/${privy_did}`, error, {
      privy_did,
    });

    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
