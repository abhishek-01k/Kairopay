import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Merchant } from "@/lib/db/models";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ privy_did: string }> }
) {
  try {
    const { privy_did } = await params;

    await connectDB();

    const merchant = await Merchant.findOne({ privy_did });
    if (!merchant) {
      return errorResponse("MERCHANT_NOT_FOUND", "Merchant not found", 404);
    }

    return successResponse({
      merchant_id: merchant.merchant_id,
      privy_did: merchant.privy_did,
      evm_wallet: merchant.evm_wallet,
      sol_wallet: merchant.sol_wallet,
      apps: merchant.apps.map((app) => ({
        app_id: app.app_id,
        name: app.name,
        webhook_url: app.webhook_url,
        created_at: app.created_at,
        // Don't return api_key
      })),
      created_at: merchant.created_at,
    });
  } catch (error) {
    console.error("Error fetching merchant:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
