

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, FileText, CreditCard, AlertTriangle, Users, Settings, Globe } from 'lucide-react';
import Footer from '@/components/landingpage/Footer';
import { useAuthStore } from '@/lib/stores/auth';
import Navigation from '@/components/landingpage/Navigation';

const SECTIONS = [
  {
    icon: <FileText size={20} />,
    heading: '1. Agreement to Terms',
    content: `By accessing and using Drop APHI's website and services, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services. We reserve the right to update these terms at any time with reasonable notice.`,
    list: null,
  },
  {
    icon: <Settings size={20} />,
    heading: '2. Use License',
    content: 'Permission is granted to access and use Drop APHI for your application development. Under this license you may not:',
    list: [
      'Reproduce, distribute, or sell access to the Drop APHI platform',
      'Use the platform to send spam, unsolicited messages, or illegal content',
      'Attempt to reverse engineer, decompile, or extract our proprietary code',
      'Remove or obscure any copyright or proprietary notices',
      'Use the service in ways that violate any applicable laws or regulations',
    ],
  },
  {
    icon: <Users size={20} />,
    heading: '3. User Accounts',
    content: 'When you create a Drop APHI account, you are responsible for:',
    list: [
      'Maintaining the confidentiality of your API keys and account credentials',
      'All activities, API calls, and charges that occur under your account',
      'Notifying us immediately of any unauthorized account access',
      'Providing accurate, complete, and current information at registration',
      'Ensuring only authorized personnel access your account',
    ],
  },
  {
    icon: <AlertTriangle size={20} />,
    heading: '4. Prohibited Activities',
    content: 'You agree not to engage in any of the following activities via our platform:',
    list: [
      'Sending spam, phishing messages, or unsolicited bulk communications',
      'Transmitting abusive, harassing, or harmful content to end recipients',
      'Attempting to gain unauthorized access to our systems or other accounts',
      'Using the platform to facilitate fraud, money laundering, or illegal schemes',
      'Violating any applicable laws, regulations, or third-party rights',
      'Circumventing rate limits, quotas, or usage restrictions',
    ],
  },
  {
    icon: <CreditCard size={20} />,
    heading: '5. Payment Terms',
    content: `By subscribing to a paid plan, you authorize Drop APHI to charge your provided payment method on a recurring basis. You agree to pay all charges incurred including applicable taxes. We reserve the right to modify pricing with 30 days' prior notice. Refunds are provided at our discretion for unused prepaid credits.`,
    list: null,
  },
  {
    icon: <Settings size={20} />,
    heading: '6. Service Availability',
    content: `Drop APHI strives to maintain 99.9% uptime as specified in our SLA. Planned maintenance windows will be communicated in advance. We are not liable for interruptions caused by factors outside our control, including carrier outages, force majeure events, or third-party service failures.`,
    list: null,
  },
  {
    icon: <AlertTriangle size={20} />,
    heading: '7. Disclaimer & Limitations',
    content: `The platform is provided "as is" without warranties of any kind, express or implied. In no event shall Drop APHI be liable for indirect, incidental, special, or consequential damages arising from your use of the platform. Our maximum liability is limited to the amount paid by you in the 3 months preceding the claim.`,
    list: null,
  },
  {
    icon: <Globe size={20} />,
    heading: '8. Governing Law',
    content: `These terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts located in Lagos State, Nigeria.`,
    list: null,
  },
  {
    icon: <FileText size={20} />,
    heading: '9. Modifications',
    content: `Drop APHI may revise these Terms of Service at any time. For material changes, we will provide at least 14 days' notice via email or in-app notification. Continued use of the service after changes take effect constitutes your acceptance of the updated terms.`,
    list: null,
  },
];

export default function TermsPage() {
  const { user } = useAuthStore();
  
  return (
    <div className="overflow-x-hidden bg-white">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');
      `}</style>
      
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
              Terms of Service
            </h1>
            <p className="font-['Plus_Jakarta_Sans'] text-base text-white/50 leading-relaxed max-w-lg">
              Please read these terms carefully before using Drop APHI. They govern your use of our platform and APIs.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <span className="font-mono text-xs text-[#444] px-3 py-1 rounded-md bg-[#161616] border border-[#222]">
                Last Updated: February 2024
              </span>
              <span className="font-mono text-xs text-[#444] px-3 py-1 rounded-md bg-[#161616] border border-[#222]">
                v1.1
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TOC — white ── */}
      <section className="bg-white px-6 py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2.5">
            {SECTIONS.map(({ heading }, i) => (
              <a 
                key={i} 
                href={`#ts-${i}`}
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
                id={`ts-${i}`}
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
              Legal Questions?
            </h3>
            <p className="font-['Plus_Jakarta_Sans'] text-sm text-white/50 leading-relaxed mb-6">
              For questions about these Terms of Service, please contact our legal team.
            </p>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-[#141414] border border-[#222] rounded-lg p-3.5 px-5">
                <p className="font-mono text-xs text-[#555] mb-1">EMAIL</p>
                <p className="font-['Plus_Jakarta_Sans'] text-sm text-white">legal@dropaphi.com</p>
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