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

    // TODO: Integrate Alchemy SDK to fetch real balances
    // For now, return mock data
    const balances = {
      wallets: {
        evm: merchant.evm_wallet,
        sol: merchant.sol_wallet,
      },
      balances: {
        // These will be fetched from Alchemy
        eth: "0.0000",
        usdc: "0.00",
        pyusd: "0.00",
      },
      updated_at: new Date().toISOString(),
    };

    return successResponse(balances);
  } catch (error) {
    console.error("Error fetching balances:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
