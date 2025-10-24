import { NextRequest } from "next/server";
import { PrivyClient } from "@privy-io/node";
import connectDB from "@/lib/db/mongodb";
import { Merchant } from "@/lib/db/models";
import { verifyApiKey } from "@/lib/utils/crypto";

export interface AuthContext {
  merchant_id: string;
  app_id: string;
  privy_did: string;
}

// Initialize Privy client for token verification
const privyClient = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
});

/**
 * Verify Privy access token (for dashboard users)
 */
async function authenticatePrivyToken(
  request: NextRequest,
  expectedAppId?: string
): Promise<{ error?: string; context?: AuthContext }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return { error: "Missing Authorization header" };
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    // Verify the Privy access token using @privy-io/node SDK
    const claims = await privyClient.utils().auth().verifyAuthToken(token);

    // Extract user's Privy DID from the token
    const privyDid = claims.user_id;

    await connectDB();

    // Find merchant by Privy DID
    const merchant = await Merchant.findOne({ privy_did: privyDid });

    if (!merchant) {
      return { error: "Merchant not found for this user" };
    }

    // If expectedAppId is provided, verify merchant owns this app
    if (expectedAppId) {
      const app = merchant.apps.find((a) => a.app_id === expectedAppId);
      if (!app) {
        return { error: "App not found or does not belong to this merchant" };
      }

      return {
        context: {
          merchant_id: merchant.merchant_id,
          app_id: app.app_id,
          privy_did: merchant.privy_did,
        },
      };
    }

    // If no expectedAppId, use the first app (or handle as needed)
    const firstApp = merchant.apps[0];
    if (!firstApp) {
      return { error: "Merchant has no apps" };
    }

    return {
      context: {
        merchant_id: merchant.merchant_id,
        app_id: firstApp.app_id,
        privy_did: merchant.privy_did,
      },
    };
  } catch (error) {
    console.error("Privy token verification failed:", error);
    return { error: "Invalid or expired access token" };
  }
}

/**
 * Verify API key (for external merchant integrations)
 */
async function authenticateApiKey(
  request: NextRequest,
  expectedAppId?: string
): Promise<{ error?: string; context?: AuthContext }> {
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

/**
 * Unified authentication function
 * Supports both API keys (sk...) and Privy access tokens (JWT)
 */
export async function authenticateRequest(
  request: NextRequest,
  expectedAppId?: string
): Promise<{ error?: string; context?: AuthContext }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return { error: "Missing Authorization header" };
  }

  const token = authHeader.replace("Bearer ", "").trim();

  // Determine authentication type by token format
  if (token.startsWith("sk")) {
    // It's an API key
    return authenticateApiKey(request, expectedAppId);
  } else {
    // It's a Privy JWT token
    return authenticatePrivyToken(request, expectedAppId);
  }
}

// Export for backward compatibility (external merchants using API keys)
export { authenticateApiKey };
