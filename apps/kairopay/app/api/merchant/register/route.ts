import { NextRequest } from "next/server";

import connectDB from "@/lib/db/mongodb";
import { Merchant } from "@/lib/db/models";
import { generateMerchantId } from "@/lib/utils/id-generator";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { logApiError } from "@/lib/utils/logger";
import { validateRequiredFields } from "@/lib/validators";

import type {
  RegisterMerchantRequest,
  RegisterMerchantResponse,
} from "@/types/api";

/**
 * Register Merchant
 *
 * @route POST /api/merchant/register
 * @description Register a new merchant with Privy DID and wallet addresses
 * @access Public
 *
 * @body RegisterMerchantRequest
 * @returns Merchant ID and profile information
 *
 * @example
 * ```json
 * {
 *   "privy_did": "did:privy:test123",
 *   "evm_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
 *   "sol_wallet": "FqE7vN9nDxDQAKXX4mhPJvS5vt6y4T9rC1qG9xKT9"
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: RegisterMerchantRequest = await request.json();
    const { privy_did, evm_wallet, sol_wallet } = body;

    // Validate required fields
    const validation = validateRequiredFields(
      body as unknown as Record<string, unknown>,
      ["privy_did"]
    );
    if (!validation.success) {
      return errorResponse("INVALID_REQUEST", validation.error!);
    }

    // Connect to database
    await connectDB();

    // Check if merchant already exists
    const existingMerchant = await Merchant.findOne({ privy_did });
    if (existingMerchant) {
      return errorResponse(
        "MERCHANT_EXISTS",
        "Merchant with this Privy DID already exists",
        409
      );
    }

    // Generate merchant ID
    const merchant_id = generateMerchantId();

    // Create merchant
    const merchant = await Merchant.create({
      merchant_id,
      privy_did,
      evm_wallet,
      sol_wallet,
      apps: [],
    });

    // Return response
    return successResponse<RegisterMerchantResponse>(
      {
        merchant_id: merchant.merchant_id,
        privy_did: merchant.privy_did,
        evm_wallet: merchant.evm_wallet,
        sol_wallet: merchant.sol_wallet,
        created_at: merchant.created_at,
      },
      201
    );
  } catch (error) {
    logApiError("POST", "/api/merchant/register", error, {
      body: request.body,
    });

    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
