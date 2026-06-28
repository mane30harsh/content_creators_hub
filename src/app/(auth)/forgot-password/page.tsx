import Link from "next/link";
import { AuthCard } from "@/components/shared/auth-card";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { KeyRound } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password – Content Creators Hub",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset link."
      icon={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <KeyRound className="h-5 w-5" />
        </div>
      }
    >
      <ForgotPasswordForm />

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
