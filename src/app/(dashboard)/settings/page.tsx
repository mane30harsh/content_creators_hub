import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAppRole, ROLE_LABELS } from "@/lib/roles";
import { ChangePasswordForm } from "./change-password-form";
import { NotificationSettingsForm } from "./notification-settings-form";
import { BackButton } from "@/components/shared/back-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  ShieldCheck,
  Bell,
  KeyRound,
  ExternalLink,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings – Brridge",
  description: "Manage your account, security, and notification preferences.",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      password: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const role = isAppRole(user.role) ? user.role : "CREATOR";
  const profileEditHref =
    role === "CREATOR"
      ? "/creator/profile/edit"
      : role === "BRAND"
      ? "/brand/profile/edit"
      : "/admin/dashboard";

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isOAuth = !user.password;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <BackButton href={role === "CREATOR" ? "/creator/dashboard" : role === "BRAND" ? "/brand/dashboard" : "/admin/dashboard"} label="Back to Dashboard" />
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account credentials, security settings, and preferences.
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
          <TabsTrigger value="account" className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1.5">
            <KeyRound className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Account Overview */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Overview of your registered account information and role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Name
                  </label>
                  <p className="mt-1 text-sm font-medium">{user.name ?? "Not provided"}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email Address
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm font-medium">{user.email}</p>
                    {user.emailVerified ? (
                      <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px]">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Account Role
                  </label>
                  <p className="mt-1 text-sm font-medium">
                    <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Member Since
                  </label>
                  <p className="mt-1 text-sm font-medium">{joinedDate}</p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="text-sm font-medium">Public Profile & Portfolio</h4>
                  <p className="text-xs text-muted-foreground">
                    Update your avatar, bio, social links, and public showcases.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild className="shrink-0">
                  <Link href={profileEditHref}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security & Password */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>
                Ensure your account is using a strong, unique password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isOAuth ? (
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  You logged in using a social provider (Google/OAuth). Passwords cannot be managed for this account type.
                </div>
              ) : (
                <ChangePasswordForm />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to be notified about platform activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
