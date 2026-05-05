'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronDown, Copy, Check, Lock, BookOpen, Send, ShieldCheck, FileText, Bot } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';

export default function DocsPage() {
  const { user, isLoading, isInitialized } = useAuthStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');
  const [copied, setCopied] = useState(false);

  const fullDocumentation = `# DropAphi v1 - Full Documentation

## 🛡️ Authentication
All API requests must include your API key in the X-API-Key header.
Example: curl -H "X-API-Key: da_live_your_key" https://api.dropaphi.com/v1/...

## 📧 Email API
POST /v1/email/send
Body: { "to": "...", "subject": "...", "html": "...", "template": "welcome" }

GET /v1/email/templates
Returns available templates and variables.

## 📰 Newsletter API
POST /v1/newsletter/subscribe
Body: { "email": "...", "name": "...", "source": "...", "templateId": "tmpl_..." }

## 🎨 Email Builder
The Email Builder allows you to create templates visually or via code.
1. Design: Use Visual, Code, or Text modes.
2. Save: Save as a template to get a templateId.
3. Trigger: Use the templateId in Newsletter or Email APIs.

## 🔑 OTP API
POST /v1/otp/send
Body: { "email": "...", "brandName": "...", "length": 6 }
Note: 60-second cooldown per recipient.

POST /v1/otp/verify
Body: { "email": "...", "code": "..." }

## 📁 Files API
POST /v1/files/upload (Multipart)
Max: 10MB. 

GET /v1/files
List workspace files.

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
          title: 'Authentication', 
          content: 'Authentication is handled via API Keys. \n\nHeader: X-API-Key\nFormat: da_live_... or da_test_...' 
        },
        { 
          title: 'Base URL', 
          content: 'https://api.dropaphi.com/v1' 
        },
      ]
    },
    {
      id: 'email-api',
      title: 'Email API',
      icon: <Send size={20} />,
      subsections: [
        { 
          title: 'Send Email', 
          content: 'POST /v1/email/send\n\nRequest:\n{\n  "to": "user@example.com",\n  "subject": "Hello",\n  "html": "<h1>Welcome</h1>",\n  "template": "welcome",\n  "templateData": { "name": "John" }\n}\n\nTemplates: welcome, newsletter, marketing, notification.' 
        },
        { 
          title: 'Templates', 
          content: 'GET /v1/email/templates\n\nLists all available system templates and the dynamic variables they require.' 
        },
      ]
    },
    {
      id: 'newsletter-api',
      title: 'Newsletter API',
      icon: <Send size={20} />,
      subsections: [
        { 
          title: 'Subscribe', 
          content: 'POST /v1/newsletter/subscribe\n\nRequest:\n{\n  "email": "subscriber@example.com",\n  "name": "Jane Doe",\n  "source": "landing_page",\n  "templateId": "tmpl_12345"\n}\n\nAdds a new subscriber to your newsletter list and sends a welcome email. Optionally specify a templateId to use a custom design.' 
        },
      ]
    },
    {
      id: 'email-builder',
      title: 'Email Builder',
      icon: <FileText size={20} />,
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
          title: 'Send OTP', 
          content: 'POST /v1/otp/send\n\nRequest:\n{\n  "email": "user@example.com",\n  "brandName": "MyBrand",\n  "length": 6,\n  "expiry": 10\n}\n\nSecurity: Includes a 60-second cooldown between requests to the same email to prevent spam.' 
        },
        { 
          title: 'Verify OTP', 
          content: 'POST /v1/otp/verify\n\nRequest:\n{\n  "email": "user@example.com",\n  "code": "123456"\n}' 
        },
      ]
    },
    {
      id: 'file-storage',
      title: 'File Storage',
      icon: <FileText size={20} />,
      subsections: [
        { 
          title: 'Upload File', 
          content: 'POST /v1/files/upload\n\nMethod: Multipart/Form-Data\nField: "file"\nLimits: 10MB per file.\n\nStrict quota enforcement: Uploads are blocked if workspace limit is reached.' 
        },
        { 
          title: 'List Files', 
          content: 'GET /v1/files\n\nReturns a paginated list of all files in your workspace.' 
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
        <div className="flex max-w-7xl mx-auto">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 border-r min-h-screen p-8 sticky top-[65px]" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Contents</h3>
            <nav className="space-y-1">
              {docSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setExpandedSection(section.id);
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
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-center text-[#DC143C] shadow-sm">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A]">{section.title}</h2>
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
