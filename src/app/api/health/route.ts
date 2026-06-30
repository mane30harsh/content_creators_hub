import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "connected",
        responseTimeMs: Date.now() - start,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "disconnected",
        responseTimeMs: Date.now() - start,
      },
      { status: 503 }
    );
  }
}
