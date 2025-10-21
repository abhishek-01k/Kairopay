import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";

export async function GET() {
  try {
    const mongoose = await connectDB();

    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    return NextResponse.json({
      success: true,
      data: {
        status: "healthy",
        database: dbStatus,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_CONNECTION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
