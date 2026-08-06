import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy – Content Creators Hub",
  description: "Privacy policy and data handling guidelines for Content Creators Hub.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            C
          </span>
          Content Creators Hub
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">Last updated: August 2026</p>
            </div>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collect information you provide directly to us when creating an account, building a profile, or communicating on Content Creators Hub:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li><strong>Account Details:</strong> Name, email address, password, role (Creator or Brand), and country.</li>
              <li><strong>Profile Information:</strong> Social media links, portfolios, bios, brand website, industry, and contact details.</li>
              <li><strong>Usage Data:</strong> Device information, IP address, and platform activity to improve user experience.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use your data to power the Platform features and facilitate collaborations between Creators and Brands:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Enabling Creators to present their portfolios and apply for campaigns.</li>
              <li>Helping Brands search, discover, and contact relevant Creators.</li>
              <li>Processing logins, authenticating sessions, and ensuring platform security.</li>
              <li>Sending essential account and campaign notifications.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Information Sharing & Disclosure</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Public profile information (such as creator portfolios, niches, and brand logos) is visible to registered users to enable discovery. We do not sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We implement industry-standard security measures, including encrypted passwords (bcrypt) and HTTPS connections, to protect your personal information against unauthorized access or disclosure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Your Rights & Choices</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You have the right to access, edit, or delete your account and profile information at any time through your dashboard profile settings, or by contacting our privacy team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Contact Our Privacy Team</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions or concerns about this Privacy Policy, please reach out to us at{" "}
              <a href="mailto:privacy@brridge.in" className="text-primary underline underline-offset-4">
                privacy@brridge.in
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
