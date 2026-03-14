'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="bg-black py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 32 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          viewport={{ once: true }}
          className="relative bg-[#111] border border-red-600/20 rounded-2xl py-20 px-8 md:px-20 text-center overflow-hidden"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-[radial-gradient(ellipse,rgba(220,20,60,0.1)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(220,20,60,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(220,20,60,0.04)_1px,transparent_1px)] bg-size-[40px_40px] rounded-2xl" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-900/20 border border-red-800/30 font-mono text-xs uppercase tracking-wider text-red-400 mb-6">
              Start Today — Free
            </div>
            <h2 className="font-[Bricolage_Grotesque] text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold tracking-tight leading-tight text-white mb-5">
              Ready to <span className="text-red-600">build?</span>
            </h2>
            <p className="font-sans text-base text-white/45 leading-relaxed max-w-md mx-auto mb-10">
              Join thousands of developers shipping with Drop APHI. Free to start, DropID SDK included on every plan.
            </p>
            <div className="flex gap-3.5 justify-center flex-wrap">
              <Link href="/auth/signup" className="inline-flex items-center gap-2 px-9 py-4 bg-red-600 text-white rounded-lg font-[Bricolage_Grotesque] font-bold text-base hover:bg-red-700 transition-all">
                Sign Up Free <ArrowRight size={16} />
              </Link>
              <Link href="/docs" className="inline-flex items-center gap-2 px-9 py-4 bg-white text-gray-900 rounded-lg font-[Bricolage_Grotesque] font-bold text-base hover:bg-gray-100 transition-all">
                Read the Docs
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}