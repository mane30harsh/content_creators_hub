import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { registerUser } from "@/lib/actions/auth";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import type { RegisterInput } from "@/lib/validations/auth";

export async function POST(req: Request) {
  // Rate limiting by IP
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const rlKey = `register:${ip}`;

  const rl = checkRateLimit(rlKey, { windowMs: 60_000, max: 5 });
  if (!rl.allowed) {
    return NextResponse.json(
      { message: "Too many registration attempts. Please try again later." },
      {
        status: 429,
        headers: rateLimitHeaders(rlKey, { windowMs: 60_000, max: 5 }),
      }
    );
  }

  // Validate Content-Type
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ message: "Content-Type must be application/json." }, { status: 415 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const result = await registerUser(body as RegisterInput);

  if (!result.success) {
    // Error messages are stable server-side strings; if "already exists" is found, it's a 409
    const isConflict = result.error === "An account with this email already exists.";
    return NextResponse.json(
      { message: result.error, fieldErrors: result.fieldErrors },
      { status: isConflict ? 409 : 400 }
    );
  }

  return NextResponse.json({ message: "Account created." }, { status: 201 });
}
