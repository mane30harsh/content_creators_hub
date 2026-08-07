import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service – Brridge",
  description: "Terms and conditions for using Brridge.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            C
          </span>
          Brridge
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
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
              <p className="text-sm text-muted-foreground">Last updated: August 2026</p>
            </div>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By creating an account or accessing Brridge (&quot;Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not access or use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. User Roles & Account Registration</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Brridge offers accounts for Creators and Brands. Users must provide accurate, complete information during registration and keep account details updated. You are responsible for safeguarding your account credentials.
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li><strong>Creators:</strong> Must provide accurate portfolio items, audience metrics, and contact details.</li>
              <li><strong>Brands:</strong> Must represent legitimate businesses and provide valid business contact information.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Partnerships & Campaign Collaborations</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Platform facilitates connections between Brands and Content Creators. All agreements, deliverables, timelines, and compensation negotiated between Brands and Creators must comply with applicable advertising standards and transparency laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Acceptable Use & Conduct</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You agree not to engage in fraudulent activity, upload malicious content, impersonate others, or violate intellectual property rights. We reserve the right to suspend or terminate accounts that violate community guidelines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Intellectual Property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Creators retain ownership of their content. By submitting content or portfolio work to the Platform, you grant us a limited license to display your profile and work to prospective Brand partners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Brridge is provided &quot;as is&quot; without warranties of any kind. We are not liable for direct, indirect, incidental, or consequential damages resulting from your use of the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions regarding these Terms, please contact our support team at{" "}
              <a href="mailto:support@brridge.in" className="text-primary underline underline-offset-4">
                support@brridge.in
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
