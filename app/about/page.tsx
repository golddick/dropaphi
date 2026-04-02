

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MapPin, Users, Zap, Globe, Shield, BarChart3, Headphones, Clock, Heart } from 'lucide-react';
import Navigation from '@/components/landingpage/Navigation';
import { useAuthStore } from '@/lib/stores/auth';
import Footer from '@/components/landingpage/Footer';
import { Ticker } from '@/components/landingpage/home';

/* ── Ticker ── */
// function Ticker() {
//   const items = ['Built in Africa', 'Pan-African Coverage', '99.9% SLA', 'Open Source', 'SMS · Email · OTP · Storage', '2,000+ Businesses', 'Developer First', '50M+ Messages/Day'];
//   return (
//     <div className="bg-black border-t border-b border-gray-900 py-3 overflow-hidden">
//       <div className="overflow-hidden">
//         <div className="flex animate-[tick_28s_linear_infinite] w-max">
//           {[...Array(2)].map((_, k) => (
//             <div key={k} className="flex items-center">
//               {items.map((item, j) => (
//                 <span 
//                   key={j} 
//                   className={`font-mono text-[0.7rem] uppercase tracking-widest px-7 border-r border-gray-800 whitespace-nowrap ${
//                     j % 2 === 0 ? 'text-white/40' : 'text-red-600'
//                   }`}
//                 >
//                   {item}
//                 </span>
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

/* ── Stats SVG card ── */
function StatsCard() {
  return (
    <svg viewBox="0 0 420 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <rect width="420" height="460" rx="20" fill="#0A0A0A"/>
      {/* Red top accent */}
      <rect width="420" height="4" rx="2" fill="url(#sg1)"/>
      <defs>
        <linearGradient id="sg1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#DC143C"/>
          <stop offset="100%" stopColor="#ff6b6b"/>
        </linearGradient>
      </defs>

      {/* Header */}
      <text x="28" y="48" className="font-sans text-[13px] font-bold fill-white">Company at a Glance</text>
      <text x="28" y="66" className="font-mono text-[10px] fill-[#444]">March 2025</text>

      {/* Stat blocks */}
      {[
        { label: 'FOUNDED',          val: '2021',        sub: 'Lagos, Nigeria',    color: '#DC143C', y: 96  },
        { label: 'CUSTOMERS',        val: '5,000+',      sub: 'Active businesses', color: '#3B82F6', y: 180 },
        { label: 'MESSAGES / DAY',   val: '50M+',        sub: 'All channels',      color: '#22C55E', y: 264 },
        { label: 'UPTIME SLA',       val: '99.9%',       sub: 'Enterprise grade',  color: '#F97316', y: 348 },
      ].map(({ label, val, sub, color, y }) => (
        <g key={label}>
          <rect x="20" y={y} width="380" height="68" rx="10" fill="#141414" stroke="#1E1E1E" strokeWidth="1"/>
          <rect x="20" y={y} width="4" height="68" rx="2" fill={color}/>
          <text x="36" y={y + 22} className="font-mono text-[8.5px] tracking-wider fill-[#555]">{label}</text>
          <text x="36" y={y + 48} className="font-sans text-2xl font-extrabold fill-white">{val}</text>
          <text x="36" y={y + 63} className="font-sans text-[10px] fill-[#444]">{sub}</text>
          {/* Mini sparkline */}
          <rect x="310" y={y + 20} width="76" height="28" rx="6" fill="#1A1A1A"/>
          <polyline
            points={`316,${y + 40} 322,${y + 35} 328,${y + 38} 334,${y + 30} 340,${y + 33} 346,${y + 26} 352,${y + 29} 358,${y + 24} 364,${y + 28} 370,${y + 22} 376,${y + 25} 382,${y + 22}`}
            stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </g>
      ))}

      {/* HQ badge */}
      <rect x="20" y="432" width="380" height="20" rx="6" fill="#161616"/>
      <circle cx="32" cy="442" r="3" fill="#DC143C"/>
      <text x="40" y="446" className="font-mono text-[9px] fill-[#555]">Headquarters: Lagos, Nigeria  ·  Serving 30+ African Markets</text>
    </svg>
  );
}

/* ── Main ── */
export default function AboutPage() {
  const { user } = useAuthStore();
  
  return (
    <div className="overflow-x-hidden bg-white">
      {/* <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');
        
        @keyframes tick {
          to { transform: translateX(-50%); }
        }
        @keyframes pulse-dot {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
        .pulse { animation: pulse-dot 2s ease-in-out infinite; }
      `}</style> */}
      
      <Navigation user={user} />

      {/* ── HERO — dark ── */}
      <section className="bg-black text-white px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[48px_48px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/5 w-175 h-125 bg-[radial-gradient(ellipse,rgba(220,20,60,0.12)_0%,transparent_65%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-900/20 border border-red-800/30 font-mono text-xs uppercase tracking-wider text-red-400 mb-6">
              <span className="pulse w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
              Our Story
            </div>
            <h1 className="font-['Bricolage_Grotesque'] text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[1.07] tracking-[-0.035em] mb-6">
              Built in Africa,
              <br />
              <span className="text-red-600">For Africa.</span>
            </h1>
            <p className="font-['Plus_Jakarta_Sans'] text-lg text-white/55 leading-relaxed max-w-xl">
              Drop APHI was founded with one mission — make reliable communication infrastructure accessible to every developer and business building on the continent.
            </p>
          </motion.div>
        </div>
      </section>

      <Ticker />

      {/* ── STORY — white ── */}
      <section className="bg-white px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 font-mono text-xs uppercase tracking-wider text-gray-600 mb-5">
                Origin
              </div>
              <h2 className="font-['Bricolage_Grotesque'] text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-tight text-gray-900 leading-tight mb-5">
                Started in a Ibadan,<br /><span className="text-red-600">now serving thousands</span>
              </h2>
              <p className="font-['Plus_Jakarta_Sans'] text-base text-gray-600 leading-relaxed mb-5">
                We built Drop APHI after experiencing firsthand how fragmented and unreliable communication tools were for African developers. Global providers charged international rates, delivered inconsistently, and had zero understanding of local carrier dynamics.
              </p>
              <p className="font-['Plus_Jakarta_Sans'] text-base text-gray-600 leading-relaxed mb-5">
                So we built our own — from the ground up, with direct carrier partnerships across 30+ African markets, local routing intelligence, and a developer experience that actually makes sense.
              </p>
              <p className="font-['Plus_Jakarta_Sans'] text-base text-gray-600 leading-relaxed mb-9">
                Today Drop APHI powers communication for e-commerce platforms, fintech companies, healthcare providers, and SaaS products across the continent.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-['Bricolage_Grotesque'] font-bold hover:bg-red-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-red-600/25">
                  Start Building Free <ArrowRight size={14} />
                </Link>
                <Link href="/docs" className="inline-flex items-center gap-2 px-5 py-3 bg-transparent border border-gray-200 text-gray-800 rounded-lg font-['Bricolage_Grotesque'] font-semibold hover:border-red-600 hover:text-red-600 transition-all">
                  Read the Docs
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 32 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <StatsCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM — off-white ── */}
      <section className="bg-gray-50 px-6 py-24 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }} className="mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 font-mono text-xs uppercase tracking-wider text-gray-600 mb-4">
              The Problem
            </div>
            <h2 className="font-['Bricolage_Grotesque'] text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-tight text-gray-900 max-w-lg leading-tight">
              Why Africa needed a native solution
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { n: '01', title: 'Unreliable Delivery', desc: 'Global providers failed to deliver consistently across African carriers and networks.' },
              { n: '02', title: 'Prohibitive Costs', desc: 'International rates made communication costs unsustainable for growing local businesses.' },
              { n: '03', title: 'Zero Local Support', desc: 'No understanding of African timezones, local regulations, or regional carrier requirements.' },
              { n: '04', title: 'Complex Integration', desc: 'Fragmented vendor landscape meant stitching 4–5 SDKs together just to send a message.' },
              { n: '05', title: 'No Regulatory Fit', desc: 'Foreign platforms lacked awareness of NDPC, GDPR-Africa, and local compliance needs.' },
              { n: '06', title: 'Everything Siloed', desc: 'SMS, Email, OTP, Storage — no single provider offered them all. Until now.' },
            ].map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 rounded-xl p-7 hover:border-red-300 hover:shadow-xl hover:-translate-y-1 transition-all relative"
              >
                <span className="font-['Bricolage_Grotesque'] absolute top-4 right-5 text-3xl font-black text-[rgba(220,20,60,0.08)] tracking-tighter">{n}</span>
                <div className="w-1 h-9 bg-red-600 rounded mb-4" />
                <h3 className="font-['Bricolage_Grotesque'] text-base font-bold text-gray-900 mb-2.5">{title}</h3>
                <p className="font-['Plus_Jakarta_Sans'] text-sm text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES — dark ── */}
      <section className="bg-black text-white px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }} className="mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-900/20 border border-red-800/30 font-mono text-xs uppercase tracking-wider text-red-400 mb-4">
              Our Values
            </div>
            <h2 className="font-['Bricolage_Grotesque'] text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-tight leading-tight max-w-md">
              What we stand for,<br /><span className="text-red-600">every single day</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Zap size={20} />,        title: 'Reliability',       desc: 'Enterprise-grade infrastructure with 99.9% uptime SLA. Because missed messages = missed revenue.' },
              { icon: <Globe size={20} />,       title: 'Pan-African',       desc: 'Direct partnerships across Nigeria, Ghana, Kenya, SA, and 30+ markets. We are where your users are.' },
              { icon: <Shield size={20} />,      title: 'Security',          desc: 'End-to-end encryption, GDPR-ready, and fully compliant with African regional data regulations.' },
              { icon: <BarChart3 size={20} />,   title: 'Transparency',      desc: 'Simple pricing, no hidden fees. Real-time analytics so you always know exactly what\'s happening.' },
              { icon: <Heart size={20} />,       title: 'Developer-First',   desc: 'Comprehensive docs, clean SDKs, and a DX that respects your time as a builder.' },
              { icon: <Headphones size={20} />,  title: '24/7 Support',      desc: 'Real engineers — not bots — on hand around the clock to unblock your team.' },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                viewport={{ once: true }}
                className="bg-[#141414] border border-white/10 rounded-xl p-7 hover:border-red-600/40 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="w-11 h-11 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600 mb-4.5">
                  {v.icon}
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-base font-bold mb-2.5">{v.title}</h3>
                <p className="font-['Plus_Jakarta_Sans'] text-sm text-white/40 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM QUOTE — white ── */}
      <section className="bg-white px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 font-mono text-xs uppercase tracking-wider text-red-600 mb-8">
              From the Founders
            </div>
            <blockquote className="font-['Bricolage_Grotesque'] text-[clamp(1.5rem,3.5vw,2.4rem)] font-bold text-gray-900 leading-tight tracking-tight mb-10">
              "Africa doesn't need adapted tools. It needs tools that were built here, for here — with the nuance and depth that only comes from living the problem yourself."
            </blockquote>
            <div className="flex items-center gap-3.5 justify-center">
              <div className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center font-['Bricolage_Grotesque'] font-extrabold text-base text-white shrink-0">
                G
              </div>
              <div className="text-left">
                <p className="font-['Bricolage_Grotesque'] font-bold text-sm text-gray-900">Golddick E.</p>
                <p className="font-mono text-xs text-gray-400">Founder & CEO, Drop APHI</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA — dark ── */}
      <section className="bg-black px-6 py-24">
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
                Join us
              </div>
              <h2 className="font-['Bricolage_Grotesque'] text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold tracking-tight leading-tight text-white mb-5">
                Be part of Africa's<br /><span className="text-red-600">communication future</span>
              </h2>
              <p className="font-['Plus_Jakarta_Sans'] text-base text-white/45 leading-relaxed max-w-md mx-auto mb-10">
                Thousands of developers already ship with Drop APHI. Start free — no credit card required.
              </p>
              <div className="flex gap-3.5 justify-center flex-wrap">
                <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-lg font-['Bricolage_Grotesque'] font-bold text-base hover:bg-red-700 transition-all">
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <Link href="/blog" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-lg font-['Bricolage_Grotesque'] font-bold text-base hover:bg-gray-100 transition-all">
                  Read the Blog
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}