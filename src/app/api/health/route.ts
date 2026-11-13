import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    let dbStatus = "disconnected";
    try {
      const mongoose = await connectToDatabase();
      dbStatus = mongoose.connection.readyState === 1 ? "connected" : "connecting";
    } catch (e: any) {
      dbStatus = `error: ${e.message}`;
    }

    return NextResponse.json({
      status: "ok",
      app: "daily-purchase-admin",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

