'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { quote: 'Drop APHI cut our OTP delivery time from 12 seconds to under a second. Night and day difference.', name: 'Tunde A.', role: 'CTO, PayFast Africa' },
  { quote: 'DropID finally made our support tickets debuggable. We identify issues in seconds instead of minutes.', name: 'Amara O.', role: 'Lead Engineer, LogiTrack' },
  { quote: 'The cleanest API I\'ve integrated in years. Docs are excellent and support is genuinely fast.', name: 'Kofi M.', role: 'Founder, ShopGh' },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-gray-50 border-t border-gray-200 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }} 
          viewport={{ once: true }} 
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 font-mono text-xs uppercase tracking-wider text-gray-600 mb-4">
            Testimonials
          </div>
          <h2 className="font-[Bricolage_Grotesque] text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-tight text-gray-900">
            Trusted by builders across Africa
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ quote, name, role }, i) => (
            <motion.div 
              key={i} 
              className="bg-white border border-gray-200 rounded-xl p-7 hover:border-red-300 hover:shadow-xl transition-all"
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: i * 0.1 }} 
              viewport={{ once: true }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="fill-red-600 text-red-600" />
                ))}
              </div>
              <p className="font-sans text-sm text-gray-700 leading-relaxed mb-5">"{quote}"</p>
              <div>
                <p className="font-[Bricolage_Grotesque] font-bold text-sm text-gray-900">{name}</p>
                <p className="font-mono text-xs text-gray-400">{role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}