'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export default function DocsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');

  const docSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      subsections: [
        { title: 'Overview', content: 'Drop API provides a unified interface for all communication needs. Get started with our APIs in minutes.' },
        { title: 'Authentication', content: 'All API requests require an API key. Include it in the Authorization header: Bearer YOUR_API_KEY' },
        { title: 'Base URL', content: 'https://api.dropapi.io/v1' },
      ]
    },
    {
      id: 'sms-api',
      title: 'SMS API',
      subsections: [
        { title: 'Send SMS', content: 'POST /sms/send - Send individual or bulk SMS messages.\n\nRequest:\n{\n  "to": "+234701234567",\n  "message": "Your OTP is 123456",\n  "from": "Drop"\n}\n\nResponse:\n{\n  "status": "success",\n  "message_id": "msg_123456",\n  "cost": 1.5\n}' },
        { title: 'Get Balance', content: 'GET /sms/balance - Check your current SMS credits.\n\nResponse:\n{\n  "credits": 1000,\n  "value": 500.00,\n  "currency": "USD"\n}' },
        { title: 'Message Status', content: 'GET /sms/status/{message_id} - Track delivery status of sent messages.' },
      ]
    },
    {
      id: 'email-api',
      title: 'Email API',
      subsections: [
        { title: 'Send Email', content: 'POST /email/send - Send emails with HTML templates.\n\nRequest:\n{\n  "to": ["user@example.com"],\n  "subject": "Welcome to Drop",\n  "template": "welcome",\n  "data": { "name": "John" }\n}\n\nResponse:\n{\n  "status": "success",\n  "email_id": "email_789012",\n  "timestamp": "2024-02-16T10:30:00Z"\n}' },
        { title: 'Templates', content: 'Manage email templates in your dashboard. Use liquid syntax for dynamic content.' },
        { title: 'Webhooks', content: 'Subscribe to delivery events, bounces, and opens via webhooks.' },
      ]
    },
    {
      id: 'otp-api',
      title: 'OTP API',
      subsections: [
        { title: 'Generate OTP', content: 'POST /otp/generate - Create a new OTP for verification.\n\nRequest:\n{\n  "type": "sms",\n  "recipient": "+234701234567",\n  "length": 6,\n  "validity": 300\n}\n\nResponse:\n{\n  "otp_id": "otp_123456",\n  "expires_in": 300\n}' },
        { title: 'Verify OTP', content: 'POST /otp/verify - Validate an OTP code.\n\nRequest:\n{\n  "otp_id": "otp_123456",\n  "code": "123456"\n}\n\nResponse:\n{\n  "status": "valid",\n  "verified_at": "2024-02-16T10:30:00Z"\n}' },
      ]
    },
    {
      id: 'file-storage',
      title: 'File Storage',
      subsections: [
        { title: 'Upload File', content: 'POST /files/upload - Upload files with automatic CDN distribution.\n\nSupported formats: PDF, DOCX, XLSX, PNG, JPG, GIF\nMax file size: 100MB' },
        { title: 'Get File', content: 'GET /files/{file_id} - Retrieve file details and download URL.' },
        { title: 'CDN URLs', content: 'Files are automatically available on our global CDN. URLs are generated upon upload.' },
      ]
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      subsections: [
        { title: 'Setup Webhooks', content: 'Configure webhook endpoints in your dashboard settings to receive real-time events.' },
        { title: 'Events', content: 'Available events: message.delivered, message.bounced, email.opened, email.clicked, file.uploaded' },
        { title: 'Retries', content: 'Failed webhooks are retried 5 times with exponential backoff.' },
      ]
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      subsections: [
        { title: 'Rate Limiting', content: 'Standard: 1000 requests/minute\nBulk: 100,000 requests/minute\nImplement backoff strategies for rate limit errors.' },
        { title: 'Error Handling', content: 'Always handle errors gracefully. Implement exponential backoff for retries.' },
        { title: 'Security', content: 'Never expose API keys. Use environment variables. Rotate keys regularly.' },
      ]
    },
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50" style={{ borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' }}>
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
                Drop API Docs
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

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className="hidden lg:block w-64 border-r p-6"
          style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
        >
          <h3 className="font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Documentation
          </h3>
          <nav className="space-y-2">
            {docSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full text-left px-3 py-2 rounded font-medium text-sm transition-colors"
                style={{
                  color: expandedSection === section.id ? '#DC143C' : '#666666',
                  backgroundColor: expandedSection === section.id ? '#FFF5F5' : 'transparent'
                }}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-8"
            style={{ color: '#1A1A1A' }}
          >
            API Documentation
          </h1>

          <div className="space-y-8">
            {docSections.map((section) => (
              <div key={section.id} className="scroll-mt-20" id={section.id}>
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between p-4 border rounded-lg mb-4 hover:border-opacity-100 transition-all"
                  style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
                >
                  <h2
                    className="text-xl font-bold"
                    style={{ color: '#1A1A1A' }}
                  >
                    {section.title}
                  </h2>
                  <ChevronDown
                    size={20}
                    style={{
                      color: '#666666',
                      transform: expandedSection === section.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  />
                </button>

                {expandedSection === section.id && (
                  <div className="space-y-4">
                    {section.subsections.map((subsection, idx) => (
                      <div
                        key={idx}
                        className="p-6 border rounded-lg"
                        style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
                      >
                        <h3
                          className="font-bold text-lg mb-3"
                          style={{ color: '#1A1A1A' }}
                        >
                          {subsection.title}
                        </h3>
                        <pre
                          className="bg-gray-100 p-4 rounded overflow-x-auto text-xs leading-relaxed"
                          style={{ color: '#333333', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                        >
                          {subsection.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div
            className="mt-16 p-8 sm:p-12 rounded text-center"
            style={{ backgroundColor: '#1A1A1A' }}
          >
            <h2 className="text-2xl font-bold mb-4 text-white">
              Ready to integrate?
            </h2>
            <p className="text-gray-300 mb-6">
              Get your API key and start building immediately.
            </p>
            <Link href="/auth/signup">
              <Button
                size="lg"
                style={{ backgroundColor: '#DC143C' }}
              >
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
