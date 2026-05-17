// app/contact/page.tsx (Updated)
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '../logo/logo';
import { toast } from 'sonner';
import { useComplaintStore } from '@/lib/stores/complaint/complaint.store';

type Tab = 'contact' | 'complaint';

type FormState = {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
};

const complaintCategories = [
  'Billing / Subscription',
  'API Issue',
  'Documentation Error',
  'Performance / Downtime',
  'Security Concern',
  'Other',
];

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<Tab>('contact');
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const { contactInfo, fetchContactInfo, createComplaint } = useComplaintStore();

  useEffect(() => {
    fetchContactInfo();
  }, [fetchContactInfo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      await createComplaint(form);
      setStatus('success');
      setForm({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: '',
      });
    } catch {
      setStatus('error');
      toast.error('Failed to submit complaint');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return '✉';
      case 'DISCORD': return '💬';
      case 'TWITTER': return '𝕏';
      case 'GITHUB': return '🐙';
      default: return '📧';
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <Logo />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Get in touch
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Whether you have a question, a bug to report, or feedback we're listening.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex border-b border-border mt-0">
          {(['contact', 'complaint'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                relative px-6 py-4 text-sm font-semibold capitalize transition-colors
                ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              {tab === 'contact' ? 'Contact Info' : 'File a Complaint'}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Contact Info Panel */}
        {activeTab === 'contact' && (
          <section className="py-12 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((channel) => (
                <a
                  key={channel.id}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-red-600/40 hover:bg-[#13131e]"
                >
                  <span className="mt-0.5 text-2xl select-none">{getIcon(channel.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                      {channel.label}
                    </p>
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-red-500 transition-colors">
                      {channel.value}
                    </p>
                    {channel.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {channel.description}
                      </p>
                    )}
                  </div>
                  <svg
                    className="mt-1 w-4 h-4 text-muted-foreground/40 group-hover:text-red-600 transition-colors shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>

            <div className="mt-10 rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-1">Response times</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Community support via Discord is fastest. Email responses typically land within 48 hours on business days.
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">All systems operational</span>
              </div>
            </div>
          </section>
        )}

        {/* Complaint Form Panel */}
        {activeTab === 'complaint' && (
          <section className="py-12 animate-fade-in">
            {status === 'success' ? (
              <div className="rounded-xl border border-green-900/50 bg-green-950/20 p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold mb-2">Complaint received</h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  We've logged your complaint and will follow up at the email address you provided within 48 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-sm text-red-500 hover:text-red-400 transition-colors underline underline-offset-2"
                >
                  Submit another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Full name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Jane Smith"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/30 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="jane@example.com"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/30 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/30 transition-all"
                  >
                    <option value="" disabled>Select a category…</option>
                    {complaintCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    placeholder="Brief summary of the issue"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/30 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Describe your issue in detail…"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/30 transition-all resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">We typically respond within 48 business hours.</p>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                  >
                    {status === 'submitting' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M8.757 15.243l-2.121 2.121M17.364 17.364l-2.121-2.121M8.757 8.757L6.636 6.636" />
                        </svg>
                        Submitting…
                      </>
                    ) : (
                      'Submit complaint'
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© 2025 Drop API · DropID is open source (MIT License)</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}





// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { useState } from 'react';
// import Logo from '../logo/logo';

// type Tab = 'contact' | 'complaint';

// const contactChannels = [
//   {
//     icon: '✉',
//     label: 'Email',
//     value: 'support@dropaphi.dev',
//     href: 'mailto:support@dropaphi.dev',
//     description: 'For general enquiries and support',
//   },
//   {
//     icon: '💬',
//     label: 'Discord',
//     value: 'discord.gg/dropaphi',
//     href: 'https://discord.gg/dropaphi',
//     description: 'Join our developer community',
//   },
//   {
//     icon: '𝕏',
//     label: 'Twitter / X',
//     value: '@dropaphi',
//     href: 'https://x.com/dropaphi',
//     description: 'Follow for updates and announcements',
//   },
//   {
//     icon: '🐙',
//     label: 'GitHub',
//     value: 'github.com/golddick/dropid',
//     href: 'https://github.com/golddick/dropid',
//     description: 'Open source · MIT License',
//   },
// ];

// const complaintCategories = [
//   'Billing / Subscription',
//   'API Issue',
//   'Documentation Error',
//   'Performance / Downtime',
//   'Security Concern',
//   'Other',
// ];

// type FormState = {
//   name: string;
//   email: string;
//   category: string;
//   subject: string;
//   message: string;
// };

// type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

// export default function ContactPage() {
//   const [activeTab, setActiveTab] = useState<Tab>('contact');
//   const [form, setForm] = useState<FormState>({
//     name: '',
//     email: '',
//     category: '',
//     subject: '',
//     message: '',
//   });
//   const [status, setStatus] = useState<SubmitStatus>('idle');

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatus('submitting');
//     // Replace with your real endpoint
//     await new Promise((res) => setTimeout(res, 1400));
//     setStatus('success');
//   };

//   return (
//     <main className="min-h-screen bg-background text-foreground">
//       {/* ── Header ── */}
//       <div className="border-b border-border">
//         <div className="max-w-4xl mx-auto px-6 py-14 text-center">
//           <div className="flex items-center justify-center gap-2.5 mb-6">
//             <Logo />
//           </div>
//           <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
//             Get in touch
//           </h1>
//           <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
//             Whether you have a question, a bug to report, or feedback we're
//             listening.
//           </p>
//         </div>
//       </div>

//       {/* ── Tabs ── */}
//       <div className="max-w-4xl mx-auto px-6">
//         <div className="flex border-b border-border mt-0">
//           {(['contact', 'complaint'] as Tab[]).map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`
//                 relative px-6 py-4 text-sm font-semibold capitalize transition-colors
//                 ${
//                   activeTab === tab
//                     ? 'text-foreground'
//                     : 'text-muted-foreground hover:text-foreground'
//                 }
//               `}
//             >
//               {tab === 'contact' ? 'Contact Info' : 'File a Complaint'}
//               {activeTab === tab && (
//                 <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
//               )}
//             </button>
//           ))}
//         </div>

//         {/* ── Contact Info Panel ── */}
//         {activeTab === 'contact' && (
//           <section className="py-12 animate-fade-in">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {contactChannels.map((ch) => (
//                 <a
//                   key={ch.label}
//                   href={ch.href}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-red-600/40 hover:bg-[#13131e]"
//                 >
//                   <span className="mt-0.5 text-2xl select-none">{ch.icon}</span>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
//                       {ch.label}
//                     </p>
//                     <p className="text-sm font-medium text-foreground truncate group-hover:text-red-500 transition-colors">
//                       {ch.value}
//                     </p>
//                     <p className="text-xs text-muted-foreground mt-1">
//                       {ch.description}
//                     </p>
//                   </div>
//                   <svg
//                     className="mt-1 w-4 h-4 text-muted-foreground/40 group-hover:text-red-600 transition-colors shrink-0"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                     strokeWidth={2}
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M9 5l7 7-7 7"
//                     />
//                   </svg>
//                 </a>
//               ))}
//             </div>

//             <div className="mt-10 rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
//               <div className="flex-1">
//                 <p className="text-sm font-semibold text-foreground mb-1">
//                   Response times
//                 </p>
//                 <p className="text-xs text-muted-foreground leading-relaxed">
//                   Community support via Discord is fastest. Email responses
//                   typically land within 48 hours on business days.
//                 </p>
//               </div>
//               <div className="flex items-center gap-1.5 shrink-0">
//                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
//                 <span className="text-xs text-muted-foreground font-medium">
//                   All systems operational
//                 </span>
//               </div>
//             </div>
//           </section>
//         )}

//         {/* ── Complaint Form Panel ── */}
//         {activeTab === 'complaint' && (
//           <section className="py-12 animate-fade-in">
//             {status === 'success' ? (
//               <div className="rounded-xl border border-green-900/50 bg-green-950/20 p-10 text-center">
//                 <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
//                   <svg
//                     className="w-6 h-6 text-green-500"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                     strokeWidth={2}
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M5 13l4 4L19 7"
//                     />
//                   </svg>
//                 </div>
//                 <h2 className="text-lg font-bold mb-2">Complaint received</h2>
//                 <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
//                   We've logged your complaint and will follow up at the email
//                   address you provided within 48 hours.
//                 </p>
//                 <button
//                   onClick={() => {
//                     setStatus('idle');
//                     setForm({
//                       name: '',
//                       email: '',
//                       category: '',
//                       subject: '',
//                       message: '',
//                     });
//                   }}
//                   className="mt-6 text-sm text-red-500 hover:text-red-400 transition-colors underline underline-offset-2"
//                 >
//                   Submit another
//                 </button>
//               </div>
//             ) : (
//               <form onSubmit={handleSubmit} className="space-y-5">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                   <Field label="Full name">
//                     <input
//                       type="text"
//                       name="name"
//                       value={form.name}
//                       onChange={handleChange}
//                       required
//                       placeholder="Jane Smith"
//                       className={inputCls}
//                     />
//                   </Field>
//                   <Field label="Email address">
//                     <input
//                       type="email"
//                       name="email"
//                       value={form.email}
//                       onChange={handleChange}
//                       required
//                       placeholder="jane@example.com"
//                       className={inputCls}
//                     />
//                   </Field>
//                 </div>

//                 <Field label="Category">
//                   <select
//                     name="category"
//                     value={form.category}
//                     onChange={handleChange}
//                     required
//                     className={inputCls}
//                   >
//                     <option value="" disabled>
//                       Select a category…
//                     </option>
//                     {complaintCategories.map((c) => (
//                       <option key={c} value={c}>
//                         {c}
//                       </option>
//                     ))}
//                   </select>
//                 </Field>

//                 <Field label="Subject">
//                   <input
//                     type="text"
//                     name="subject"
//                     value={form.subject}
//                     onChange={handleChange}
//                     required
//                     placeholder="Brief summary of the issue"
//                     className={inputCls}
//                   />
//                 </Field>

//                 <Field label="Message">
//                   <textarea
//                     name="message"
//                     value={form.message}
//                     onChange={handleChange}
//                     required
//                     rows={5}
//                     placeholder="Describe your issue in detail…"
//                     className={`${inputCls} resize-none`}
//                   />
//                 </Field>

//                 <div className="pt-2 flex items-center justify-between">
//                   <p className="text-xs text-muted-foreground">
//                     We typically respond within 48 business hours.
//                   </p>
//                   <button
//                     type="submit"
//                     disabled={status === 'submitting'}
//                     className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
//                   >
//                     {status === 'submitting' ? (
//                       <>
//                         <svg
//                           className="w-4 h-4 animate-spin"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth={2}
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M8.757 15.243l-2.121 2.121M17.364 17.364l-2.121-2.121M8.757 8.757L6.636 6.636"
//                           />
//                         </svg>
//                         Submitting…
//                       </>
//                     ) : (
//                       'Submit complaint'
//                     )}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </section>
//         )}
//       </div>

//       {/* ── Footer strip ── */}
//       <footer className="border-t border-border mt-8">
//         <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
//           <p className="text-xs text-muted-foreground">
//             © 2025 Drop API · DropID is open source (MIT License)
//           </p>
//           <div className="flex items-center gap-4 text-xs text-muted-foreground">
//             <Link href="/privacy" className="hover:text-foreground transition-colors">
//               Privacy
//             </Link>
//             <Link href="/terms" className="hover:text-foreground transition-colors">
//               Terms
//             </Link>
//             <Link href="/" className="hover:text-foreground transition-colors">
//               Home
//             </Link>
//           </div>
//         </div>
//       </footer>
//     </main>
//   );
// }

// /* ── helpers ── */

// const inputCls =
//   'w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/30 transition-all';

// function Field({
//   label,
//   children,
// }: {
//   label: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
//         {label}
//       </label>
//       {children}
//     </div>
//   );
// }
