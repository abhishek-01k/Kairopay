import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Merchant } from "@/lib/db/models";
import { generateAppId, generateApiKey } from "@/lib/utils/id-generator";
import { hashApiKey } from "@/lib/utils/crypto";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privy_did, name, webhook_url } = body;

    if (!privy_did || !name) {
      return errorResponse(
        "INVALID_REQUEST",
        "privy_did and name are required"
      );
    }

    await connectDB();

    const merchant = await Merchant.findOne({ privy_did });
    if (!merchant) {
      return errorResponse("MERCHANT_NOT_FOUND", "Merchant not found", 404);
    }

    const app_id = generateAppId();
    const api_key = generateApiKey();
    const hashedApiKey = await hashApiKey(api_key);

    merchant.apps.push({
      app_id,
      api_key: hashedApiKey,
      name,
      webhook_url,
      created_at: new Date(),
    });

    await merchant.save();

    return successResponse(
      {
        app_id,
        api_key, // Return once - merchant must save it
        name,
        created_at: new Date().toISOString(),
      },
      201
    );
  } catch (error) {
    console.error("Error creating app:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
