import { NextRequest } from "next/server";

import connectDB from "@/lib/db/mongodb";
import { Merchant } from "@/lib/db/models";
import { logApiError } from "@/lib/utils/logger";
import { successResponse, errorResponse } from "@/lib/utils/response";

import type { GetBalancesResponse, PrivyDidRouteParams } from "@/types/api";

/**
 * Get Merchant Balances
 *
 * @route GET /api/merchant/{privy_did}/balances
 * @description Get live wallet balances for merchant (via Alchemy integration)
 * @access Public
 *
 * @param privy_did - Merchant's Privy DID
 * @returns Wallet addresses and token balances
 *
 * @todo Integrate Alchemy SDK for real-time balance fetching
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<PrivyDidRouteParams> }
) {
  try {
    // Extract route params
    const params = await context.params;
    const { privy_did } = params;

    // Connect to database
    await connectDB();

    // Find merchant
    const merchant = await Merchant.findOne({ privy_did });
    if (!merchant) {
      return errorResponse("MERCHANT_NOT_FOUND", "Merchant not found", 404);
    }

    // TODO: Integrate Alchemy SDK to fetch real balances
    // For now, return mock data structure
    const balances: GetBalancesResponse = {
      wallets: {
        evm: merchant.evm_wallet,
        sol: merchant.sol_wallet,
      },
      balances: {
        // These will be fetched from Alchemy in production
        eth: "0.0000",
        usdc: "0.00",
        pyusd: "0.00",
      },
      updated_at: new Date(),
    };

    return successResponse<GetBalancesResponse>(balances);
  } catch (error) {
    logApiError("GET", `/api/merchant/${params.privy_did}/balances`, error, {
      privy_did: params.privy_did,
    });

    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
