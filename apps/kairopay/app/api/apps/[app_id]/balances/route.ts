import { NextRequest } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Order, Transaction, Merchant } from "@/lib/db/models";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { authenticateApiKey } from "@/lib/middleware/auth";
import { ORDER_STATUS, TRANSACTION_STATUS } from "@/lib/constants";

/**
 * GET /api/apps/{app_id}/balances
 *
 * Get aggregated stats and balances for an app (merchant dashboard)
 * Includes: total orders, total revenue, transaction stats, wallet balances
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ app_id: string }> }
) {
  try {
    const { app_id } = await params;

    // Authenticate and verify API key belongs to this app
    const { error, context } = await authenticateApiKey(request, app_id);
    if (error || !context) {
      return errorResponse(
        "UNAUTHORIZED",
        error || "Authentication failed",
        401
      );
    }

    await connectDB();

    // Get merchant wallet info
    const merchant = await Merchant.findOne({
      merchant_id: context.merchant_id,
    });
    if (!merchant) {
      return errorResponse("MERCHANT_NOT_FOUND", "Merchant not found", 404);
    }

    // Aggregate order stats
    const [
      totalOrders,
      completedOrders,
      pendingOrders,
      failedOrders,
      totalRevenue,
    ] = await Promise.all([
      Order.countDocuments({ app_id }),
      Order.countDocuments({ app_id, status: ORDER_STATUS.VERIFIED }),
      Order.countDocuments({ app_id, status: ORDER_STATUS.PENDING }),
      Order.countDocuments({ app_id, status: ORDER_STATUS.FAILED }),
      Order.aggregate([
        {
          $match: {
            app_id,
            status: ORDER_STATUS.VERIFIED,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount_usd" },
          },
        },
      ]),
    ]);

    // Aggregate transaction stats
    const [totalTransactions, confirmedTransactions, transactionVolume] =
      await Promise.all([
        Transaction.countDocuments({ app_id }),
        Transaction.countDocuments({
          app_id,
          status: TRANSACTION_STATUS.CONFIRMED,
        }),
        Transaction.aggregate([
          {
            $match: {
              app_id,
              status: TRANSACTION_STATUS.CONFIRMED,
            },
          },
          {
            $group: {
              _id: null,
              total_volume: { $sum: "$usd_value" },
            },
          },
        ]),
      ]);

    // Aggregate by asset
    const assetBreakdown = await Transaction.aggregate([
      {
        $match: {
          app_id,
          status: TRANSACTION_STATUS.CONFIRMED,
        },
      },
      {
        $group: {
          _id: "$asset",
          count: { $sum: 1 },
          volume: { $sum: "$usd_value" },
        },
      },
      {
        $project: {
          asset: "$_id",
          count: 1,
          volume: 1,
          _id: 0,
        },
      },
      {
        $sort: { volume: -1 },
      },
    ]);

    // Aggregate by chain
    const chainBreakdown = await Transaction.aggregate([
      {
        $match: {
          app_id,
          status: TRANSACTION_STATUS.CONFIRMED,
        },
      },
      {
        $group: {
          _id: "$chain",
          count: { $sum: 1 },
          volume: { $sum: "$usd_value" },
        },
      },
      {
        $project: {
          chain: "$_id",
          count: 1,
          volume: 1,
          _id: 0,
        },
      },
      {
        $sort: { volume: -1 },
      },
    ]);

    // Recent transactions (last 10)
    const recentTransactions = await Transaction.find({ app_id })
      .sort({ created_at: -1 })
      .limit(10)
      .lean();

    return successResponse({
      merchant: {
        merchant_id: merchant.merchant_id,
        evm_wallet: merchant.evm_wallet,
        sol_wallet: merchant.sol_wallet,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
        failed: failedOrders,
      },
      transactions: {
        total: totalTransactions,
        confirmed: confirmedTransactions,
      },
      revenue: {
        total_usd: totalRevenue[0]?.total
          ? parseFloat(totalRevenue[0].total.toFixed(2))
          : 0,
        transaction_volume_usd: transactionVolume[0]?.total_volume
          ? parseFloat(transactionVolume[0].total_volume.toFixed(2))
          : 0,
      },
      breakdown: {
        by_asset: assetBreakdown.map((item) => ({
          asset: item.asset,
          count: item.count,
          volume_usd: parseFloat(item.volume.toFixed(2)),
        })),
        by_chain: chainBreakdown.map((item) => ({
          chain: item.chain,
          count: item.count,
          volume_usd: parseFloat(item.volume.toFixed(2)),
        })),
      },
      recent_transactions: recentTransactions.map((tx) => ({
        tx_hash: tx.tx_hash,
        order_id: tx.order_id,
        chain: tx.chain,
        asset: tx.asset,
        amount: tx.amount,
        usd_value: tx.usd_value,
        status: tx.status,
        created_at: tx.created_at,
      })),
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching app balances:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
