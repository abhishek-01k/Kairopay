import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Transaction } from "@/lib/db/models";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { authenticateRequest } from "@/lib/middleware/auth";

/**
 * GET /api/apps/{app_id}/transactions
 *
 * List all transactions for an app (merchant dashboard)
 * Query params: status, chain, asset, limit, offset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ app_id: string }> }
) {
  try {
    const { app_id } = await params;

    // Authenticate with either API key or Privy token
    const { error, context } = await authenticateRequest(request, app_id);
    if (error || !context) {
      return errorResponse(
        "UNAUTHORIZED",
        error || "Authentication failed",
        401
      );
    }

    await connectDB();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const chain = searchParams.get("chain");
    const asset = searchParams.get("asset");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    const query: Record<string, unknown> = { app_id };
    if (status) {
      query.status = status;
    }
    if (chain) {
      query.chain = chain;
    }
    if (asset) {
      query.asset = asset;
    }

    // Fetch transactions
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    // Calculate total volume
    const totalVolume = transactions.reduce(
      (sum, tx) => sum + (tx.usd_value || 0),
      0
    );

    return successResponse({
      transactions: transactions.map((tx) => ({
        tx_hash: tx.tx_hash,
        order_id: tx.order_id,
        chain: tx.chain,
        asset: tx.asset,
        amount: tx.amount,
        usd_value: tx.usd_value,
        from: tx.from,
        to: tx.to,
        status: tx.status,
        confirmed_at: tx.confirmed_at,
        created_at: tx.created_at,
      })),
      stats: {
        total_transactions: total,
        total_volume_usd: parseFloat(totalVolume.toFixed(2)),
      },
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
