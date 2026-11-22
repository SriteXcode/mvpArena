import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";

export async function GET(request: Request) {
  const startTime = Date.now();
  let dbStatus: "connected" | "connecting" | "disconnected" | "error" = "disconnected";
  let dbLatencyMs: number | null = null;
  let dbError: string | null = null;

  try {
    const dbStartTime = Date.now();
    await connectToDatabase();

    // Mongoose readyState values: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const readyState = mongoose.connection.readyState;
    if (readyState === 1) {
      dbStatus = "connected";
      dbLatencyMs = Date.now() - dbStartTime;
    } else if (readyState === 2) {
      dbStatus = "connecting";
    } else {
      dbStatus = "disconnected";
    }
  } catch (err) {
    dbStatus = "error";
    dbError = (err as Error).message || "Database connection check failed";
  }

  const isHealthy = dbStatus === "connected" || dbStatus === "connecting";
  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    responseTimeMs: Date.now() - startTime,
    services: {
      api: {
        status: "up",
      },
      database: {
        status: dbStatus,
        readyState: mongoose.connection.readyState,
        latencyMs: dbLatencyMs,
        ...(dbError ? { error: dbError } : {}),
      },
      system: {
        memory: {
          heapUsedMB: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
          heapTotalMB: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
          rssMB: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        },
      },
    },
  };

  return NextResponse.json(healthData, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
