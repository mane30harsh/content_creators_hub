import Link from "next/link";
import { AuthCard } from "@/components/shared/auth-card";
import { RegisterForm } from "@/components/forms/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account – Content Creators Hub",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Join thousands of creators and brands on the platform."
    >
      <RegisterForm />

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}
