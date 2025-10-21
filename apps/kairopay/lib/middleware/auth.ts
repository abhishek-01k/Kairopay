import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Merchant } from "@/lib/db/models";
import { verifyApiKey } from "@/lib/utils/crypto";

export interface AuthContext {
  merchant_id: string;
  app_id: string;
  privy_did: string;
}

export async function authenticateApiKey(
  request: NextRequest,
  expectedAppId?: string
): Promise<{ error?: string; context?: AuthContext }> {
  // Extract API key from Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return { error: "Missing Authorization header" };
  }

  const apiKey = authHeader.replace("Bearer ", "").trim();

  if (!apiKey || !apiKey.startsWith("sk")) {
    return { error: "Invalid API key format" };
  }

  await connectDB();

  // Find ALL merchants and check their apps' API keys
  const merchants = await Merchant.find({
    "apps.0": { $exists: true },
  });

  if (!merchants || merchants.length === 0) {
    return { error: "Invalid API key" };
  }

  // Check each merchant's apps
  for (const merchant of merchants) {
    for (const app of merchant.apps) {
      const isValid = await verifyApiKey(apiKey, app.api_key);

      if (isValid) {
        // If expectedAppId is provided, verify it matches
        if (expectedAppId && app.app_id !== expectedAppId) {
          return { error: "API key does not belong to this app" };
        }

        return {
          context: {
            merchant_id: merchant.merchant_id,
            app_id: app.app_id,
            privy_did: merchant.privy_did,
          },
        };
      }
    }
  }

  return { error: "Invalid API key" };
}
