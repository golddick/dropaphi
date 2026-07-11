// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { ChevronDown, Copy, Check, Lock, BookOpen, Send, ShieldCheck, FileText, Bot, Menu, X, ExternalLink, Mail, UserCheck } from 'lucide-react';
// import { useAuthStore } from '@/lib/stores/auth';

// export default function DocsPage() {
//   const { user, isLoading, isInitialized } = useAuthStore();
//   const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');
//   const [copied, setCopied] = useState(false);
//   const [copiedSection, setCopiedSection] = useState<string | null>(null);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const fullDocumentation = `# DropAphi v1 - Full Documentation

// ## 🛡️ Authentication
// All API requests must include your API key in the X-API-Key header.
// Example: curl -H " drop-api-key: da_live_your_key" https://dropaphi.xyz/api/v1/...

// ## 📧 Email API
// POST /v1/email/send
// Body: { "to": "...", "subject": "...", "html": "...", "fromName": "...", "fromEmail": "...", "cc": [], "bcc": [], "attachments": [], "template": "welcome" }

// GET /v1/email/templates
// Returns available templates and variables.

// GET /v1/email/[id]
// Returns status and tracking info for an email.

// ## 📰 Newsletter API
// POST /v1/newsletter/subscribe
// Body: { "email": "...", "name": "...", "source": "...", "templateId": "tmpl_..." }

// GET /v1/newsletter/subscribers
// Query: ?page=1&limit=50&status=ACTIVE&segment=newsletter
// Returns paginated list of subscribers.

// GET /api/unsubscribe
// Query: ?email=user@example.com&workspace=ws_123
// Public endpoint to unsubscribe a user.

// ## 🎨 Email Builder
// The Email Builder allows you to create templates visually or via code.
// 1. Design: Use Visual, Code, or Text modes.
// 2. Save: Save as a template to get a templateId.
// 3. Trigger: Use the templateId in Newsletter or Email APIs.

// ## 🔑 OTP API
// POST /v1/otp/send
// Body: { "email": "...", "brandName": "...", "fromName": "...", "fromEmail": "...", "length": 6, "expiry": 10 }
// Note: 60-second cooldown per recipient.

// POST /v1/otp/resend
// Body: { "email": "...", "reason": "expired|not_received|new_request" }

// POST /v1/otp/verify
// Body: { "email": "...", "code": "..." }

// ## 📁 Files API
// POST /v1/files/upload (Multipart)
// Max: 10MB. 

// GET /v1/files
// List workspace files. 

// GET /v1/files/[fileId]
// Get file metadata and URLs.

// ## 🤖 Agent Instructions
// 1. Always use drop-api-key.
// 2. Handle 429 by waiting (details.nextAttemptIn).
// 3. Prefer HTML for emails.
// 4. Use PRIVATE visibility for sensitive files.`;

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(fullDocumentation);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const copySection = (section: any) => {
//     const text = `# ${section.title}\n\n${section.subsections.map((sub: any) => {
//       // If content doesn't already have triple backticks, wrap it
//       const formattedContent = sub.content.includes('```') 
//         ? sub.content 
//         : `\`\`\`\n${sub.content}\n\`\`\``;
//       return `### ${sub.title}\n${formattedContent}`;
//     }).join('\n\n')}`;
//     navigator.clipboard.writeText(text);
//     setCopiedSection(section.id);
//     setTimeout(() => setCopiedSection(null), 2000);
//   };

//   const docSections = [
//     {
//       id: 'getting-started',
//       title: 'Getting Started',
//       icon: <BookOpen size={20} />,
//       subsections: [
//         { 
//           title: 'Overview', 
//           content: 'DropAphi provides a robust, developer-first communication infrastructure. Send emails, manage OTPs, and store files with a single, unified API.' 
//         },
//         { 
//           title: 'SDK Installation', 
//           content: 'Install the official DropAphi SDKs to integrate in minutes.\n\nNode/Backend:\nnpm install @dropaphi/node\npnpm add @dropaphi/node\n\nReact/Frontend:\nnpm install @dropaphi/react\npnpm add @dropaphi/react' 
//         },
//         { 
//           title: 'Authentication', 
//           content: 'All API requests must include your API key.\n\nSDK Usage:\nconst dropaphi = new Dropaphi("da_live_xxx");\n\nHTTP Header: X-API-Key' 
//         },
//         { 
//           title: 'Base URL', 
//           content: 'https://dropaphi.xyz/api/v1' 
//         },
//       ]
//     },
//     {
//       id: 'email-api',
//       title: 'Email API',
//       icon: <Send size={20} />,
//       subsections: [
//         { 
//           title: 'Send Email (SDK)', 
//           content: 'await dropaphi.emails.send({\n  to: "user@example.com",\n  subject: "Hello",\n  html: "<h1>Welcome</h1>",\n  attachments: [\n    {\n      "filename": "invoice.pdf",\n      "url": "https://cdn.dropaphi.com/file_123.pdf" // High-performance URL method\n    }\n  ]\n});' 
//         },
//         { 
//           title: 'Attachment: URL Method', 
//           content: 'The recommended way to send attachments is to upload them first via the Files API and then provide the live URL in the email request. This is faster and supports larger files.' 
//         },
//         { 
//           title: 'Templates', 
//           content: 'GET /v1/email/templates\n\nLists all available system templates and the dynamic variables they require.' 
//         },
//         { 
//           title: 'Email Status', 
//           content: 'GET /v1/email/[id]\n\nRetrieve delivery and tracking status (opens/clicks) for a specific email by its ID.' 
//         },
//       ]
//     },
//     {
//       id: 'newsletter-api',
//       title: 'Newsletter API',
//       icon: <Send size={20} />,
//       subsections: [
//         { 
//           title: 'Subscribe (SDK)', 
//           content: 'await dropaphi.newsletter.subscribe({\n  email: "subscriber@example.com",\n  name: "Jane Doe"\n});' 
//         },
//         { 
//           title: 'NewsletterForm (React)', 
//           content: 'Drop-in a customizable form with OTP verification support.\n\n<NewsletterForm \n  apiKey="da_live_xxx" \n  requireOTP={true}\n  className="p-4 border rounded"\n  buttonClassName="bg-red-500 text-white"\n/>' 
//         },
//         { 
//           title: 'List Subscribers', 
//           content: 'GET /v1/newsletter/subscribers\n\nQuery Parameters:\n- page: Page number (default: 1)\n- limit: Results per page (default: 50, max: 100)\n- status: Filter by status (ACTIVE, UNSUBSCRIBED)\n- segment: Filter by segment name\n\nReturns a paginated list of your workspace subscribers.' 
//         },
//         { 
//           title: 'Public Unsubscribe', 
//           content: 'GET /api/unsubscribe\n\nQuery Parameters:\n- email: The email address to unsubscribe\n- workspace: (Optional) The workspace ID\n\nThis is a public endpoint that displays an HTML success page. Use this in your email footers.' 
//         },
//       ]
//     },
//     {
//       id: 'email-builder',
//       title: 'Email Builder',
//       icon: <Mail size={20} />,
//       subsections: [
//         { 
//           title: 'Design Templates', 
//           content: 'Create and manage responsive email templates using our visual builder. Access the dedicated documentation for detailed guides on modes, variables, and API integration.\n\n[View Email Builder Docs](/docs/email-builder)' 
//         },
//       ]
//     },
//     {
//       id: 'otp-api',
//       title: 'OTP API',
//       icon: <ShieldCheck size={20} />,
//       subsections: [
//         { 
//           title: 'Send OTP (SDK)', 
//           content: 'await dropaphi.otp.send({\n  email: "user@example.com",\n  brandName: "MyBrand"\n});' 
//         },
//         { 
//           title: 'Verify OTP (SDK)', 
//           content: 'await dropaphi.otp.verify({\n  email: "user@example.com",\n  code: "123456"\n});' 
//         },
//       ]
//     },
//     {
//       id: 'file-storage',
//       title: 'File Storage',
//       icon: <FileText size={20} />,
//       subsections: [
//         { 
//           title: 'Upload File (SDK)', 
//           content: 'const file = await dropaphi.files.upload(fileBlob, "report.pdf");\nconsole.log(file.url);\n\n// Note: When using the SDK or fetch with FormData,\n// the "Content-Type" header is set automatically with the correct boundary.\n// Do NOT set it manually.' 
//         },
//         { 
//           title: 'List Files', 
//           content: 'const files = await dropaphi.files.list({ page: 1, limit: 50 });' 
//         },
//         { 
//           title: 'File Details', 
//           content: 'GET /v1/files/[fileId]\n\nReturns file metadata and access URLs. Private files require the X-API-Key header.' 
//         },
//       ]
//     },
//     {
//       id: 'agent-guide',
//       title: 'AI Agent Guide',
//       icon: <Bot size={20} />,
//       subsections: [
//         { 
//           title: 'Integration Tips', 
//           content: 'This API is optimized for AI agents.\n\n1. Error Handling: Always check for "details.nextAttemptIn" on 429 errors.\n2. Visibility: Use "PRIVATE" for any files containing user data.\n3. Content: Prefer sending HTML emails for better engagement.' 
//         }
//       ]
//     }
//   ];

//   if (!isInitialized || isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC143C]"></div>
//       </div>
//     );
//   }

//   return (
//     <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
//       {/* Navigation */}
//       <nav className="border-b sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-md" style={{ borderColor: '#E5E5E5' }}>
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <Link href="/" className="flex items-center gap-2">
//               <div className="flex h-8 w-8 items-center justify-center rounded font-bold text-white text-sm bg-[#DC143C]">
//                 D
//               </div>
//               <span className="font-bold text-lg text-[#1A1A1A] hidden md:inline">DropAPHI Docs</span>
//             </Link>
//             <div className="flex items-center gap-4">
//               <button 
//                 className="lg:hidden p-2 text-gray-600 hover:text-[#DC143C]"
//                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               >
//                 {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//               </button>
//               {!user ? (
//                 <>
//                   <Link href="/auth/login">
//                     <Button variant="ghost" className="text-sm">Sign In</Button>
//                   </Link>
//                   <Link href="/auth/signup">
//                     <Button className="text-sm bg-[#DC143C] hover:bg-[#B21031]">Get Started</Button>
//                   </Link>
//                 </>
//               ) : (
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-600 hidden sm:inline">{user.email}</span>
//                   <Link href="/dashboard">
//                     <Button variant="outline" className="text-sm">Dashboard</Button>
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </nav>

//       {!user ? (
//         /* Logged Out View */
//         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4">
//           <div className="bg-white p-10 rounded-2xl border border-[#E5E5E5] shadow-sm max-w-md w-full text-center">
//             <div className="w-16 h-16 bg-[#FFF5F5] rounded-full flex items-center justify-center mx-auto mb-6">
//               <Lock className="text-[#DC143C]" size={32} />
//             </div>
//             <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">Documentation Locked</h1>
//             <p className="text-gray-600 mb-8">Please log in to view the API documentation, access your API keys, and start integrating.</p>
//             <div className="space-y-3">
//               <Link href="/auth/login" className="block">
//                 <Button className="w-full bg-[#1A1A1A] hover:bg-black py-6 text-lg">Login to See Docs</Button>
//               </Link>
//               <Link href="/auth/signup" className="block">
//                 <Button variant="outline" className="w-full py-6">Create Free Account</Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       ) : (
//         /* Logged In View */
//         <div className="flex max-w-7xl mx-auto relative">
//           {/* Sidebar */}
//           <aside className={`
//             ${isMobileMenuOpen ? 'fixed inset-0 z-40 bg-white pt-24' : 'hidden lg:block'} 
//             w-full lg:w-72 border-r h-[calc(100vh-65px)] p-8 sticky top-[65px] overflow-y-auto
//           `} style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
//             <div className="flex flex-col h-full">
//               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Contents</h3>
//               <nav className="space-y-1 flex-1">
//                 {docSections.map((section) => (
//                   <button
//                     key={section.id}
//                     onClick={() => {
//                       setExpandedSection(section.id);
//                       setIsMobileMenuOpen(false);
//                       const element = document.getElementById(section.id);
//                       if (element) {
//                         const offset = 100;
//                         const bodyRect = document.body.getBoundingClientRect().top;
//                         const elementRect = element.getBoundingClientRect().top;
//                         const elementPosition = elementRect - bodyRect;
//                         const offsetPosition = elementPosition - offset;
//                         window.scrollTo({
//                           top: offsetPosition,
//                           behavior: 'smooth'
//                         });
//                       }
//                     }}
//                     className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group"
//                     style={{
//                       color: expandedSection === section.id ? '#DC143C' : '#4B5563',
//                       backgroundColor: expandedSection === section.id ? '#FFF5F5' : 'transparent'
//                     }}
//                   >
//                     <span className={expandedSection === section.id ? 'text-[#DC143C]' : 'text-gray-400 group-hover:text-gray-600'}>
//                       {section.icon}
//                     </span>
//                     {section.title}
//                   </button>
//                 ))}
//               </nav>

//               <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
//                 <Link href="/docs/email-builder">
//                   <Button variant="ghost" className="w-full flex items-center justify-start gap-3 text-gray-600 hover:text-[#DC143C] hover:bg-[#FFF5F5]">
//                     <Mail size={18} />
//                     <span>Email Builder</span>
//                     <ExternalLink size={14} className="ml-auto opacity-50" />
//                   </Button>
//                 </Link>
//                 <Link href="/docs/dropid">
//                   <Button variant="ghost" className="w-full flex items-center justify-start gap-3 text-gray-600 hover:text-[#DC143C] hover:bg-[#FFF5F5]">
//                     <UserCheck size={18} />
//                     <span>DropID Docs</span>
//                     <ExternalLink size={14} className="ml-auto opacity-50" />
//                   </Button>
//                 </Link>
//               </div>

//               <div className="mt-10 pt-10 border-t border-gray-100">
//                 <Button 
//                   onClick={copyToClipboard}
//                   variant="outline" 
//                   className="w-full flex items-center justify-center gap-2 py-6 border-dashed"
//                 >
//                   {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
//                   {copied ? 'Copied!' : 'Copy Full Doc'}
//                 </Button>
//                 <p className="text-[10px] text-gray-400 mt-2 text-center uppercase tracking-tighter">Copy for your AI Agent</p>
//               </div>
//             </div>
//           </aside>

//           {/* Main Content */}
//           <div className="flex-1 px-4 py-8 sm:px-8 lg:px-12 max-w-4xl">
//             <header className="mb-12">
//               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF5F5] text-[#DC143C] text-xs font-bold mb-4 uppercase tracking-wider">
//                 <ShieldCheck size={14} /> v1.2 Production Ready
//               </div>
//               <h1 className="text-4xl font-extrabold text-[#1A1A1A] mb-4">API Reference</h1>
//               <p className="text-xl text-gray-600 leading-relaxed">Everything you need to integrate DropAphi into your application or AI agent.</p>
//             </header>

//             <div className="space-y-12">
//               {docSections.map((section) => (
//                 <section key={section.id} id={section.id} className="scroll-mt-24">
//                   <div className="flex items-center justify-between mb-6">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-center text-[#DC143C] shadow-sm">
//                         {section.icon}
//                       </div>
//                       <h2 className="text-2xl font-bold text-[#1A1A1A]">{section.title}</h2>
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => copySection(section)}
//                       className="flex items-center gap-2 text-gray-400 hover:text-[#DC143C] transition-colors"
//                     >
//                       {copiedSection === section.id ? (
//                         <>
//                           <Check size={16} className="text-green-500" />
//                           <span className="text-xs font-bold text-green-500">Copied</span>
//                         </>
//                       ) : (
//                         <>
//                           <Copy size={16} />
//                           <span className="text-xs font-bold">Copy Section</span>
//                         </>
//                       )}
//                     </Button>
//                   </div>

//                   <div className="space-y-6">
//                     {section.subsections.map((sub, idx) => (
//                       <div key={idx} className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//                         <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
//                           <h3 className="font-bold text-[#1A1A1A]">{sub.title}</h3>
//                         </div>
//                         <div className="p-6">
//                           <pre className="text-sm font-mono text-[#334155] whitespace-pre-wrap bg-[#f8fafc] p-4 rounded-xl border border-[#f1f5f9]">
//                             {sub.content}
//                           </pre>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </section>
//               ))}
//             </div>

//             {/* Footer CTA */}
//             <div className="mt-20 p-10 rounded-3xl bg-[#1A1A1A] text-center overflow-hidden relative">
//               <div className="absolute top-0 right-0 w-64 h-64 bg-[#DC143C] opacity-10 rounded-full -mr-32 -mt-32"></div>
//               <h2 className="text-3xl font-bold text-white mb-4">Ready to build?</h2>
//               <p className="text-gray-400 mb-8 max-w-md mx-auto">Join thousands of developers building the future of communication.</p>
//               <Link href="/dashboard">
//                 <Button size="lg" className="bg-[#DC143C] hover:bg-[#B21031] px-10 py-6 text-lg rounded-xl">Go to Dashboard</Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }














'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, Copy, Check, Lock, BookOpen, Send, ShieldCheck, 
  FileText, Bot, Menu, X, ExternalLink, Mail, UserCheck, Link2, 
  Code2, Key, Newspaper, FolderOpen, MailCheck, Users, Upload,
  Eye, EyeOff, CopyCheck, FileCode, MessageSquare, BellRing
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';

export default function DocsPage() {
  const { user, isLoading, isInitialized } = useAuthStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [copiedApiType, setCopiedApiType] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dedicated documentation for each API service
  const apiDocumentation = {
    otp: `# DropAphi OTP API Documentation

## 🔑 Overview
The OTP API provides secure one-time password generation and verification for your applications.

## 📧 Send OTP
\`\`\`javascript
// SDK Method
await dropaphi.otp.send({
  email: "user@example.com",
  brandName: "MyBrand",
  fromName: "My Company",
  fromEmail: "noreply@mycompany.com",
  length: 6,        // Optional, default: 6
  expiry: 10        // Optional, default: 10 minutes
});

// REST API
POST /v1/otp/send
Content-Type: application/json
drop-api-key: da_live_xxx

{
  "email": "user@example.com",
  "brandName": "MyBrand",
  "fromName": "My Company",
  "fromEmail": "noreply@mycompany.com",
  "length": 6,
  "expiry": 10
}
\`\`\`

## 🔄 Resend OTP
\`\`\`javascript
// SDK Method
await dropaphi.otp.resend({
  email: "user@example.com",
  reason: "expired" // or "not_received" or "new_request"
});

// REST API
POST /v1/otp/resend
{
  "email": "user@example.com",
  "reason": "expired"
}
\`\`\`

## ✅ Verify OTP
\`\`\`javascript
// SDK Method
const result = await dropaphi.otp.verify({
  email: "user@example.com",
  code: "123456"
});

// REST API
POST /v1/otp/verify
{
  "email": "user@example.com",
  "code": "123456"
}
\`\`\`

## ⚙️ Configuration Options
- **Rate Limiting**: 60-second cooldown per recipient
- **Expiry**: Default 10 minutes, configurable
- **Length**: 4-8 digits, default 6
- **Brand Customization**: Brand name, sender name, sender email

## 🤖 Agent Tips
1. Always handle 429 rate limit errors
2. Store OTP in cache with expiry
3. Implement retry logic with backoff
4. Log verification attempts for security`,

    email: `# DropAphi Email API Documentation

## 📧 Overview
Send transactional and marketing emails with tracking and template support.

## ✉️ Send Email
\`\`\`javascript
// SDK Method
await dropaphi.emails.send({
  to: "user@example.com",
  subject: "Welcome to MyApp",
  html: "<h1>Welcome {{name}}!</h1>",
  fromName: "My Company",
  fromEmail: "noreply@mycompany.com",
  cc: ["team@mycompany.com"],
  bcc: ["archive@mycompany.com"],
  attachments: [
    {
      filename: "invoice.pdf",
      url: "https://cdn.dropaphi.com/file_123.pdf"
    }
  ],
  template: "welcome",
  variables: {
    name: "John Doe"
  }
});

// REST API
POST /v1/email/send
{
  "to": "user@example.com",
  "subject": "Welcome to MyApp",
  "html": "<h1>Welcome {{name}}!</h1>",
  "fromName": "My Company",
  "fromEmail": "noreply@mycompany.com",
  "cc": ["team@mycompany.com"],
  "bcc": ["archive@mycompany.com"],
  "attachments": [
    {
      "filename": "invoice.pdf",
      "url": "https://cdn.dropaphi.com/file_123.pdf"
    }
  ],
  "template": "welcome",
  "variables": {
    "name": "John Doe"
  }
}
\`\`\`

## 📋 Get Templates
\`\`\`javascript
// SDK Method
const templates = await dropaphi.emails.getTemplates();

// REST API
GET /v1/email/templates
\`\`\`

## 📊 Email Status
\`\`\`javascript
// SDK Method
const status = await dropaphi.emails.getStatus("email_123");

// REST API
GET /v1/email/email_123
\`\`\`

## 📎 Attachments
- **URL Method** (Recommended): Upload via Files API first
- **Max Size**: 10MB per attachment
- **Formats**: PDF, Images, Documents

## 🎯 Best Practices
1. Use templates for consistent branding
2. Include unsubscribe links
3. Track opens and clicks
4. Handle bounces gracefully`,

    newsletter: `# DropAphi Newsletter API Documentation

## 📰 Overview
Manage subscribers, send newsletters, and track engagement.

## 📝 Subscribe
\`\`\`javascript
// SDK Method
await dropaphi.newsletter.subscribe({
  email: "subscriber@example.com",
  name: "Jane Doe",
  source: "website",
  templateId: "tmpl_welcome"
});

// REST API
POST /v1/newsletter/subscribe
{
  "email": "subscriber@example.com",
  "name": "Jane Doe",
  "source": "website",
  "templateId": "tmpl_welcome"
}
\`\`\`

## 📊 List Subscribers
\`\`\`javascript
// SDK Method
const subscribers = await dropaphi.newsletter.listSubscribers({
  page: 1,
  limit: 50,
  status: "ACTIVE", // or "UNSUBSCRIBED"
  segment: "newsletter"
});

// REST API
GET /v1/newsletter/subscribers?page=1&limit=50&status=ACTIVE&segment=newsletter
\`\`\`

## 🔄 Unsubscribe
\`\`\`javascript
// SDK Method
await dropaphi.newsletter.unsubscribe("user@example.com");

// Public Endpoint
GET /api/unsubscribe?email=user@example.com&workspace=ws_123
\`\`\`

## 🎨 NewsletterForm (React)
\`\`\`jsx
import { NewsletterForm } from '@dropaphi/react';

<NewsletterForm 
  apiKey="da_live_xxx"
  requireOTP={true}
  className="p-6 border rounded-lg"
  buttonClassName="bg-red-500 text-white hover:bg-red-600"
  onSuccess={(email) => console.log('Subscribed:', email)}
  onError={(error) => console.error('Error:', error)}
/>
\`\`\`

## 📈 Analytics
- **Open Rate**: Track email opens
- **Click Rate**: Track link clicks
- **Unsubscribe Rate**: Monitor churn
- **Bounce Rate**: Clean your list`,

    files: `# DropAphi Files API Documentation

## 📁 Overview
Store, manage, and serve files securely with CDN delivery.

## ⬆️ Upload File
\`\`\`javascript
// SDK Method
const file = await dropaphi.files.upload(
  fileBlob, 
  "report.pdf",
  {
    visibility: "PUBLIC", // or "PRIVATE"
    metadata: {
      category: "reports",
      department: "finance"
    }
  }
);
console.log(file.url);

// Note: Don't set Content-Type manually when using FormData

// REST API
POST /v1/files/upload
Content-Type: multipart/form-data
X-API-Key: da_live_xxx

FormData:
- file: [File data]
- visibility: "PUBLIC" | "PRIVATE"
- metadata: {"category": "reports"}

Max File Size: 10MB
\`\`\`

## 📋 List Files
\`\`\`javascript
// SDK Method
const files = await dropaphi.files.list({
  page: 1,
  limit: 50,
  visibility: "PUBLIC" // or "PRIVATE"
});

// REST API
GET /v1/files?page=1&limit=50&visibility=PUBLIC
\`\`\`

## 🔍 Get File Details
\`\`\`javascript
// SDK Method
const fileDetails = await dropaphi.files.get("file_123");

// REST API
GET /v1/files/file_123
\`\`\`

## 🗑️ Delete File
\`\`\`javascript
// SDK Method
await dropaphi.files.delete("file_123");

// REST API
DELETE /v1/files/file_123
\`\`\`

## 🔒 Security
- **PUBLIC**: Accessible via URL without auth
- **PRIVATE**: Requires API key for access
- **Default**: PRIVATE for security
- **CDN**: Automatic CDN distribution

## 🤖 Agent Tips
1. Use PRIVATE for user data
2. Upload before sending emails
3. Implement cleanup for unused files
4. Cache file URLs for performance`,

    emailBuilder: `# DropAphi Email Builder Documentation

## 🎨 Overview
Create beautiful responsive email templates with our visual builder.

## 🖌️ Design Modes
\`\`\`javascript
// Three modes available:
1. Visual Mode - Drag and drop editor
2. Code Mode - Raw HTML editing
3. Text Mode - Plain text emails

// SDK Integration
await dropaphi.templates.create({
  name: "Welcome Email",
  html: "<h1>Welcome {{name}}!</h1>",
  text: "Welcome {{name}}!",
  variables: ["name", "company"],
  category: "welcome"
});
\`\`\`

## 📦 Template Variables
\`\`\`javascript
// Define variables in templates
{
  "variables": ["name", "email", "company", "link"]
}

// Use in HTML
<h1>Hello {{name}}!</h1>
<p>Welcome to {{company}}</p>

// Use in email sending
{
  "template": "welcome",
  "variables": {
    "name": "John",
    "company": "MyApp",
    "link": "https://example.com/verify"
  }
}
\`\`\`

## 🔄 Save & Use
\`\`\`javascript
// 1. Create template
const template = await dropaphi.templates.create({
  name: "Newsletter",
  html: "...",
  variables: ["name", "content"]
});

// 2. Get template ID
const templateId = template.id;

// 3. Use in email send
await dropaphi.emails.send({
  to: "user@example.com",
  template: templateId,
  variables: {
    name: "John",
    content: "Newsletter content here"
  }
});
\`\`\`

## 🎯 Best Practices
1. Test on multiple email clients
2. Use inline CSS for compatibility
3. Include plain text version
4. Optimize images for email`,

    agent: `# DropAphi AI Agent Integration Guide

## 🤖 Overview
Optimized API design for AI agents and automated systems.

## 🚀 Quick Start
\`\`\`javascript
// Initialize SDK
const dropaphi = new Dropaphi(process.env.DROPAPHI_API_KEY);

// AI Agent Pattern
class DropAphiAgent {
  constructor(apiKey) {
    this.client = new Dropaphi(apiKey);
  }

  async sendEmailWithRetry(data, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.client.emails.send(data);
      } catch (error) {
        if (error.status === 429 && error.details?.nextAttemptIn) {
          await this.sleep(error.details.nextAttemptIn);
          continue;
        }
        throw error;
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
\`\`\`

## 🛠️ Error Handling
\`\`\`javascript
// Standard error response
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "nextAttemptIn": 5000, // milliseconds
      "retryAfter": "2024-01-01T00:00:00Z"
    }
  }
}

// Handle 429 errors
if (error.status === 429) {
  const waitTime = error.details?.nextAttemptIn || 5000;
  await new Promise(resolve => setTimeout(resolve, waitTime));
  // Retry request
}
\`\`\`

## 💡 Integration Tips
\`\`\`javascript
// 1. Batch operations
await Promise.all([
  dropaphi.emails.send(email1),
  dropaphi.emails.send(email2)
]);

// 2. Cache API responses
const cache = new Map();
async function getTemplates() {
  if (!cache.has('templates')) {
    const templates = await dropaphi.emails.getTemplates();
    cache.set('templates', templates);
  }
  return cache.get('templates');
}

// 3. Use environment variables
const config = {
  apiKey: process.env.DROPAPHI_API_KEY,
  defaultFrom: process.env.DEFAULT_FROM_EMAIL
};

// 4. Implement logging
const log = (message) => {
  console.log(\`[DropAphi Agent] \${new Date().toISOString()}: \${message}\`);
};
\`\`\`

## 📊 Monitoring
- Track API usage
- Monitor response times
- Log error rates
- Set up alerts`,

    dropid: `# DropID Documentation

## 👤 Overview
DropID provides decentralized identity management and authentication.

## 🔐 Authentication
\`\`\`javascript
// Initialize DropID
const dropid = new DropID({
  apiKey: "da_live_xxx"
});

// Create identity
const identity = await dropid.create({
  email: "user@example.com",
  name: "John Doe",
  metadata: {
    role: "admin",
    company: "MyApp"
  }
});

// REST API
POST /v1/dropid/create
{
  "email": "user@example.com",
  "name": "John Doe",
  "metadata": {
    "role": "admin"
  }
}
\`\`\`

## 🔑 Verify Identity
\`\`\`javascript
// SDK Method
const isValid = await dropid.verify({
  identityId: "id_123",
  challenge: "signed_message"
});

// REST API
POST /v1/dropid/verify
{
  "identityId": "id_123",
  "challenge": "signed_message"
}
\`\`\`

## 🔄 Update Identity
\`\`\`javascript
// SDK Method
await dropid.update("id_123", {
  name: "Jane Doe",
  metadata: {
    role: "user"
  }
});

// REST API
PUT /v1/dropid/id_123
{
  "name": "Jane Doe",
  "metadata": {
    "role": "user"
  }
}
\`\`\`

## 🗑️ Delete Identity
\`\`\`javascript
// SDK Method
await dropid.delete("id_123");

// REST API
DELETE /v1/dropid/id_123
\`\`\`

## 🛡️ Security Features
- Decentralized identity management
- Cryptographic verification
- Zero-knowledge proofs
- Privacy-first design`,

    webhooks: `# DropAphi Webhooks Documentation

## 🔔 Overview
Real-time event notifications for your application.

## 📡 Webhook Events
\`\`\`javascript
// Email Events
- email.sent
- email.delivered
- email.opened
- email.clicked
- email.bounced
- email.spam

// Newsletter Events
- newsletter.subscribed
- newsletter.unsubscribed

// OTP Events
- otp.sent
- otp.verified

// File Events
- file.uploaded
- file.deleted
\`\`\`

## ⚙️ Configure Webhooks
\`\`\`javascript
// SDK Method
await dropaphi.webhooks.create({
  url: "https://api.example.com/webhooks",
  events: ["email.sent", "email.opened"],
  secret: "webhook_secret_123"
});

// REST API
POST /v1/webhooks
{
  "url": "https://api.example.com/webhooks",
  "events": ["email.sent", "email.opened"],
  "secret": "webhook_secret_123"
}
\`\`\`

## 📨 Webhook Payload
\`\`\`javascript
// Example payload
{
  "id": "evt_123",
  "type": "email.sent",
  "created": "2024-01-01T00:00:00Z",
  "data": {
    "emailId": "email_123",
    "to": "user@example.com",
    "subject": "Welcome",
    "status": "sent"
  }
}
\`\`\`

## 🔒 Security
- Verify webhook signatures
- HTTPS only
- Rate limiting
- IP whitelisting

## 🎯 Best Practices
1. Verify signatures
2. Handle retries
3. Idempotent processing
4. Log webhook events`
  };

  // Full combined documentation
  const fullDocumentation = Object.values(apiDocumentation).join('\n\n---\n\n');

  const copyApiDocumentation = (apiType: string) => {
    const text = apiDocumentation[apiType as keyof typeof apiDocumentation] || '';
    navigator.clipboard.writeText(text);
    setCopiedApiType(apiType);
    setTimeout(() => setCopiedApiType(null), 2000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copySection = (section: any) => {
    const text = `# ${section.title}\n\n${section.subsections.map((sub: any) => {
      const formattedContent = sub.content.includes('```') 
        ? sub.content 
        : `\`\`\`\n${sub.content}\n\`\`\``;
      return `### ${sub.title}\n${formattedContent}`;
    }).join('\n\n')}`;
    copyToClipboard(text, section.id);
  };

  const docSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <BookOpen size={20} />,
      apiCopyId: 'full',
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
      apiCopyId: 'email',
      subsections: [
        { 
          title: 'Send Email (SDK)', 
          content: 'await dropaphi.emails.send({\n  to: "user@example.com",\n  subject: "Hello",\n  html: "<h1>Welcome</h1>",\n  attachments: [\n    {\n      "filename": "invoice.pdf",\n      "url": "https://cdn.dropaphi.com/file_123.pdf"\n    }\n  ]\n});' 
        },
        { 
          title: 'Send Email (URL)', 
          content: 'POST /v1/email/send\n\nBody:\n{\n  "to": "user@example.com",\n  "subject": "Hello",\n  "html": "<h1>Welcome</h1>",\n  "attachments": [\n    {\n      "filename": "invoice.pdf",\n      "url": "https://cdn.dropaphi.com/file_123.pdf"\n    }\n  ]\n}' 
        },
        { 
          title: 'Get Templates', 
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
      icon: <Newspaper size={20} />,
      apiCopyId: 'newsletter',
      subsections: [
        { 
          title: 'Subscribe (SDK)', 
          content: 'await dropaphi.newsletter.subscribe({\n  email: "subscriber@example.com",\n  name: "Jane Doe"\n});' 
        },
        { 
          title: 'Subscribe (URL)', 
          content: 'POST /v1/newsletter/subscribe\n\nBody:\n{\n  "email": "subscriber@example.com",\n  "name": "Jane Doe"\n}' 
        },
        { 
          title: 'List Subscribers', 
          content: 'GET /v1/newsletter/subscribers\n\nQuery Parameters:\n- page: Page number (default: 1)\n- limit: Results per page (default: 50, max: 100)\n- status: Filter by status (ACTIVE, UNSUBSCRIBED)\n- segment: Filter by segment name' 
        },
        { 
          title: 'NewsletterForm (React)', 
          content: 'Drop-in a customizable form with OTP verification support.\n\n<NewsletterForm \n  apiKey="da_live_xxx" \n  requireOTP={true}\n  className="p-4 border rounded"\n  buttonClassName="bg-red-500 text-white"\n/>' 
        },
      ]
    },
    {
      id: 'otp-api',
      title: 'OTP API',
      icon: <ShieldCheck size={20} />,
      apiCopyId: 'otp',
      subsections: [
        { 
          title: 'Send OTP (SDK)', 
          content: 'await dropaphi.otp.send({\n  email: "user@example.com",\n  brandName: "MyBrand"\n});' 
        },
        { 
          title: 'Send OTP (URL)', 
          content: 'POST /v1/otp/send\n\nBody:\n{\n  "email": "user@example.com",\n  "brandName": "MyBrand"\n}' 
        },
        { 
          title: 'Verify OTP (SDK)', 
          content: 'await dropaphi.otp.verify({\n  email: "user@example.com",\n  code: "123456"\n});' 
        },
        { 
          title: 'Verify OTP (URL)', 
          content: 'POST /v1/otp/verify\n\nBody:\n{\n  "email": "user@example.com",\n  "code": "123456"\n}' 
        },
        { 
          title: 'Resend OTP', 
          content: 'POST /v1/otp/resend\n\nBody:\n{\n  "email": "user@example.com",\n  "reason": "expired|not_received|new_request"\n}' 
        },
      ]
    },
    {
      id: 'file-storage',
      title: 'File Storage',
      icon: <FolderOpen size={20} />,
      apiCopyId: 'files',
      subsections: [
        { 
          title: 'Upload File (SDK)', 
          content: 'const file = await dropaphi.files.upload(fileBlob, "report.pdf");\nconsole.log(file.url);\n\n// Note: When using the SDK or fetch with FormData,\n// the "Content-Type" header is set automatically with the correct boundary.\n// Do NOT set it manually.' 
        },
        { 
          title: 'Upload File (URL)', 
          content: 'POST /v1/files/upload (Multipart)\n\nMax: 10MB\n\nFormData:\n- file: [File data]\n- visibility: "PUBLIC" | "PRIVATE"' 
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
      id: 'email-builder',
      title: 'Email Builder',
      icon: <Mail size={20} />,
      apiCopyId: 'emailBuilder',
      subsections: [
        { 
          title: 'Design Templates', 
          content: 'Create and manage responsive email templates using our visual builder. Access the dedicated documentation for detailed guides on modes, variables, and API integration.\n\n[View Email Builder Docs](/docs/email-builder)' 
        },
      ]
    },
    {
      id: 'dropid',
      title: 'DropID',
      icon: <UserCheck size={20} />,
      apiCopyId: 'dropid',
      subsections: [
        { 
          title: 'Create Identity', 
          content: 'const identity = await dropid.create({\n  email: "user@example.com",\n  name: "John Doe"\n});' 
        },
        { 
          title: 'Verify Identity', 
          content: 'const isValid = await dropid.verify({\n  identityId: "id_123",\n  challenge: "signed_message"\n});' 
        },
      ]
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      icon: <BellRing size={20} />,
      apiCopyId: 'webhooks',
      subsections: [
        { 
          title: 'Configure Webhooks', 
          content: 'await dropaphi.webhooks.create({\n  url: "https://api.example.com/webhooks",\n  events: ["email.sent", "email.opened"],\n  secret: "webhook_secret_123"\n});' 
        },
        { 
          title: 'Events', 
          content: 'Available webhook events:\n\nEmail: email.sent, email.delivered, email.opened, email.clicked\nNewsletter: newsletter.subscribed, newsletter.unsubscribed\nOTP: otp.sent, otp.verified\nFiles: file.uploaded, file.deleted' 
        },
      ]
    },
    {
      id: 'agent-guide',
      title: 'AI Agent Guide',
      icon: <Bot size={20} />,
      apiCopyId: 'agent',
      subsections: [
        { 
          title: 'Integration Tips', 
          content: 'This API is optimized for AI agents.\n\n1. Error Handling: Always check for "details.nextAttemptIn" on 429 errors.\n2. Visibility: Use "PRIVATE" for any files containing user data.\n3. Content: Prefer sending HTML emails for better engagement.' 
        }
      ]
    }
  ];

  // Map API copy IDs to icons
  const apiIcons = {
    otp: <Key size={16} />,
    email: <MailCheck size={16} />,
    newsletter: <Newspaper size={16} />,
    files: <FolderOpen size={16} />,
    emailBuilder: <FileCode size={16} />,
    dropid: <UserCheck size={16} />,
    webhooks: <BellRing size={16} />,
    agent: <Bot size={16} />,
    full: <Copy size={16} />
  };

  const apiLabels = {
    otp: 'OTP API',
    email: 'Email API',
    newsletter: 'Newsletter API',
    files: 'Files API',
    emailBuilder: 'Email Builder',
    dropid: 'DropID',
    webhooks: 'Webhooks',
    agent: 'Agent Guide',
    full: 'Full Docs'
  };

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
              <span className="font-bold text-lg text-[#1A1A1A] hidden md:inline">DropAPHI Docs</span>
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
        <div className="flex max-w-7xl mx-auto relative">
          {/* Sidebar */}
          <aside className={`
            ${isMobileMenuOpen ? 'fixed inset-0 z-40 bg-white pt-24' : 'hidden lg:block'} 
            w-full lg:w-80 border-r h-[calc(100vh-65px)] p-6 sticky top-[65px] overflow-y-auto
          `} style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
            <div className="flex flex-col h-full">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contents</h3>
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

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">Quick Copy</p>
                {['otp', 'email', 'newsletter', 'files', 'emailBuilder', 'dropid', 'webhooks', 'agent', 'full'].map((apiId) => (
                  <Button
                    key={apiId}
                    onClick={() => copyApiDocumentation(apiId)}
                    variant="ghost"
                    size="sm"
                    className="w-full flex items-center justify-between gap-2 text-xs hover:bg-[#FFF5F5] hover:text-[#DC143C] transition-all px-3 py-2 h-auto"
                  >
                    <span className="flex items-center gap-2">
                      {apiIcons[apiId as keyof typeof apiIcons]}
                      <span>{apiLabels[apiId as keyof typeof apiLabels]}</span>
                    </span>
                    {copiedApiType === apiId ? (
                      <Check size={14} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <Copy size={14} className="text-gray-400 flex-shrink-0" />
                    )}
                  </Button>
                ))}
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
              
              <div className="flex flex-wrap gap-2 mt-6">
                {['otp', 'email', 'newsletter', 'files', 'emailBuilder', 'dropid', 'webhooks', 'agent', 'full'].map((apiId) => (
                  <Button
                    key={apiId}
                    onClick={() => copyApiDocumentation(apiId)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-dashed hover:border-[#DC143C] hover:text-[#DC143C] hover:bg-[#FFF5F5] transition-all text-xs"
                  >
                    {copiedApiType === apiId ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      apiIcons[apiId as keyof typeof apiIcons]
                    )}
                    {copiedApiType === apiId ? 'Copied!' : apiLabels[apiId as keyof typeof apiLabels]}
                  </Button>
                ))}
              </div>
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copySection(section)}
                        className="flex items-center gap-1 text-gray-400 hover:text-[#DC143C] transition-colors text-xs"
                      >
                        {copiedSection === section.id ? (
                          <>
                            <Check size={14} className="text-green-500" />
                            <span className="text-green-500 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Section</span>
                          </>
                        )}
                      </Button>
                      {section.apiCopyId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyApiDocumentation(section.apiCopyId!)}
                          className="flex items-center gap-1 text-gray-400 hover:text-[#DC143C] transition-colors text-xs"
                        >
                          {copiedApiType === section.apiCopyId ? (
                            <>
                              <Check size={14} className="text-green-500" />
                              <span className="text-green-500 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              {apiIcons[section.apiCopyId as keyof typeof apiIcons] || <Copy size={14} />}
                              <span>API</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {section.subsections.map((sub, idx) => (
                      <div key={idx} className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                          <h3 className="font-bold text-[#1A1A1A] text-sm">{sub.title}</h3>
                          <div className="flex items-center gap-2">
                            {sub.title.includes('(SDK)') && (
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">SDK</span>
                            )}
                            {sub.title.includes('(URL)') && (
                              <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-medium">REST</span>
                            )}
                          </div>
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