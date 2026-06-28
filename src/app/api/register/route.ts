import { NextResponse } from "next/server";
import { registerUser } from "@/lib/actions/auth";
import type { RegisterInput } from "@/lib/validations/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const result = await registerUser(body as RegisterInput);

  if (!result.success) {
    return NextResponse.json(
      { message: result.error, fieldErrors: result.fieldErrors },
      { status: result.error.includes("already exists") ? 409 : 400 }
    );
  }

  return NextResponse.json({ message: "Account created." }, { status: 201 });
}
