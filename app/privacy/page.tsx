
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Lock, Eye, Database, Bell, UserCheck } from 'lucide-react';
import Footer from '@/components/landingpage/Footer';
import Navigation from '@/components/landingpage/Navigation';
import { useAuthStore } from '@/lib/stores/auth';

const SECTIONS = [
  {
    icon: <Eye size={20} />,
    heading: '1. Introduction',
    content: `Drop API ("we", "us", "our") operates the Drop APHI website and platform. This Privacy Policy outlines how we collect, use, disclose, and protect your personal information when you use our services. By using Drop APHI you consent to the practices described here.`,
    list: null,
  },
  {
    icon: <Database size={20} />,
    heading: '2. Information We Collect',
    content: 'We collect information in several ways to provide and improve our services:',
    list: [
      'Information you provide directly — name, email address, phone number, company details',
      'Information collected automatically — IP address, browser type, pages visited, time on site',
      'Payment information — processed securely via PCI-compliant third-party providers',
      'API usage data — request logs, delivery reports, and performance metrics',
    ],
  },
  {
    icon: <UserCheck size={20} />,
    heading: '3. How We Use Your Information',
    content: 'We use collected data to deliver and continuously improve our services:',
    list: [
      'Provide, maintain, and improve the Drop APHI platform',
      'Process transactions and send transaction confirmations',
      'Send service updates and promotional communications (with consent)',
      'Respond to support requests and provide customer assistance',
      'Monitor usage trends and platform performance',
      'Comply with legal obligations and protect our rights',
    ],
  },
  {
    icon: <Lock size={20} />,
    heading: '4. Data Security',
    content: `We implement comprehensive security measures including end-to-end encryption, TLS in transit, AES-256 at rest, and regular third-party security audits. Access to customer data is strictly role-based and logged. No method of transmission over the internet is 100% secure, but we work continuously to maintain the highest standards.`,
    list: null,
  },
  {
    icon: <Shield size={20} />,
    heading: '5. Information Sharing',
    content: 'We do not sell, trade, or rent your personal information. We may share data only with:',
    list: [
      'Service providers who help us operate our platform under strict data-processing agreements',
      'Law enforcement when required by applicable law or to protect safety',
      'Acquirers in the event of a merger, acquisition, or asset sale (with notice)',
    ],
  },
  {
    icon: <UserCheck size={20} />,
    heading: '6. Your Privacy Rights',
    content: 'Depending on your jurisdiction, you have the right to:',
    list: [
      'Access your personal information we hold',
      'Correct inaccurate or incomplete data',
      'Request deletion of your personal data',
      'Opt out of marketing communications at any time',
      'Data portability — request an export of your data',
    ],
  },
  {
    icon: <Bell size={20} />,
    heading: '7. Cookies & Tracking',
    content: `We use cookies to enhance your experience, remember preferences, and understand usage patterns. You can manage or disable cookies through your browser settings, though some features may not function correctly without them. We do not use cookies for third-party advertising.`,
    list: null,
  },
  {
    icon: <Eye size={20} />,
    heading: '8. Children\'s Privacy',
    content: `Our services are not directed to individuals under 18. We do not knowingly collect personal information from minors. If we discover we have inadvertently collected such information, we will delete it promptly. If you believe we have collected data from a minor, please contact us immediately.`,
    list: null,
  },
  {
    icon: <Shield size={20} />,
    heading: '9. Policy Updates',
    content: `We may update this Privacy Policy periodically to reflect changes in our practices or applicable law. We will notify you of material changes by posting the updated policy on our website and updating the "Last Updated" date. Continued use of our services after updates constitutes acceptance.`,
    list: null,
  },
];

export default function PrivacyPage() {
  const { user } = useAuthStore();
  
  return (
    <div className="overflow-x-hidden bg-white">
      {/* <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');
      `}</style> */}
      
      <Navigation user={user} />

      {/* ── HERO — dark ── */}
      <section className="bg-black text-white px-6 py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/5 w-[700px] h-[500px] bg-[radial-gradient(ellipse,rgba(220,20,60,0.1)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(220,20,60,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(220,20,60,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-900/20 border border-red-800/30 font-mono text-xs uppercase tracking-wider text-red-400 mb-6">
              Legal
            </div>
            <h1 className="font-['Bricolage_Grotesque'] text-[clamp(2.6rem,5.5vw,4.4rem)] font-extrabold leading-[1.07] tracking-[-0.035em] mb-5">
              Privacy Policy
            </h1>
            <p className="font-['Plus_Jakarta_Sans'] text-base text-white/50 leading-relaxed max-w-lg">
              We take your privacy seriously. Here's exactly how we collect, use, and protect your data.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <span className="font-mono text-xs text-[#444] px-3 py-1 rounded-md bg-[#161616] border border-[#222]">
                Last Updated: February 2024
              </span>
              <span className="font-mono text-xs text-[#444] px-3 py-1 rounded-md bg-[#161616] border border-[#222]">
                v1.2
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TABLE OF CONTENTS — white ── */}
      <section className="bg-white px-6 py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2.5">
            {SECTIONS.map(({ heading }, i) => (
              <a
                key={i}
                href={`#section-${i}`}
                className="font-mono text-xs px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 no-underline transition-all hover:border-red-600 hover:text-red-600"
              >
                {heading.split('. ')[1] || heading}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT — white ── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-0">
            {SECTIONS.map(({ icon, heading, content, list }, i) => (
              <motion.div
                key={i}
                id={`section-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="py-10 border-b border-gray-100 last:border-0"
              >
                <div className="flex gap-5 items-start">
                  <div className="w-11 h-11 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 flex-shrink-0 mt-1">
                    {icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-['Bricolage_Grotesque'] text-xl font-extrabold text-gray-900 mb-3.5 tracking-tight">
                      {heading}
                    </h2>
                    <p className="font-['Plus_Jakarta_Sans'] text-sm text-gray-600 leading-relaxed mb-4">
                      {content}
                    </p>
                    {list && (
                      <ul className="list-none p-0 flex flex-col gap-2">
                        {list.map((item, j) => (
                          <li key={j} className="flex gap-2.5 items-start">
                            <span className="text-red-600 text-xs mt-1 flex-shrink-0">✓</span>
                            <span className="font-['Plus_Jakarta_Sans'] text-sm text-gray-600 leading-relaxed">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-14 bg-black rounded-2xl p-8 md:p-9 border border-red-600/20"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-900/20 border border-red-800/30 font-mono text-xs uppercase tracking-wider text-red-400 mb-4">
              Contact
            </div>
            <h3 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold text-white mb-3">
              Privacy Questions?
            </h3>
            <p className="font-['Plus_Jakarta_Sans'] text-sm text-white/50 leading-relaxed mb-6">
              If you have any questions about this Privacy Policy or how we handle your data, please reach out.
            </p>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-[#141414] border border-[#222] rounded-lg p-3.5 px-5">
                <p className="font-mono text-xs text-[#555] mb-1">EMAIL</p>
                <p className="font-['Plus_Jakarta_Sans'] text-sm text-white">privacy@dropaphi.com</p>
              </div>
              <div className="bg-[#141414] border border-[#222] rounded-lg p-3.5 px-5">
                <p className="font-mono text-xs text-[#555] mb-1">ADDRESS</p>
                <p className="font-['Plus_Jakarta_Sans'] text-sm text-white">Lagos, Nigeria</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}