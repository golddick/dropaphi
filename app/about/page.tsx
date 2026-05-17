

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MapPin, Users, Zap, Globe, Shield, BarChart3, Headphones, Clock, Heart } from 'lucide-react';
import Navigation from '@/components/landingpage/Navigation';
import { useAuthStore } from '@/lib/stores/auth';
import Footer from '@/components/landingpage/Footer';
import { Ticker } from '@/components/landingpage/home';
import CTASection from '@/components/landingpage/CTASection';


/* ── Stats SVG card ── */
function StatsCard() {
  return (
    <div className="bg-background rounded-xl overflow-hidden">
      <svg viewBox="0 0 420 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Main background */}
        <rect width="420" height="460" rx="20" className="fill-card"/>
        
        {/* Red top accent */}
        <rect width="420" height="4" rx="2" fill="url(#sg1)"/>
        <defs>
          <linearGradient id="sg1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#DC143C"/>
            <stop offset="100%" stopColor="#ff6b6b"/>
          </linearGradient>
        </defs>

        {/* Header */}
        <g className="fill-foreground">
          <text x="28" y="48" fontFamily="sans-serif" fontSize="13" fontWeight="bold">Company at a Glance</text>
        </g>
        <g className="fill-muted-foreground">
          <text x="28" y="66" fontFamily="monospace" fontSize="10">March 2025</text>
        </g>

        {/* Stat blocks */}
        {[
          { label: 'FOUNDED',          val: '2025',        sub: 'Lagos, Nigeria',    color: '#DC143C', y: 96  },
          { label: 'CUSTOMERS',        val: '5,000+',      sub: 'Active businesses', color: '#3B82F6', y: 180 },
          { label: 'MESSAGES',         val: '1M+',         sub: 'All channels',      color: '#22C55E', y: 264 },
          { label: 'UPTIME SLA',       val: '99.9%',       sub: 'Enterprise grade',  color: '#F97316', y: 348 },
        ].map(({ label, val, sub, color, y }) => (
          <g key={label}>
            {/* Stat card background */}
            <rect x="20" y={y} width="380" height="68" rx="10" className="fill-muted stroke-border" strokeWidth="1"/>
            
            {/* Left color accent bar */}
            <rect x="20" y={y} width="4" height="68" rx="2" fill={color}/>
            
            {/* Label */}
            <text x="36" y={y + 22} fontFamily="monospace" fontSize="8.5" letterSpacing="1" className="fill-muted-foreground">{label}</text>
            
            {/* Value */}
            <text x="36" y={y + 48} fontFamily="sans-serif" fontSize="24" fontWeight="800" className="fill-foreground">{val}</text>
            
            {/* Subtitle */}
            <text x="36" y={y + 63} fontFamily="sans-serif" fontSize="10" className="fill-muted-foreground">{sub}</text>
            
            {/* Mini sparkline chart */}
            <rect x="310" y={y + 20} width="76" height="28" rx="6" className="fill-card"/>
            <polyline
              points={`316,${y + 40} 322,${y + 35} 328,${y + 38} 334,${y + 30} 340,${y + 33} 346,${y + 26} 352,${y + 29} 358,${y + 24} 364,${y + 28} 370,${y + 22} 376,${y + 25} 382,${y + 22}`}
              stroke={color} 
              strokeWidth="1.5" 
              fill="none" 
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* HQ badge */}
        <g>
          <rect x="20" y="432" width="380" height="20" rx="6" className="fill-muted"/>
          <circle cx="32" cy="442" r="3" fill="#DC143C"/>
          <text x="40" y="446" fontFamily="monospace" fontSize="9" className="fill-muted-foreground">
            Headquarters: Lagos, Nigeria  ·  Serving 30+ African Markets
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ── Main ── */
export default function AboutPage() {
  const { user } = useAuthStore();
  
  return (
    <div className="overflow-x-hidden bg-background">
      
      <Navigation user={user} />

      {/* ── HERO — dark ── */}
      <section className="bg-background text-foreground px-6 py-24 relative overflow-hidden">
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
            <h1 className=" text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[1.07] tracking-[-0.035em] mb-6">
              Built in Africa,
              <br />
              <span className="text-red-600">For Africa.</span>
            </h1>
            <p className=" text-lg text-white/55 leading-relaxed max-w-xl">
              DropAPHI was founded with one mission: to make reliable infrastructure accessible to every developer and business building on the continent.
            </p>
          </motion.div>
        </div>
      </section>

      <Ticker />

      {/* ── STORY — white ── */}
      <section className="bg-background text-foreground px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 font-mono text-xs uppercase tracking-wider text-gray-600 mb-5">
                Origin
              </div>
              <h2 className=" text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-tight text-foreground leading-tight mb-5">
                Started as a small project,<br /><span className="text-red-600">now serving thousands</span>
              </h2>
              <p className=" text-base text-muted-foreground leading-relaxed mb-5">
                We built DropAPHI after experiencing firsthand how fragmented and unreliable communication tools were for African developers. Global providers charged international rates, delivered inconsistently, and had zero understanding of local carrier dynamics.
              </p>
              <p className=" text-base text-muted-foreground leading-relaxed mb-5">
                So we built our own from the ground up, with direct carrier partnerships across 30+ African markets, local routing intelligence, and a developer experience that actually makes sense.
              </p>
              <p className=" text-base text-muted-foreground leading-relaxed mb-9">
                Today DropAPHI powers communication for e-commerce platforms, fintech companies, healthcare providers, and SaaS products across the continent.
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
      <section className="bg-background px-6 py-24 border-t border-b border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }} className="mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200  text-xs uppercase tracking-wider text-gray-600 mb-4">
              The Problem
            </div>
            <h2 className=" text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-tight text-foreground max-w-lg leading-tight">
              Why Africa needed our native solution
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { n: '01', title: 'Unreliable Delivery', desc: 'Global providers failed to deliver consistently across African carriers and networks.' },
              { n: '02', title: 'Prohibitive Costs', desc: 'International rates made infrastructure costs unsustainable for growing local businesses.' },
              { n: '03', title: 'Zero Local Support', desc: 'No understanding of African timezones, local regulations, or regional carrier requirements.' },
              { n: '04', title: 'Complex Integration', desc: 'Fragmented vendor landscape meant stitching 4–5 SDKs together just to develop.' },
              { n: '05', title: 'No Regulatory Fit', desc: 'Foreign platforms lacked awareness of GDPR-Africa, and local compliance needs.' },
              { n: '06', title: 'Everything Siloed', desc: 'SMS, Email, OTP, Storage — no single provider offered them all. Until now.' },
            ].map(({ n, title, desc }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                viewport={{ once: true }}
                className="bg-background border border-border rounded-xl p-7 hover:border-red-300 hover:shadow-xl hover:-translate-y-1 transition-all relative"
              >
                <span className=" absolute top-4 right-5 text-3xl font-black text-destructive tracking-tighter">{n}</span>
                <div className="w-1 h-9 bg-red-600 rounded mb-4" />
                <h3 className=" text-base font-bold text-foreground mb-2.5">{title}</h3>
                <p className=" text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES — dark ── */}
      <section className="bg-background text-foreground px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }} className="mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-900/20 border border-red-800/30  text-xs uppercase tracking-wider text-red-400 mb-4">
              Our Values
            </div>
            <h2 className=" text-[clamp(2rem,4vw,2.8rem)] font-extrabold tracking-tight leading-tight max-w-md">
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
                className="bg-card border border-border rounded-xl p-7 hover:border-red-600/40 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="w-11 h-11 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600 mb-4.5">
                  {v.icon}
                </div>
                <h3 className=" text-base text-foreground font-bold mb-2.5">{v.title}</h3>
                <p className=" text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM QUOTE — white ── */}
      <section className="bg-background text-foreground px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs uppercase tracking-wider text-red-600 mb-8">
              From the Founders
            </div>
            <blockquote className=" text-[clamp(1.5rem,3.5vw,2.4rem)] font-bold text-muted-foreground leading-tight tracking-tight mb-10">
              "Africa doesn't need adapted tools. It needs tools that were built here, for here with the nuance and depth that only comes from facing the problem yourself."
            </blockquote>
            <div className="flex items-center gap-3.5 justify-center">
              <div className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center font-extrabold text-base text-white shrink-0">
                G
              </div>
              <div className="text-left">
                <p className=" font-bold text-sm text-foreground">Goldick</p>
                <p className=" text-xs text-muted-foreground">Founder & CEO, DropAPHI</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA — dark ── */}
      <CTASection />
     

      <Footer />
    </div>
  );
}