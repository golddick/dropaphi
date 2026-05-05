'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  Copy, 
  Check, 
  FileText, 
  Palette, 
  Code, 
  Type, 
  Layers, 
  Smartphone, 
  ExternalLink,
  Save,
  Send
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';

export default function EmailBuilderDocsPage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const copyIdExample = "tmpl_8291dk";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');
        
        .docs-container { font-family: 'Plus Jakarta Sans', sans-serif; }
        .docs-title { font-family: 'Bricolage Grotesque', sans-serif; }
        .docs-mono { font-family: 'DM Mono', monospace; }
        
        .prose h1 { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 1.5rem; }
        .prose h2 { font-size: 1.8rem; font-weight: 700; letter-spacing: -0.02em; margin-top: 3rem; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
        .prose h3 { font-size: 1.3rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; }
        .prose p { color: #444; line-height: 1.7; margin-bottom: 1.25rem; }
        .prose ul { margin-bottom: 1.25rem; list-style-type: none; padding-left: 0; }
        .prose li { position: relative; padding-left: 1.5rem; margin-bottom: 0.5rem; color: #444; }
        .prose li::before { content: '→'; position: absolute; left: 0; color: #DC143C; }
        
        .code-block { background: #0A0A0A; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; position: relative; overflow-x: auto; }
        .code-block pre { margin: 0; color: #E0E0E0; font-size: 0.875rem; }
        
        .feature-card { border: 1px solid #EBEBEB; border-radius: 16px; padding: 1.5rem; transition: all 0.2s; }
        .feature-card:hover { border-color: #DC143C; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
      `}</style>

      {/* Navigation - simplified version of your site nav */}
      <nav className="border-b border-gray-100 py-4 px-6 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#DC143C] rounded-lg flex items-center justify-center">
            <Send size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight docs-title">DropAphi</span>
        </Link>
        <div className="flex gap-4">
          <Link href="/docs">
            <Button variant="ghost" size="sm">Back to API Docs</Button>
          </Link>
          <Link href={user ? `/dashboard` : "/auth/login"}>
            <Button size="sm" className="bg-[#DC143C] hover:bg-[#B01030]">
              {user ? 'Dashboard' : 'Sign In'}
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 docs-container">
        <div className="prose">
          <h1 className="docs-title">Email Builder & Templates</h1>
          <p className="text-lg text-gray-600">
            Design professional, responsive emails without writing a single line of CSS. Save your designs as templates and trigger them via our API.
          </p>

          <div className="grid md:grid-cols-2 gap-6 my-10">
            <div className="feature-card">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
                <Palette size={20} />
              </div>
              <h3 className="mt-0">Visual Designer</h3>
              <p className="text-sm mb-0">Drag and drop components like buttons, social icons, and images. Real-time preview across mobile and desktop.</p>
            </div>
            <div className="feature-card">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mb-4 text-purple-600">
                <Code size={20} />
              </div>
              <h3 className="mt-0">Code Mode</h3>
              <p className="text-sm mb-0">Direct HTML/CSS editing for developers. We handle the complex table nesting required for email client compatibility.</p>
            </div>
          </div>

          <h2>Getting Started</h2>
          <p>
            Access the Email Builder from your workspace dashboard under <strong>Email {'>'} Builder</strong>. 
            From here you can create new designs or manage existing templates.
          </p>

          <h3>1. Choosing a Mode</h3>
          <ul>
            <li><strong>Visual:</strong> Best for marketing teams and quick designs.</li>
            <li><strong>Code:</strong> Best for developers who need full control over the layout.</li>
            <li><strong>Text:</strong> Best for transactional notifications where high deliverability is priority.</li>
          </ul>

          <h3>2. Using Dynamic Variables</h3>
          <p>
            Personalize your emails by inserting variables. Use the double-curly brace syntax:
          </p>
          <div className="code-block">
            <pre className="docs-mono">
{`Hello {{name}},
Welcome to {{workspaceName}}! 
Your registered email is {{email}}.`}
            </pre>
          </div>

          <h3>3. Saving as Template</h3>
          <p>
            Once you're happy with your design, click <strong>Save as Template</strong>. 
            Each template is assigned a unique ID (e.g., <code className="text-[#DC143C]">{copyIdExample}</code>).
          </p>

          <h2>API Integration</h2>
          <p>
            The primary advantage of the Email Builder is the ability to trigger these designs programmatically.
          </p>

          <h3>Triggering a Template</h3>
          <p>
            Pass the <code className="bg-gray-100 px-1 rounded">templateId</code> in your API requests to the Newsletter or Email endpoints.
          </p>

          <div className="code-block group">
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => copyToClipboard('POST /v1/newsletter/subscribe\n{\n  "email": "user@example.com",\n  "templateId": "' + copyIdExample + '"\n}')}
                className="text-gray-400 hover:text-white"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <pre className="docs-mono">
{`// POST /v1/newsletter/subscribe
{
  "email": "subscriber@example.com",
  "name": "Jane Doe",
  "templateId": "${copyIdExample}"
}`}
            </pre>
          </div>

          <h2>Social Icons Configuration</h2>
          <p>
            Our social icon component supports all major platforms. You can customize the icon size, colors, and layout (icons only or labeled buttons).
          </p>
          <ul>
            <li><strong>Style:</strong> Choose between minimalist icons or prominent buttons.</li>
            <li><strong>Alignment:</strong> Left, Center, or Right.</li>
            <li><strong>Colors:</strong> Use brand default colors or pick your own to match your email theme.</li>
          </ul>

          <div className="mt-16 p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
            <Layers className="mx-auto mb-4 text-gray-400" size={32} />
            <h3 className="mt-0">Ready to build?</h3>
            <p className="max-w-md mx-auto">Open the builder in your dashboard to start designing your first template.</p>
            <Link href="/dashboard">
              <Button className="mt-4 bg-black hover:bg-gray-800 text-white px-8">
                Open Email Builder
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-12 px-6 mt-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-gray-500">
            © 2026 DropAphi. Built for developers.
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <Link href="/docs" className="hover:text-[#DC143C]">API Reference</Link>
            <Link href="/blog" className="hover:text-[#DC143C]">Blog</Link>
            <Link href="https://twitter.com/dropaphi" className="hover:text-[#DC143C]">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
