import connectDB from "@/lib/db/mongodb";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { logApiError } from "@/lib/utils/logger";

import type { HealthCheckResponse } from "@/types/api";

/**
 * Health Check
 *
 * @route GET /api/health
 * @description Check API and database connectivity status
 * @access Public
 *
 * @returns Health status with database connection info
 */
export async function GET() {
  try {
    // Test database connection
    const mongoose = await connectDB();

    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    return successResponse<HealthCheckResponse>({
      status: "healthy",
      database: dbStatus,
      timestamp: new Date(),
    });
  } catch (error) {
    logApiError("GET", "/api/health", error);

    return errorResponse(
      "DATABASE_ERROR",
      error instanceof Error ? error.message : "Database connection failed",
      500
    );
  }
}
