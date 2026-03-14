import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p style={{ color: '#999999' }} className="text-sm">
            Last Updated: February 2024
          </p>
        </div>

        <div className="space-y-8" style={{ color: '#666666' }}>
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              1. Agreement to Terms
            </h2>
            <p className="leading-relaxed">
              By accessing and using the Drop API website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              2. Use License
            </h2>
            <p className="leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on Drop API's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the website</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              3. Disclaimer
            </h2>
            <p className="leading-relaxed">
              The materials on Drop API's website are provided on an 'as is' basis. Drop API makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              4. Limitations
            </h2>
            <p className="leading-relaxed">
              In no event shall Drop API or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Drop API's website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              5. Accuracy of Materials
            </h2>
            <p className="leading-relaxed">
              The materials appearing on Drop API's website could include technical, typographical, or photographic errors. Drop API does not warrant that any of the materials on its website are accurate, complete, or current. Drop API may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              6. Links
            </h2>
            <p className="leading-relaxed">
              Drop API has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Drop API of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              7. Modifications
            </h2>
            <p className="leading-relaxed">
              Drop API may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              8. Governing Law
            </h2>
            <p className="leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of Nigeria, and you irrevocably submit to the exclusive jurisdiction of the courts located in Lagos, Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              9. User Accounts
            </h2>
            <p className="leading-relaxed mb-4">
              If you create an account with Drop API, you are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of unauthorized use</li>
              <li>Providing accurate and complete information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              10. Prohibited Activities
            </h2>
            <p className="leading-relaxed mb-4">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harassing or causing distress or inconvenience to any person</li>
              <li>Obscene or abusive language or content</li>
              <li>Disrupting the normal flow of dialogue within the website</li>
              <li>Attempting to gain unauthorized access to our systems</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              11. Payment Terms
            </h2>
            <p className="leading-relaxed mb-4">
              By initiating a transaction, you authorize Drop API to charge the payment method you provide. You agree to pay all charges that we incur on your behalf, including applicable taxes. We reserve the right to modify pricing with 30 days' notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              12. Service Availability
            </h2>
            <p className="leading-relaxed">
              Drop API strives to maintain 99.9% uptime, but we do not guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect service availability. We are not liable for any service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              13. Contact Information
            </h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 rounded" style={{ backgroundColor: '#F5F5F5' }}>
              <p className="font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Drop API Support
              </p>
              <p>Email: support@dropapi.com</p>
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
