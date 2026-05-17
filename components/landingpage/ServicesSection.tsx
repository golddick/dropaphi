'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MessageSquare, Mail, Lock, Database, ChevronRight, Book } from 'lucide-react';
import { ApiFlowDiagram } from './home';

const services = [
  { icon: <MessageSquare size={20} />, title: 'SMS API', desc: 'Bulk & transactional messaging at scale. Pan-African routes optimized for delivery speed.', tag: 'Core' },
  { icon: <Mail size={20} />, title: 'Email API', desc: 'Reliable delivery with templates, tracking, and full analytics. Built for volume.', tag: 'Core' },
  { icon: <Lock size={20} />, title: 'OTP Service', desc: 'Multi-channel verification via SMS, Email, or WhatsApp. Secure auth in seconds.', tag: 'Security' },
  { icon: <Book size={20} />, title: 'Blog Service', desc: 'Create, manage, and publish blog content programmatically. REST API and SDK support for any platform.', tag: 'Blog' },
];

export default function ServicesSection() {
  return (
    <section id="services" className="bg-background  py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 24 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }} 
          viewport={{ once: true }} 
          className="mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-border font-mono text-xs uppercase tracking-wider text-gray-600 mb-4">
            Our Stack
          </div>
          <h2 className=" text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-tight text-foreground max-w-md leading-tight">
            Everything you need to communicate
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: i * 0.08 }} 
              viewport={{ once: true }} 
              className="bg-card border border-border rounded-xl p-7 hover:border-destructive hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="w-11 h-11 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                  {service.icon}
                </div>
                <span className="inline-flex px-2.5 py-1 rounded-full bg-red-50 border border-red-200 font-mono text-xs text-red-600">
                  {service.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2.5">{service.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* API flow */}
        <motion.div 
          initial={{ opacity: 0, y: 32 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }} 
          viewport={{ once: true }} 
          className="mt-16"
        >
          <div className="bg-background border-none rounded-2xl p-10 md:p-8">
            <div className="mb-7 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200  text-xs uppercase tracking-wider text-gray-600 mb-2.5">
                  How it works
                </div>
                <h3 className="font-[Bricolage_Grotesque] text-2xl font-extrabold text-foreground tracking-tight">
                  One request — every channel
                </h3>
              </div>
              <Link href="/docs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border border-gray-200 rounded-lg  font-semibold text-foreground hover:border-red-600 hover:text-red-600 transition-all text-sm">
                Read the docs <ChevronRight size={14} />
              </Link>
            </div>
            <ApiFlowDiagram />
          </div>
        </motion.div>
      </div>
    </section>
  );
}