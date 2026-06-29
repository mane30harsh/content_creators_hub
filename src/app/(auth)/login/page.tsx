import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/shared/auth-card";
import { LoginForm } from "@/components/forms/login-form";
import { LockKeyhole } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In – Content Creators Hub",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account to continue."
      icon={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
          <LockKeyhole className="h-5 w-5" />
        </div>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign up free
        </Link>
      </div>
    </AuthCard>
  );
}
