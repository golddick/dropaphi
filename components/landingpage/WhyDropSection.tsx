'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, Globe, BarChart3, Headphones, Clock } from 'lucide-react';

const features = [
  { icon: <Zap size={20} />, title: '99.9% Uptime SLA', desc: 'Redundant infrastructure with automatic failover. Enterprise reliability without enterprise contracts.' },
  { icon: <Globe size={20} />, title: 'Pan-African Coverage', desc: 'Direct carrier partnerships across Nigeria, Ghana, Kenya, SA, and 30+ other markets.' },
  { icon: <BarChart3 size={20} />, title: 'Real-time Analytics', desc: 'Track delivery, open rates, and engagement the moment messages land.' },
  { icon: <Shield size={20} />, title: 'Crypto-Secure', desc: 'End-to-end encryption, GDPR-ready, and compliant with regional data regulations.' },
  { icon: <Clock size={20} />, title: 'Pay-as-you-go', desc: 'No monthly minimums. No hidden fees. Start free and scale when you\'re ready.' },
  { icon: <Headphones size={20} />, title: '24/7 Support', desc: 'Engineers — not bots — available around the clock to unblock your builds.' },
];

export default function WhyDropSection() {
  return (
    <section className="bg-black text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 24 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }} 
          viewport={{ once: true }} 
          className="mb-16 max-w-lg"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-900/20 border border-red-800/30 font-mono text-xs uppercase tracking-wider text-red-400 mb-4">
            Why Drop APHI
          </div>
          <h2 className="font-[Bricolage_Grotesque] text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-tight leading-tight">
            The infrastructure<br /><span className="text-red-600">you actually deserve</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: i * 0.07 }} 
              viewport={{ once: true }} 
              className="bg-[#141414] border border-white/10 rounded-xl p-7 hover:border-red-600/40 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="w-11 h-11 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600 mb-4.5">
                {feature.icon}
              </div>
              <h3 className="font-[Bricolage_Grotesque] text-base font-bold mb-2.5">{feature.title}</h3>
              <p className="font-sans text-sm text-white/40 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}