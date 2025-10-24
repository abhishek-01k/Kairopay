import { NextRequest } from "next/server";

import connectDB from "@/lib/db/mongodb";
import { Transaction } from "@/lib/db/models";
import { authenticateRequest } from "@/lib/middleware/auth";
import { logApiError } from "@/lib/utils/logger";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { validatePaginationParams } from "@/lib/validators";

import type {
  AppRouteParams,
  ListTransactionsResponse,
  TransactionDetails,
} from "@/types/api";

/**
 * List Transactions
 *
 * @route GET /api/apps/{app_id}/transactions
 * @description List all transactions for an app with filtering and pagination
 * @access Private (API Key or Privy Token)
 *
 * @query status - Filter by transaction status (optional)
 * @query chain - Filter by blockchain (optional)
 * @query asset - Filter by asset/token (optional)
 * @query limit - Number of transactions per page (default: 50, max: 100)
 * @query offset - Pagination offset (default: 0)
 *
 * @returns Paginated list of transactions with stats
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<AppRouteParams> }
) {
  try {
    // Extract route params
    const params = await context.params;
    const { app_id } = params;

    // Authenticate with either API key or Privy token
    const { error, context: authContext } = await authenticateRequest(
      request,
      app_id
    );
    if (error || !authContext) {
      return errorResponse(
        "UNAUTHORIZED",
        error || "Authentication failed",
        401
      );
    }

    // Connect to database
    await connectDB();

    // Parse and validate query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const chain = searchParams.get("chain");
    const asset = searchParams.get("asset");
    const { limit, offset } = validatePaginationParams(searchParams);

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

    // Map transactions to response format
    const transactionDetails: TransactionDetails[] = transactions.map((tx) => ({
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
    }));

    // Return paginated response
    return successResponse<ListTransactionsResponse>({
      transactions: transactionDetails,
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
    logApiError("GET", `/api/apps/${app_id}/transactions`, error, {
      app_id,
      status,
      chain,
      asset,
    });

    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
