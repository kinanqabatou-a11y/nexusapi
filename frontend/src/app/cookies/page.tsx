import Link from "next/link";
import { Code2 } from "lucide-react";

export default function CookiesPage() {
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
        <h1 className="mb-4 text-3xl font-bold text-text-primary">Cookie Policy</h1>
        <p className="mb-8 text-sm text-text-muted">Last updated: August 25, 2026</p>

        <div className="space-y-8 text-text-secondary">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">1. What Are Cookies</h2>
            <p className="mb-3 leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. They help us recognize your browser, remember your preferences, and improve your experience on our platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">2. How We Use Cookies</h2>
            <p className="mb-3 leading-relaxed">
              We use cookies to keep you signed in, remember your preferences, understand how you use our platform, and for security purposes. We do not use cookies for targeted advertising.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">3. Types of Cookies</h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Purpose</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 font-medium text-text-primary">Essential</td>
                    <td className="px-4 py-3 text-text-secondary">Authentication, security, core functionality</td>
                    <td className="px-4 py-3 text-text-muted">Session / 30 days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-text-primary">Functional</td>
                    <td className="px-4 py-3 text-text-secondary">Remember preferences, language, theme</td>
                    <td className="px-4 py-3 text-text-muted">1 year</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-text-primary">Analytics</td>
                    <td className="px-4 py-3 text-text-secondary">Usage statistics, performance monitoring</td>
                    <td className="px-4 py-3 text-text-muted">2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">4. Managing Cookies</h2>
            <p className="mb-3 leading-relaxed">
              You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that disabling essential cookies may prevent you from using the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">5. Third-Party Cookies</h2>
            <p className="mb-3 leading-relaxed">
              We may use third-party services that set cookies, including analytics providers and payment processors. These third parties have their own privacy policies governing their use of cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">6. Changes to This Policy</h2>
            <p className="mb-3 leading-relaxed">
              We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of the service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-text-primary">7. Contact</h2>
            <p className="mb-3 leading-relaxed">
              For questions about our use of cookies, contact us at <a href="mailto:privacy@nexusapi.dev" className="text-primary hover:text-primary-light">privacy@nexusapi.dev</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
