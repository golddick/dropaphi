'use client';

import { useState } from 'react';
import { Check, Copy, FileText, Mail, ShieldCheck, Sparkles } from 'lucide-react';

type EndpointDoc = {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  title: string;
  summary: string;
  auth: boolean;
  requestBody?: Record<string, unknown> | string;
  responseExample?: Record<string, unknown>;
  notes?: string[];
};

type CategoryDoc = {
  title: string;
  description: string;
  icon: typeof Mail;
  endpoints: EndpointDoc[];
};

const categories: CategoryDoc[] = [
  {
    title: 'Email',
    description: 'Send transactional and marketing emails, inspect templates, and check delivery status.',
    icon: Mail,
    endpoints: [
      {
        id: 'email-send',
        method: 'POST',
        path: '/v1/email/send',
        title: 'Send email',
        summary: 'Send one or many emails with HTML, text, templates, attachments, and tracking.',
        auth: true,
        requestBody: {
          to: 'recipient@example.com',
          subject: 'Welcome to DropAphi',
          html: '<h1>Hello there</h1>',
          text: 'Hello there',
          template: 'welcome',
          templateData: { name: 'Ada' },
          fromName: 'DropAphi',
          tracking: { opens: true, clicks: true }
        },
        responseExample: {
          success: true,
          data: {
            id: 'eml_123',
            status: 'PENDING',
            message: 'Email queued successfully'
          }
        },
        notes: ['Each recipient counts as one email unit.', 'You can pass cc, bcc, attachments, and custom headers.']
      },
      {
        id: 'email-templates',
        method: 'GET',
        path: '/v1/email/templates',
        title: 'List templates',
        summary: 'Fetch the built-in templates and the variables each template supports.',
        auth: true,
        responseExample: {
          success: true,
          data: {
            templates: [
              { id: 'welcome', name: 'Welcome', variables: ['name', 'company', 'actionUrl'] }
            ]
          }
        }
      },
      {
        id: 'email-status',
        method: 'GET',
        path: '/v1/email/{id}',
        title: 'Get email status',
        summary: 'Retrieve delivery details, timestamps, and engagement counts for a sent email.',
        auth: true,
        responseExample: {
          success: true,
          data: {
            id: 'eml_123',
            status: 'DELIVERED',
            deliveredAt: '2026-07-11T10:00:00.000Z',
            openCount: 2,
            clickCount: 1
          }
        }
      }
    ]
  },
  {
    title: 'Newsletter',
    description: 'Subscribe contacts, view subscriber lists, and trigger welcome emails.',
    icon: Sparkles,
    endpoints: [
      {
        id: 'newsletter-subscribe',
        method: 'POST',
        path: '/v1/newsletter/subscribe',
        title: 'Subscribe contact',
        summary: 'Create or reactivate a subscribed contact and optionally send a welcome email.',
        auth: true,
        requestBody: {
          email: 'subscriber@example.com',
          name: 'Jane Doe',
          source: 'landing_page',
          templateId: 'tmpl_123'
        },
        responseExample: {
          success: true,
          message: 'Subscription created',
          subscriber: {
            id: 'sub_123',
            email: 'subscriber@example.com',
            status: 'ACTIVE'
          }
        },
        notes: ['Existing unsubscribed contacts are reactivated automatically.', 'Each subscription consumes one subscriber unit.']
      },
      {
        id: 'newsletter-subscribers',
        method: 'GET',
        path: '/v1/newsletter/subscribers',
        title: 'List subscribers',
        summary: 'Paginate through subscribers and filter by status or segment.',
        auth: true,
        responseExample: {
          success: true,
          data: {
            subscribers: [
              { id: 'sub_123', email: 'subscriber@example.com', status: 'ACTIVE' }
            ],
            pagination: { page: 1, limit: 50, total: 1, pages: 1 }
          }
        }
      }
    ]
  },
  {
    title: 'OTP',
    description: 'Create one-time passcodes, verify them, and resend codes with rate limiting protection.',
    icon: ShieldCheck,
    endpoints: [
      {
        id: 'otp-send',
        method: 'POST',
        path: '/v1/otp/send',
        title: 'Send OTP',
        summary: 'Generate and send a verification code to a recipient email address.',
        auth: true,
        requestBody: {
          email: 'user@example.com',
          length: 6,
          expiry: 10,
          brandName: 'DropAphi'
        },
        responseExample: {
          success: true,
          data: {
            id: 'otp_123',
            message: 'OTP sent successfully to user@example.com',
            expiresAt: '2026-07-11T10:10:00.000Z'
          }
        },
        notes: ['The API blocks repeat requests within 60 seconds for the same email.', 'A pending OTP can only be verified while it is still valid.']
      },
      {
        id: 'otp-verify',
        method: 'POST',
        path: '/v1/otp/verify',
        title: 'Verify OTP',
        summary: 'Verify a submitted code against the latest pending OTP for the recipient.',
        auth: true,
        requestBody: {
          email: 'user@example.com',
          code: '123456'
        },
        responseExample: {
          success: true,
          data: {
            verified: true,
            message: 'OTP verified successfully',
            id: 'otp_123'
          }
        }
      },
      {
        id: 'otp-resend',
        method: 'POST',
        path: '/v1/otp/resend',
        title: 'Resend OTP',
        summary: 'Invalidate the previous pending OTP and send a fresh verification code.',
        auth: true,
        requestBody: {
          email: 'user@example.com',
          reason: 'not_received',
          length: 6,
          expiry: 10
        },
        responseExample: {
          success: true,
          data: {
            id: 'otp_456',
            message: 'New verification code sent to user@example.com',
            regenerated: true
          }
        }
      }
    ]
  },
  {
    title: 'Files',
    description: 'Upload files, list workspace assets, and fetch metadata for private or public files.',
    icon: FileText,
    endpoints: [
      {
        id: 'files-upload',
        method: 'POST',
        path: '/v1/files/upload',
        title: 'Upload file',
        summary: 'Upload a file as multipart form data and store it with metadata.',
        auth: true,
        requestBody: 'multipart/form-data with a file field and optional metadata JSON',
        responseExample: {
          success: true,
          data: {
            id: 'fil_123',
            name: 'invoice.pdf',
            size: 2.4,
            mimeType: 'application/pdf',
            url: 'https://dropaphi.xyz/api/files/fil_123'
          }
        },
        notes: ['The upload route accepts a file field named file.', 'Metadata can include folder, visibility, tags, and description.']
      },
      {
        id: 'files-list',
        method: 'GET',
        path: '/v1/files',
        title: 'List files',
        summary: 'List files in the current workspace with pagination and folder filtering.',
        auth: true,
        responseExample: {
          success: true,
          data: {
            files: [
              { id: 'fil_123', originalName: 'invoice.pdf', visibility: 'PUBLIC' }
            ],
            pagination: { page: 1, limit: 50, total: 1, pages: 1 }
          }
        }
      },
      {
        id: 'files-details',
        method: 'GET',
        path: '/v1/files/{fileId}',
        title: 'Get file details',
        summary: 'Fetch the metadata and access URL for a specific file.',
        auth: true,
        responseExample: {
          success: true,
          data: {
            id: 'fil_123',
            name: 'invoice.pdf',
            mimeType: 'application/pdf',
            visibility: 'PRIVATE',
            size: 2457600
          }
        }
      }
    ]
  }
];

const baseUrl = 'https://dropaphi.xyz/api';

function buildSnippet(endpoint: EndpointDoc) {
  const headerLines = [
    `curl -X ${endpoint.method} \"${baseUrl}${endpoint.path}\" \\\n  -H \"DROP-API-Key: da_live_your_key\"` 
  ];

  if (endpoint.method === 'POST' && endpoint.requestBody) {
    const body = typeof endpoint.requestBody === 'string'
      ? endpoint.requestBody
      : JSON.stringify(endpoint.requestBody, null, 2);

    const escapedBody = body.replace(/'/g, "\\'").replace(/\n/g, '\\n');
    return `${headerLines[0]} \\\n  -H \"Content-Type: application/json\" \\\n  -d '${escapedBody}'`;
  }

  return headerLines[0];
}

export function V1ApiDocs() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copySnippet = async (endpoint: EndpointDoc) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    const snippet = buildSnippet(endpoint);
    await navigator.clipboard.writeText(snippet);
    setCopiedId(endpoint.id);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">DropAphi v1 API</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Developer reference for email, newsletter, OTP, and files</h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              These endpoints are documented from the live route implementations in the app. Each card includes an example request, a response shape, and a one-click copy action for the snippet.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Authentication</div>
            <div>Include your API key in the DROP-API-Key header.</div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <section key={category.title} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-border/70 bg-muted/40 p-2">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{category.title}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>

              <div className="grid gap-4">
                {category.endpoints.map((endpoint) => (
                  <article key={endpoint.id} className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            {endpoint.method}
                          </span>
                          <span className="text-sm font-medium text-foreground">{endpoint.path}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{endpoint.title}</h3>
                          <p className="mt-1 text-sm leading-7 text-muted-foreground">{endpoint.summary}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="rounded-full border border-border/70 px-2.5 py-1 text-muted-foreground">
                            {endpoint.auth ? 'Requires X-API-Key' : 'No auth required'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => copySnippet(endpoint)}
                        className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm font-medium transition hover:bg-muted"
                      >
                        {copiedId === endpoint.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedId === endpoint.id ? 'Copied' : 'Copy sample'}
                      </button>
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-foreground">Sample request</div>
                        <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/40 p-4 text-sm leading-6 text-foreground">
{typeof endpoint.requestBody === 'string'
  ? endpoint.requestBody
  : JSON.stringify(endpoint.requestBody ?? {}, null, 2)}
                        </pre>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-foreground">Expected response</div>
                        <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/40 p-4 text-sm leading-6 text-foreground">
{JSON.stringify(endpoint.responseExample ?? {}, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {endpoint.notes && endpoint.notes.length > 0 ? (
                      <ul className="mt-5 list-disc space-y-2 pl-6 text-sm leading-7 text-muted-foreground">
                        {endpoint.notes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
