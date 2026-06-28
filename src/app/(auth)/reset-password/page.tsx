import Link from "next/link";
import { AuthCard } from "@/components/shared/auth-card";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set New Password – Content Creators Hub",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard title="Invalid link" description="This password reset link is missing a token.">
        <div className="py-2 text-center">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Request a new reset link →
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set new password"
      description="Choose a strong password for your account."
      icon={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
          <ShieldCheck className="h-5 w-5" />
        </div>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
