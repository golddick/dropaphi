'use client';

import { motion } from 'framer-motion';

const useCases = [
  { 
    icon: '🛒', 
    title: 'E-Commerce', 
    desc: 'Order confirmations, shipping updates, and delivery notifications that keep customers coming back.',
    tags: ['Order Alerts', 'Shipping SMS', 'Readable IDs'] 
  },
  { 
    icon: '⚙️', 
    title: 'SaaS Platforms', 
    desc: 'Secure 2FA, account alerts, and readable debug logs powered by DropID.',
    tags: ['2FA / OTP', 'DropID', 'Analytics'] 
  },
  { 
    icon: '🏦', 
    title: 'FinTech & Banking', 
    desc: 'Transaction alerts, multi-factor auth, and compliant audit trails for financial institutions.',
    tags: ['Tx Alerts', 'Secure Auth', 'Audit Trail'] 
  },
  { 
    icon: '🏥', 
    title: 'Healthcare', 
    desc: 'Appointment reminders, test result delivery, and HIPAA-friendly patient identifiers.',
    tags: ['Reminders', 'Patient IDs', 'Results'] 
  },
];

export default function UseCasesSection() {
  return (
    <section className="bg-gray-50 border-t border-b border-gray-200 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 24 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7 }} 
          viewport={{ once: true }} 
          className="mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 font-mono text-xs uppercase tracking-wider text-gray-600 mb-4">
            Use Cases
          </div>
          <h2 className="font-[Bricolage_Grotesque] text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-tight text-gray-900 max-w-md leading-tight">
            Built for every industry
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {useCases.map((useCase, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: i * 0.08 }} 
              viewport={{ once: true }} 
              className="bg-white border border-gray-200 rounded-xl p-7 hover:border-red-300 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="text-3xl mb-4">{useCase.icon}</div>
              <h3 className="font-[Bricolage_Grotesque] text-lg font-bold text-gray-900 mb-2.5">{useCase.title}</h3>
              <p className="font-sans text-sm text-gray-500 leading-relaxed mb-5">{useCase.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {useCase.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="font-mono text-xs px-2.5 py-1 rounded bg-gray-100 text-gray-500 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}