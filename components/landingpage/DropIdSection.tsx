'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { DropIdDemo } from './home';


export default function DropIdSection() {
  return (
    <section id="dropid" className="bg-black text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -32 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-900/20 border border-red-800/30 font-mono text-xs uppercase tracking-wider text-red-400 mb-6">
              Open Source · MIT License
            </div>
            <h2 className="font-[Bricolage_Grotesque] text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight leading-tight mb-5">
              DropID —<br /><span className="text-red-600">IDs That Make Sense</span>
            </h2>
            <p className="font-sans text-base text-white/50 leading-relaxed mb-9">
              Stop debugging cryptic UUIDs. DropID generates human-readable, crypto-secure identifiers that speed up debugging and make every log readable at a glance.
            </p>
            {[
              { title: 'Instantly Readable', desc: 'user_a3f2b9c1 instead of 550e8400-e29b-41d4' },
              { title: 'Multi-Tenant Ready', desc: 'acme_order_x7k9m2 — prefix by tenant or entity' },
              { title: '2–3M IDs/sec', desc: 'Crypto-secure, collision-resistant, only 2KB bundle' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-3.5 mb-5 items-start">
                <div className="w-5.5 h-5.5 rounded bg-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className="font-[Bricolage_Grotesque] font-bold text-sm mb-0.5">{title}</p>
                  <p className="font-mono text-xs text-white/35">{desc}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-3 mt-9">
              <Link href="/docs/dropid" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-[Bricolage_Grotesque] font-bold hover:bg-red-700 transition-all">
                Read Docs
              </Link>
              <a 
                href="https://npmjs.com/package/drop-api-id" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-white/20 text-white/70 rounded-lg font-[Bricolage_Grotesque] font-semibold hover:border-white/40 hover:text-white transition-all"
              >
                View on npm
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 32 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }}
          >
            <DropIdDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}