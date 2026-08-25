import Link from "next/link";
import { Code2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <header className="border-b border-border bg-bg-elevated">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">
              <span className="text-text-primary">NexusAPI</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-text-muted hover:text-text-primary transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-4 text-3xl font-bold text-text-primary">Terms and Conditions</h1>
        <p className="mb-8 text-sm text-text-muted">Last updated: August 25, 2026</p>

        <div className="space-y-8 text-text-secondary">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">1. Acceptance of Terms</h2>
            <p className="mb-3 leading-relaxed">
              By accessing or using NexusAPI, you agree to be bound by these Terms and Conditions. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">2. Account Registration</h2>
            <p className="mb-3 leading-relaxed">
              You must provide accurate, complete information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">3. API Usage</h2>
            <p className="mb-3 leading-relaxed">
              You may use NexusAPI in compliance with these terms and applicable law. You may not use the service to build competing products, to send spam, or to violate any laws. Rate limits and usage quotas must be respected.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">4. Payment Terms</h2>
            <p className="mb-3 leading-relaxed">
              Paid plans are billed monthly in advance. All fees are non-refundable except as required by law. We reserve the right to change pricing with 30 days advance notice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">5. Intellectual Property</h2>
            <p className="mb-3 leading-relaxed">
              NexusAPI and its contents are owned by NexusAPI Inc. You retain ownership of data you submit to the service. You grant us a limited license to process your data for the purpose of providing the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">6. Service Availability</h2>
            <p className="mb-3 leading-relaxed">
              We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance is performed with advance notice when possible. We are not liable for downtime or data loss.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">7. Termination</h2>
            <p className="mb-3 leading-relaxed">
              Either party may terminate this agreement at any time. Upon termination, your right to use the service ceases. We may retain your data for up to 30 days after termination for recovery purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">8. Limitation of Liability</h2>
            <p className="mb-3 leading-relaxed">
              NexusAPI shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">9. Governing Law</h2>
            <p className="mb-3 leading-relaxed">
              These terms are governed by the laws of the State of Delaware, United States. Any disputes shall be resolved in the courts of Wilmington, Delaware.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">10. Contact</h2>
            <p className="mb-3 leading-relaxed">
              For questions about these Terms, contact us at <a href="mailto:legal@nexusapi.dev" className="text-primary hover:text-primary-light">legal@nexusapi.dev</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
