'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronDown, Copy, Check, Lock, BookOpen, Send, ShieldCheck, FileText, Bot, Menu, X, ExternalLink, Mail, UserCheck } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';

export default function DocsPage() {
  const { user, isLoading, isInitialized } = useAuthStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fullDocumentation = `# DropAphi v1 - Full Documentation

## 🛡️ Authentication
All API requests must include your API key in the X-API-Key header.
Example: curl -H "X-API-Key: da_live_your_key" https://dropaphi.xyz/api/v1/...

## 📧 Email API
POST /v1/email/send
Body: { "to": "...", "subject": "...", "html": "...", "fromName": "...", "fromEmail": "...", "cc": [], "bcc": [], "attachments": [], "template": "welcome" }

GET /v1/email/templates
Returns available templates and variables.

GET /v1/email/[id]
Returns status and tracking info for an email.

## 📰 Newsletter API
POST /v1/newsletter/subscribe
Body: { "email": "...", "name": "...", "source": "...", "templateId": "tmpl_..." }

GET /v1/newsletter/subscribers
Query: ?page=1&limit=50&status=ACTIVE&segment=newsletter
Returns paginated list of subscribers.

GET /api/unsubscribe
Query: ?email=user@example.com&workspace=ws_123
Public endpoint to unsubscribe a user.

## 🎨 Email Builder
The Email Builder allows you to create templates visually or via code.
1. Design: Use Visual, Code, or Text modes.
2. Save: Save as a template to get a templateId.
3. Trigger: Use the templateId in Newsletter or Email APIs.

## 🔑 OTP API
POST /v1/otp/send
Body: { "email": "...", "brandName": "...", "fromName": "...", "fromEmail": "...", "length": 6, "expiry": 10 }
Note: 60-second cooldown per recipient.

POST /v1/otp/resend
Body: { "email": "...", "reason": "expired|not_received|new_request" }

POST /v1/otp/verify
Body: { "email": "...", "code": "..." }

## 📁 Files API
POST /v1/files/upload (Multipart)
Max: 10MB. 

GET /v1/files
List workspace files.

GET /v1/files/[fileId]
Get file metadata and URLs.

## 🤖 Agent Instructions
1. Always use X-API-Key.
2. Handle 429 by waiting (details.nextAttemptIn).
3. Prefer HTML for emails.
4. Use PRIVATE visibility for sensitive files.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullDocumentation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySection = (section: any) => {
    const text = `# ${section.title}\n\n${section.subsections.map((sub: any) => {
      // If content doesn't already have triple backticks, wrap it
      const formattedContent = sub.content.includes('```') 
        ? sub.content 
        : `\`\`\`\n${sub.content}\n\`\`\``;
      return `### ${sub.title}\n${formattedContent}`;
    }).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedSection(section.id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const docSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <BookOpen size={20} />,
      subsections: [
        { 
          title: 'Overview', 
          content: 'DropAphi provides a robust, developer-first communication infrastructure. Send emails, manage OTPs, and store files with a single, unified API.' 
        },
        { 
          title: 'SDK Installation', 
          content: 'Install the official DropAphi SDKs to integrate in minutes.\n\nNode/Backend:\nnpm install @dropaphi/node\npnpm add @dropaphi/node\n\nReact/Frontend:\nnpm install @dropaphi/react\npnpm add @dropaphi/react' 
        },
        { 
          title: 'Authentication', 
          content: 'All API requests must include your API key.\n\nSDK Usage:\nconst dropaphi = new Dropaphi("da_live_xxx");\n\nHTTP Header: X-API-Key' 
        },
        { 
          title: 'Base URL', 
          content: 'https://dropaphi.xyz/api/v1' 
        },
      ]
    },
    {
      id: 'email-api',
      title: 'Email API',
      icon: <Send size={20} />,
      subsections: [
        { 
          title: 'Send Email (SDK)', 
          content: 'await dropaphi.emails.send({\n  to: "user@example.com",\n  subject: "Hello",\n  html: "<h1>Welcome</h1>",\n  attachments: [\n    {\n      "filename": "invoice.pdf",\n      "url": "https://cdn.dropaphi.com/file_123.pdf" // High-performance URL method\n    }\n  ]\n});' 
        },
        { 
          title: 'Attachment: URL Method', 
          content: 'The recommended way to send attachments is to upload them first via the Files API and then provide the live URL in the email request. This is faster and supports larger files.' 
        },
        { 
          title: 'Templates', 
          content: 'GET /v1/email/templates\n\nLists all available system templates and the dynamic variables they require.' 
        },
        { 
          title: 'Email Status', 
          content: 'GET /v1/email/[id]\n\nRetrieve delivery and tracking status (opens/clicks) for a specific email by its ID.' 
        },
      ]
    },
    {
      id: 'newsletter-api',
      title: 'Newsletter API',
      icon: <Send size={20} />,
      subsections: [
        { 
          title: 'Subscribe (SDK)', 
          content: 'await dropaphi.newsletter.subscribe({\n  email: "subscriber@example.com",\n  name: "Jane Doe"\n});' 
        },
        { 
          title: 'NewsletterForm (React)', 
          content: 'Drop-in a customizable form with OTP verification support.\n\n<NewsletterForm \n  apiKey="da_live_xxx" \n  requireOTP={true}\n  className="p-4 border rounded"\n  buttonClassName="bg-red-500 text-white"\n/>' 
        },
        { 
          title: 'List Subscribers', 
          content: 'GET /v1/newsletter/subscribers\n\nQuery Parameters:\n- page: Page number (default: 1)\n- limit: Results per page (default: 50, max: 100)\n- status: Filter by status (ACTIVE, UNSUBSCRIBED)\n- segment: Filter by segment name\n\nReturns a paginated list of your workspace subscribers.' 
        },
        { 
          title: 'Public Unsubscribe', 
          content: 'GET /api/unsubscribe\n\nQuery Parameters:\n- email: The email address to unsubscribe\n- workspace: (Optional) The workspace ID\n\nThis is a public endpoint that displays an HTML success page. Use this in your email footers.' 
        },
      ]
    },
    {
      id: 'email-builder',
      title: 'Email Builder',
      icon: <Mail size={20} />,
      subsections: [
        { 
          title: 'Design Templates', 
          content: 'Create and manage responsive email templates using our visual builder. Access the dedicated documentation for detailed guides on modes, variables, and API integration.\n\n[View Email Builder Docs](/docs/email-builder)' 
        },
      ]
    },
    {
      id: 'otp-api',
      title: 'OTP API',
      icon: <ShieldCheck size={20} />,
      subsections: [
        { 
          title: 'Send OTP (SDK)', 
          content: 'await dropaphi.otp.send({\n  email: "user@example.com",\n  brandName: "MyBrand"\n});' 
        },
        { 
          title: 'Verify OTP (SDK)', 
          content: 'await dropaphi.otp.verify({\n  email: "user@example.com",\n  code: "123456"\n});' 
        },
      ]
    },
    {
      id: 'file-storage',
      title: 'File Storage',
      icon: <FileText size={20} />,
      subsections: [
        { 
          title: 'Upload File (SDK)', 
          content: 'const file = await dropaphi.files.upload(fileBlob, "report.pdf");\nconsole.log(file.url);\n\n// Note: When using the SDK or fetch with FormData,\n// the "Content-Type" header is set automatically with the correct boundary.\n// Do NOT set it manually.' 
        },
        { 
          title: 'List Files', 
          content: 'const files = await dropaphi.files.list({ page: 1, limit: 50 });' 
        },
        { 
          title: 'File Details', 
          content: 'GET /v1/files/[fileId]\n\nReturns file metadata and access URLs. Private files require the X-API-Key header.' 
        },
      ]
    },
    {
      id: 'agent-guide',
      title: 'AI Agent Guide',
      icon: <Bot size={20} />,
      subsections: [
        { 
          title: 'Integration Tips', 
          content: 'This API is optimized for AI agents.\n\n1. Error Handling: Always check for "details.nextAttemptIn" on 429 errors.\n2. Visibility: Use "PRIVATE" for any files containing user data.\n3. Content: Prefer sending HTML emails for better engagement.' 
        }
      ]
    }
  ];

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC143C]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-md" style={{ borderColor: '#E5E5E5' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded font-bold text-white text-sm bg-[#DC143C]">
                D
              </div>
              <span className="font-bold text-lg text-[#1A1A1A]">DropAPHI Docs</span>
            </Link>
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 text-gray-600 hover:text-[#DC143C]"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              {!user ? (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-sm">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="text-sm bg-[#DC143C] hover:bg-[#B21031]">Get Started</Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 hidden sm:inline">{user.email}</span>
                  <Link href="/dashboard">
                    <Button variant="outline" className="text-sm">Dashboard</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {!user ? (
        /* Logged Out View */
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4">
          <div className="bg-white p-10 rounded-2xl border border-[#E5E5E5] shadow-sm max-w-md w-full text-center">
            <div className="w-16 h-16 bg-[#FFF5F5] rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="text-[#DC143C]" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">Documentation Locked</h1>
            <p className="text-gray-600 mb-8">Please log in to view the API documentation, access your API keys, and start integrating.</p>
            <div className="space-y-3">
              <Link href="/auth/login" className="block">
                <Button className="w-full bg-[#1A1A1A] hover:bg-black py-6 text-lg">Login to See Docs</Button>
              </Link>
              <Link href="/auth/signup" className="block">
                <Button variant="outline" className="w-full py-6">Create Free Account</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Logged In View */
        <div className="flex max-w-7xl mx-auto relative">
          {/* Sidebar */}
          <aside className={`
            ${isMobileMenuOpen ? 'fixed inset-0 z-40 bg-white pt-24' : 'hidden lg:block'} 
            w-full lg:w-72 border-r h-[calc(100vh-65px)] p-8 sticky top-[65px] overflow-y-auto
          `} style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
            <div className="flex flex-col h-full">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Contents</h3>
              <nav className="space-y-1 flex-1">
                {docSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setExpandedSection(section.id);
                      setIsMobileMenuOpen(false);
                      const element = document.getElementById(section.id);
                      if (element) {
                        const offset = 100;
                        const bodyRect = document.body.getBoundingClientRect().top;
                        const elementRect = element.getBoundingClientRect().top;
                        const elementPosition = elementRect - bodyRect;
                        const offsetPosition = elementPosition - offset;
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group"
                    style={{
                      color: expandedSection === section.id ? '#DC143C' : '#4B5563',
                      backgroundColor: expandedSection === section.id ? '#FFF5F5' : 'transparent'
                    }}
                  >
                    <span className={expandedSection === section.id ? 'text-[#DC143C]' : 'text-gray-400 group-hover:text-gray-600'}>
                      {section.icon}
                    </span>
                    {section.title}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <Link href="/docs/email-builder">
                  <Button variant="ghost" className="w-full flex items-center justify-start gap-3 text-gray-600 hover:text-[#DC143C] hover:bg-[#FFF5F5]">
                    <Mail size={18} />
                    <span>Email Builder</span>
                    <ExternalLink size={14} className="ml-auto opacity-50" />
                  </Button>
                </Link>
                <Link href="/docs/dropid">
                  <Button variant="ghost" className="w-full flex items-center justify-start gap-3 text-gray-600 hover:text-[#DC143C] hover:bg-[#FFF5F5]">
                    <UserCheck size={18} />
                    <span>DropID Docs</span>
                    <ExternalLink size={14} className="ml-auto opacity-50" />
                  </Button>
                </Link>
              </div>

              <div className="mt-10 pt-10 border-t border-gray-100">
                <Button 
                  onClick={copyToClipboard}
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 py-6 border-dashed"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy Full Doc'}
                </Button>
                <p className="text-[10px] text-gray-400 mt-2 text-center uppercase tracking-tighter">Copy for your AI Agent</p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 px-4 py-8 sm:px-8 lg:px-12 max-w-4xl">
            <header className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF5F5] text-[#DC143C] text-xs font-bold mb-4 uppercase tracking-wider">
                <ShieldCheck size={14} /> v1.2 Production Ready
              </div>
              <h1 className="text-4xl font-extrabold text-[#1A1A1A] mb-4">API Reference</h1>
              <p className="text-xl text-gray-600 leading-relaxed">Everything you need to integrate DropAphi into your application or AI agent.</p>
            </header>

            <div className="space-y-12">
              {docSections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-center text-[#DC143C] shadow-sm">
                        {section.icon}
                      </div>
                      <h2 className="text-2xl font-bold text-[#1A1A1A]">{section.title}</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copySection(section)}
                      className="flex items-center gap-2 text-gray-400 hover:text-[#DC143C] transition-colors"
                    >
                      {copiedSection === section.id ? (
                        <>
                          <Check size={16} className="text-green-500" />
                          <span className="text-xs font-bold text-green-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span className="text-xs font-bold">Copy Section</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {section.subsections.map((sub, idx) => (
                      <div key={idx} className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                          <h3 className="font-bold text-[#1A1A1A]">{sub.title}</h3>
                        </div>
                        <div className="p-6">
                          <pre className="text-sm font-mono text-[#334155] whitespace-pre-wrap bg-[#f8fafc] p-4 rounded-xl border border-[#f1f5f9]">
                            {sub.content}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Footer CTA */}
            <div className="mt-20 p-10 rounded-3xl bg-[#1A1A1A] text-center overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#DC143C] opacity-10 rounded-full -mr-32 -mt-32"></div>
              <h2 className="text-3xl font-bold text-white mb-4">Ready to build?</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Join thousands of developers building the future of communication.</p>
              <Link href="/dashboard">
                <Button size="lg" className="bg-[#DC143C] hover:bg-[#B21031] px-10 py-6 text-lg rounded-xl">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
