import Link from "next/link";
import { Code2 } from "lucide-react";

export default function PrivacyPage() {
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
        <h1 className="mb-4 text-3xl font-bold text-text-primary">Privacy Policy</h1>
        <p className="mb-8 text-sm text-text-muted">Last updated: August 25, 2026</p>

        <div className="space-y-8 text-text-secondary">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">1. Information We Collect</h2>
            <p className="mb-3 leading-relaxed">
              We collect information you provide directly, including your name, email address, and payment information when you create an account. We also collect usage data such as API request logs, device information, and IP addresses for security and analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">2. How We Use Your Information</h2>
            <p className="mb-3 leading-relaxed">
              We use your information to provide, maintain, and improve our services. This includes processing transactions, sending service-related communications, monitoring for fraud and abuse, and analyzing usage patterns to enhance the platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">3. Data Sharing</h2>
            <p className="mb-3 leading-relaxed">
              We do not sell your personal information. We may share data with third-party service providers who assist in operating our platform, processing payments, or providing customer support. These providers are contractually bound to protect your data.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">4. Data Security</h2>
            <p className="mb-3 leading-relaxed">
              We implement industry-standard security measures including encryption in transit (TLS 1.3), encryption at rest, regular security audits, and access controls. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">5. Data Retention</h2>
            <p className="mb-3 leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services. API request logs are retained for 90 days. Account data is retained until you request deletion.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">6. Your Rights</h2>
            <p className="mb-3 leading-relaxed">
              You have the right to access, correct, or delete your personal data. You can export your data from the settings page. To exercise these rights, contact us at support@nexusapi.dev.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">7. Changes to This Policy</h2>
            <p className="mb-3 leading-relaxed">
              We may update this policy from time to time. We will notify you of material changes via email or through the platform at least 30 days before they take effect.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">8. Contact</h2>
            <p className="mb-3 leading-relaxed">
              For questions about this Privacy Policy, contact us at <a href="mailto:privacy@nexusapi.dev" className="text-primary hover:text-primary-light">privacy@nexusapi.dev</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
