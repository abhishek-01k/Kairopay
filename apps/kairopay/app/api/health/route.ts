import connectDB from "@/lib/db/mongodb";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function GET() {
  try {
    const mongoose = await connectDB();

    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    return successResponse({
      status: "healthy",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(
      "DATABASE_CONNECTION_FAILED",
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
}
