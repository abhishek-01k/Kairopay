import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Merchant } from "@/lib/db/models";
import { generateMerchantId } from "@/lib/utils/id-generator";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privy_did, evm_wallet, sol_wallet } = body;

    if (!privy_did) {
      return errorResponse("INVALID_REQUEST", "privy_did is required");
    }

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

    const merchant_id = generateMerchantId();

    const merchant = await Merchant.create({
      merchant_id,
      privy_did,
      evm_wallet,
      sol_wallet,
      apps: [],
    });

    return successResponse(
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
    console.error("Error registering merchant:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
