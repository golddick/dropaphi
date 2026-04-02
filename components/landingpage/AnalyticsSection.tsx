'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BarChart3, Zap, Globe, ArrowRight } from 'lucide-react';
import { AnalyticsMockup } from './home';

const features = [
  { icon: <BarChart3 size={18} />, title: 'Live delivery tracking', desc: 'Watch SMS, Email, OTP status update as they happen.' },
  { icon: <Zap size={18} />, title: 'Latency monitoring', desc: 'P50, P95, P99 response times broken down by channel.' },
  { icon: <Globe size={18} />, title: 'Geographic breakdown', desc: 'Delivery success rates by country and carrier.' },
];

export default function AnalyticsSection() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -32 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }}
          >
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 overflow-hidden">
              <AnalyticsMockup />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 32 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 font-mono text-xs uppercase tracking-wider text-red-600 mb-5">
              Real-time Analytics
            </div>
            <h2 className="font-[Bricolage_Grotesque] text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-tight leading-tight text-gray-900 mb-5">
              See every message,<br /><span className="text-red-600">in real time</span>
            </h2>
            <p className="font-sans text-base text-gray-600 leading-relaxed mb-9">
              Your dashboard tracks every message across every channel. Delivery rates, open rates, latency histograms — all live, all in one place.
            </p>
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 mb-5.5 items-start">
                <div className="w-11 h-11 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="font-[Bricolage_Grotesque] font-bold text-sm text-gray-900 mb-1">{title}</p>
                  <p className="font-sans text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
            <Link href="/auth/signup" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-red-600 text-white rounded-lg font-[Bricolage_Grotesque] font-bold hover:bg-red-700 transition-all">
              See Your Dashboard <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}