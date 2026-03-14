import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main style={{ backgroundColor: '#FAFAFA' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: '#E5E5E5' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded font-bold text-white text-sm"
                style={{ backgroundColor: '#DC143C' }}
              >
                D
              </div>
              <span className="hidden sm:inline font-bold text-lg" style={{ color: '#1A1A1A' }}>
                Drop API
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/auth/login">
                <Button variant="outline" className="text-xs sm:text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="text-xs sm:text-sm" style={{ backgroundColor: '#DC143C' }}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Privacy Policy
          </h1>
          <p style={{ color: '#999999' }} className="text-sm">
            Last Updated: February 2024
          </p>
        </div>

        <div className="space-y-8" style={{ color: '#666666' }}>
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              1. Introduction
            </h2>
            <p className="leading-relaxed">
              Drop API ("we", "us", "our", or "Company") operates the Drop API website and platform. This Privacy Policy outlines how we collect, use, disclose, and safeguard your personal information when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              2. Information We Collect
            </h2>
            <p className="leading-relaxed mb-4">
              We collect information in various ways, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Information you voluntarily provide (name, email, phone, company details)</li>
              <li>Information collected automatically (IP address, browser type, pages visited)</li>
              <li>Information from third parties and publicly available sources</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              3. How We Use Your Information
            </h2>
            <p className="leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send transaction confirmations</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Monitor and analyze usage trends and service performance</li>
              <li>Comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              4. Data Security
            </h2>
            <p className="leading-relaxed">
              We implement comprehensive security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These include encryption, secure sockets layer (SSL) technology, and regular security audits. However, no method of transmission over the internet is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              5. Information Sharing
            </h2>
            <p className="leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers who assist us in operating our website and conducting business</li>
              <li>Law enforcement when required by law or to protect rights and safety</li>
              <li>Acquirers in the event of merger, acquisition, or asset sale</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              6. Your Privacy Rights
            </h2>
            <p className="leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability (request a copy of your data)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              7. Cookies and Tracking Technologies
            </h2>
            <p className="leading-relaxed">
              Our website uses cookies to enhance your experience. Cookies are small files stored on your device that help us remember preferences and understand usage patterns. You can disable cookies through your browser settings, though some features may not function properly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              8. Third-Party Links
            </h2>
            <p className="leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of external sites. We encourage you to review their privacy policies before providing personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              9. Children's Privacy
            </h2>
            <p className="leading-relaxed">
              Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If we discover we have inadvertently collected such information, we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              10. Policy Updates
            </h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of significant changes by posting the updated policy on our website and updating the "Last Updated" date. Your continued use of our services constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              11. Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 p-4 rounded" style={{ backgroundColor: '#F5F5F5' }}>
              <p className="font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Drop API Support
              </p>
              <p>Email: privacy@dropapi.com</p>
              <p>Address: Lagos, Nigeria</p>
            </div>
          </section>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t mt-12 sm:mt-16 py-8 sm:py-12" style={{ borderColor: '#E5E5E5' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                Legal
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: '#666666' }}>
                <li><Link href="/privacy" className="hover:underline">Privacy</Link></li>
                <li><Link href="/terms" className="hover:underline">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8" style={{ borderColor: '#E5E5E5' }}>
            <p className="text-center text-sm" style={{ color: '#666666' }}>
              &copy; 2024 Drop API. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
