import Link from "next/link";
import { AuthCard } from "@/components/shared/auth-card";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <AuthCard title="Welcome back" description="Sign in to your account">
      <LoginForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
