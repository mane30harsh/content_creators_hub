"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Register ────────────────────────────────────────────────────────────────

export async function registerUser(
  rawData: RegisterInput
): Promise<ActionResult<{ email: string }>> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const rl = checkRateLimit(`register:${ip}`, { windowMs: 60_000, max: 5 });
  if (!rl.allowed) {
    return { success: false, error: "Too many registration attempts. Please try again later." };
  }

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists.",
      fieldErrors: { email: ["This email is already in use."] },
    };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      // Eagerly create the matching profile so onboarding flows work
      ...(role === "CREATOR" && { creatorProfile: { create: {} } }),
      ...(role === "BRAND"   && { brandProfile:   { create: {} } }),
    },
  });

  // TODO: Send email verification email here
  // const token = await createEmailVerificationToken(user.id);
  // await sendVerificationEmail(email, token);

  return { success: true, data: { email } };
}

// ─── Forgot password ─────────────────────────────────────────────────────────

export async function requestPasswordReset(
  rawData: ForgotPasswordInput
): Promise<ActionResult<{ sent: boolean }>> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const rl = checkRateLimit(`forgot-password:${ip}`, { windowMs: 60_000, max: 3 });
  if (!rl.allowed) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  const parsed = forgotPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email } = parsed.data;

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { success: true, data: { sent: false } };

  // Invalidate any existing tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Create a new token valid for 1 hour
  const token = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  // TODO: Send password reset email
  // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token.token}`;
  // await sendPasswordResetEmail(email, resetUrl);

  console.info(`[auth] Password reset token for ${email}: ${token.token}`);

  return { success: true, data: { sent: true } };
}

// ─── Reset password ───────────────────────────────────────────────────────────

export async function resetPassword(
  rawData: ResetPasswordInput
): Promise<ActionResult<void>> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const rl = checkRateLimit(`reset-password:${ip}`, { windowMs: 60_000, max: 5 });
  if (!rl.allowed) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  const parsed = resetPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { token, password } = parsed.data;

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: { select: { id: true } } },
  });

  if (!record) {
    return { success: false, error: "Invalid or expired reset link." };
  }
  if (record.usedAt) {
    return { success: false, error: "This reset link has already been used." };
  }
  if (record.expiresAt < new Date()) {
    return { success: false, error: "This reset link has expired. Request a new one." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.user.id },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate all sessions so attacker can't stay logged in
    prisma.session.deleteMany({ where: { userId: record.user.id } }),
  ]);

  return { success: true, data: undefined };
}

// ─── Verify email ─────────────────────────────────────────────────────────────

export async function verifyEmail(token: string): Promise<ActionResult<void>> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: { select: { id: true } } },
  });

  if (!record) {
    return { success: false, error: "Invalid verification link." };
  }
  if (record.usedAt) {
    return { success: false, error: "This link has already been used." };
  }
  if (record.expiresAt < new Date()) {
    return { success: false, error: "This verification link has expired." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true, data: undefined };
}
