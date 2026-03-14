'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Clock, Share2, Bookmark, Twitter, Copy } from 'lucide-react';
import Footer from '@/components/landingpage/Footer';
import { useAuthStore } from '@/lib/stores/auth';
import Navigation from '@/components/landingpage/Navigation';

/* ── Article SVG hero image ── */
function ArticleHeroImage() {
  return (
    <svg viewBox="0 0 1000 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto rounded-2xl">
      <rect width="1000" height="420" rx="16" fill="#0A0A0A"/>
      {/* Grid */}
      {[...Array(20)].map((_,i) => (
        <line key={i} x1={i*56} y1="0" x2={i*56} y2="420" stroke="#DC143C" strokeWidth="0.4" opacity="0.08"/>
      ))}
      {[...Array(8)].map((_,i) => (
        <line key={i} x1="0" y1={i*60} x2="1000" y2={i*60} stroke="#DC143C" strokeWidth="0.4" opacity="0.08"/>
      ))}
      {/* Central glow */}
      <ellipse cx="500" cy="210" rx="300" ry="160" fill="rgba(220,20,60,0.07)"/>
      {/* Signal rings */}
      <circle cx="500" cy="210" r="130" fill="none" stroke="#DC143C" strokeWidth="1" opacity="0.15"/>
      <circle cx="500" cy="210" r="90" fill="none" stroke="#DC143C" strokeWidth="1" opacity="0.2"/>
      <circle cx="500" cy="210" r="50" fill="none" stroke="#DC143C" strokeWidth="1.5" opacity="0.3"/>
      <circle cx="500" cy="210" r="14" fill="#DC143C" opacity="0.6"/>
      {/* Animated connection dots */}
      {[[200,140],[660,170],[420,100]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#DC143C" opacity="0.7">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${2+i*0.7}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      {/* Bottom label */}
      <rect x="380" y="370" width="240" height="28" rx="8" fill="#141414" stroke="#1E1E1E" strokeWidth="1"/>
      <text x="428" y="389" className="font-mono text-[11px] fill-[#DC143C]">Pan-African Network Map</text>
    </svg>
  );
}

/* ── Code block component ── */
function CodeBlock({ code, lang = 'javascript' }: { code: string; lang?: string }) {
  const lines = code.trim().split('\n');
  return (
    <div className="bg-black rounded-xl overflow-hidden border border-gray-900 my-7">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-900">
        <div className="flex gap-1.5">
          {['#FF5F57','#FEBC2E','#28C840'].map(c => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }}/>
          ))}
        </div>
        <span className="font-mono text-xs text-[#444]">{lang}</span>
      </div>
      <div className="p-5 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="text-[#2A2A2A] select-none mr-5 min-w-[20px] text-right flex-shrink-0">{i + 1}</span>
            <span 
              className="text-[#CDD6F4]" 
              dangerouslySetInnerHTML={{ __html:
                line
                  .replace(/('.*?')/g, '<span style="color:#A6E3A1">$1</span>')
                  .replace(/(\/\/.*)/g, '<span style="color:#444">$1</span>')
                  .replace(/\b(const|let|var|import|from|await|async|return|new)\b/g, '<span style="color:#C792EA">$1</span>')
                  .replace(/\b(drop|client)\b/g, '<span style="color:#82AAFF">$1</span>')
                  .replace(/\b(DropAPI|send|verify|upload)\b/g, '<span style="color:#FFCB6B">$1</span>')
                  .replace(/\b(sms|email|otp|storage|push)\b/g, '<span style="color:#C3E88D">$1</span>')
              }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Related posts ── */
const RELATED = [
  { slug: 'introducing-dropid-readable-database-ids', tag: 'Product', tagColor: '#3B82F6', title: 'Introducing DropID: Human-Readable Database IDs', date: 'Feb 28, 2025', readTime: '5 min read' },
  { slug: 'otp-delivery-latency-africa', tag: 'Engineering', tagColor: '#DC143C', title: 'How We Cut OTP Delivery Latency to Under 1 Second Across Africa', date: 'Feb 15, 2025', readTime: '6 min read' },
  { slug: 'building-fintech-sms-alerts-nigeria', tag: 'Tutorials', tagColor: '#22C55E', title: 'Building Real-Time Transaction Alerts for Fintech Apps in Nigeria', date: 'Jan 30, 2025', readTime: '10 min read' },
];

/* ── Main article page ── */
export default function BlogPostPage() {
  const { user } = useAuthStore();

  return (
    <div className="overflow-x-hidden bg-white">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');
        
        .prose-article p { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.05rem; color: #444; line-height: 1.9; margin-bottom: 20px; }
        .prose-article h2 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 1.6rem; color: #0A0A0A; margin: 44px 0 18px; letter-spacing: -0.025em; line-height: 1.2; }
        .prose-article h3 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 1.2rem; color: #0A0A0A; margin: 32px 0 14px; letter-spacing: -0.02em; }
        .prose-article ul { padding-left: 0; margin-bottom: 20px; list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .prose-article li { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.02rem; color: #444; line-height: 1.8; display: flex; gap: 10px; align-items: flex-start; }
        .prose-article li::before { content: ''; display: block; width: 6px; height: 6px; border-radius: 50%; background: #DC143C; margin-top: 9px; flex-shrink: 0; }
        .prose-article blockquote { border-left: 3px solid #DC143C; padding: 16px 24px; background: rgba(220,20,60,0.04); border-radius: 0 10px 10px 0; margin: 28px 0; }
        .prose-article blockquote p { color: #333; font-style: italic; font-size: 1.08rem; margin: 0; }
        .share-btn { display: flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 8px; border: 1px solid #EBEBEB; background: white; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 0.72rem; color: #555; transition: all 0.18s; }
        .share-btn:hover { border-color: #DC143C; color: #DC143C; }
        .related-card { text-decoration: none; display: block; transition: all 0.26s; }
        .related-card:hover { transform: translateY(-3px); }
      `}</style>
      
      <Navigation user={user} />

      {/* ── ARTICLE HEADER — dark ── */}
      <section className="bg-black text-white px-6 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-3/5 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(220,20,60,0.12)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(220,20,60,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,20,60,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Back link */}
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#555] no-underline mb-7 transition-colors hover:text-red-600"
            >
              <ArrowLeft size={14} /> Back to Blog
            </Link>

            {/* Tag + meta */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="font-mono text-xs px-3 py-1.5 rounded-full bg-red-900/20 border border-red-800/30 text-red-400">
                Engineering
              </span>
              <span className="font-mono text-xs text-[#444] flex items-center gap-1.5">
                <Clock size={11} /> 8 min read
              </span>
              <span className="font-mono text-xs text-[#444]">March 12, 2025</span>
            </div>

            {/* Title */}
            <h1 className="font-['Bricolage_Grotesque'] text-[clamp(2rem,4.5vw,3.4rem)] font-extrabold leading-[1.1] tracking-[-0.03em] mb-6">
              Why African Developers Need Communication Infrastructure Built at Home
            </h1>

            {/* Excerpt */}
            <p className="font-['Plus_Jakarta_Sans'] text-lg text-white/50 leading-relaxed max-w-2xl mb-9">
              Global messaging APIs weren't designed for African networks. Here's what we learned building for 30+ markets — and why local routing intelligence changes everything.
            </p>

            {/* Author + share */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center font-['Bricolage_Grotesque'] font-extrabold text-base text-white flex-shrink-0">
                  G
                </div>
                <div>
                  <p className="font-['Bricolage_Grotesque'] font-bold text-sm">Golddick O.</p>
                  <p className="font-mono text-xs text-[#555]">Founder & CEO, Drop APHI</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[
                  { icon: <Twitter size={13} />, label: 'Tweet' },
                  { icon: <Copy size={13} />,    label: 'Copy link' },
                  { icon: <Bookmark size={13} />, label: 'Save' },
                ].map(({ icon, label }) => (
                  <button key={label} className="share-btn">{icon} {label}</button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HERO IMAGE ── */}
      <section className="bg-white px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="-mt-8 relative z-10"
          >
            <ArticleHeroImage />
          </motion.div>
        </div>
      </section>

      {/* ── ARTICLE BODY — white ── */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-16 items-start">
          {/* ── Main content ── */}
          <motion.article
            className="prose-article"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p>
              When we started building Drop APHI, we didn't set out to build "another messaging API." We set out to solve a problem we'd felt personally — as developers building products for African users, using tools designed for European and American infrastructure.
            </p>
            <p>
              The symptoms were everywhere: OTPs that took 45 seconds to arrive (if they arrived at all), email campaigns with 30% bounce rates from misconfigured routes, file uploads that timed out because CDN nodes were in Frankfurt. Global providers had world-class infrastructure — just not here.
            </p>

            <h2>The Routing Problem Nobody Talks About</h2>
            <p>
              Most global SMS providers use a hub-and-spoke model. Your message travels from your server, to their US or EU gateway, then bounces through 2–3 carrier hops before reaching an MTN or Airtel tower in Lagos. Each hop adds latency and introduces a potential failure point.
            </p>
            <p>
              African mobile networks are incredible — over 600 million mobile subscribers, the fastest-growing digital economy in the world. But they require different routing strategies than Western carriers. Inter-network delivery (e.g., MTN Nigeria → Glo Nigeria) has its own quirks. International SMS to local numbers requires sender ID pre-registration with the NCC.
            </p>

            <blockquote>
              <p>"The tools that work perfectly in California often fail silently in Lagos. And 'silently' is the worst kind of failure for an OTP that's blocking your user's checkout."</p>
            </blockquote>

            <h2>Building Direct Carrier Relationships</h2>
            <p>
              Our first six months were spent not writing code, but flying to carrier offices. MTN in Lagos, Safaricom in Nairobi, Vodafone in Accra. We negotiated direct peering agreements that bypass the global gateway model entirely.
            </p>
            <p>The result was dramatic:</p>
            <ul>
              <li>OTP delivery time dropped from avg. 12 seconds to under 900ms</li>
              <li>Delivery rate across tier-1 African carriers went from 87% to 99.2%</li>
              <li>Inter-network routing became deterministic rather than probabilistic</li>
              <li>Local sender ID registration compliance went from optional to automated</li>
            </ul>

            <h2>What This Means for Your Code</h2>
            <p>
              The beauty is that none of this complexity surfaces in the API. You write one line to send an SMS, and the routing intelligence runs silently underneath.
            </p>

            <CodeBlock lang="javascript" code={`import { DropAPI } from '@dropaphi/sdk'

const drop = new DropAPI({ apiKey: process.env.DROP_API_KEY })

// Drop APHI automatically routes via the optimal
// carrier path for this destination number
const result = await drop.sms.send({
  to: '+2348012345678',
  message: 'Your verification code is 8291',
  // Optional: force a specific carrier route
  // routePreference: 'direct'
})

console.log(result.deliveredAt)  // typically < 1 second
console.log(result.carrier)       // 'MTN Nigeria'
console.log(result.route)         // 'direct'`} />

            <p>
              The SDK detects the destination carrier automatically, selects the optimal route from our routing table, and falls back gracefully if a route degrades — all without you changing a line of code.
            </p>

            <h2>The Unified API Advantage</h2>
            <p>
              Beyond SMS, the same principle applies to every channel. Instead of three separate SDKs with three different authentication patterns, three different webhook schemas, and three separate dashboards — everything lives under one API key:
            </p>

            <CodeBlock lang="javascript" code={`const drop = new DropAPI({ apiKey: 'sk_live_...' })

// SMS - direct carrier routing
await drop.sms.send({ to, message })

// Email - optimized for African inbox placement
await drop.email.send({ to, subject, html })

// OTP - multi-channel with automatic fallback
await drop.otp.send({ phone, channel: 'sms' })

// File storage - edge delivery from African nodes
await drop.storage.upload({ file, path: 'invoices/q3.pdf' })

// All tracked in one dashboard, one bill, one SDK`} />

            <h2>What We're Building Next</h2>
            <p>
              Push notifications are coming to Drop APHI in Q2 2025. We've taken the same approach: direct integrations with regional Android manufacturers (Tecno, Itel, Infinix) that dominate African markets, alongside standard APNs and FCM support.
            </p>
            <p>
              The goal has never been to be another Twilio with an African flag on the pricing page. We're building infrastructure from the inside out — starting with the realities of African networks, carriers, regulations, and users.
            </p>

            {/* Article footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-['Bricolage_Grotesque'] font-extrabold text-lg text-white flex-shrink-0">
                  G
                </div>
                <div>
                  <p className="font-['Bricolage_Grotesque'] font-bold text-base text-gray-900">Golddick O.</p>
                  <p className="font-['Plus_Jakarta_Sans'] text-sm text-gray-500">Founder & CEO at Drop APHI. Prev. engineering at Paystack. Building Africa's communication stack from Lagos.</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[['SMS API', '#DC143C'], ['Infrastructure', '#3B82F6'], ['Africa', '#22C55E'], ['Routing', '#F97316']].map(([tag, color]) => (
                  <span 
                    key={tag} 
                    className="font-mono text-xs px-3 py-1.5 rounded-full"
                    style={{ 
                      background: `${color}0D`, 
                      border: `1px solid ${color}25`,
                      color 
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>

          {/* ── Sidebar ── */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="sticky top-20 hidden lg:block"
          >
            {/* Table of contents */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <p className="font-['Bricolage_Grotesque'] font-bold text-sm text-gray-900 mb-4">In this article</p>
              <div className="flex flex-col gap-2.5">
                {[
                  'The Routing Problem Nobody Talks About',
                  'Building Direct Carrier Relationships',
                  'What This Means for Your Code',
                  'The Unified API Advantage',
                  'What We\'re Building Next',
                ].map((h, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className="font-['Plus_Jakarta_Sans'] text-xs text-gray-500 no-underline leading-tight py-1 pl-2.5 transition-all hover:text-red-600"
                    style={{ borderLeft: i === 0 ? '2px solid #DC143C' : '2px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#DC143C'; e.currentTarget.style.borderLeftColor = '#DC143C'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#777'; e.currentTarget.style.borderLeftColor = i === 0 ? '#DC143C' : 'transparent'; }}
                  >
                    {h}
                  </a>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-black rounded-xl p-6 border border-red-600/20">
              <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center font-['Bricolage_Grotesque'] font-extrabold text-base text-white mb-3.5">
                D
              </div>
              <p className="font-['Bricolage_Grotesque'] font-bold text-sm text-white mb-2">Try Drop APHI Free</p>
              <p className="font-['Plus_Jakarta_Sans'] text-xs text-white/45 leading-relaxed mb-4">
                One API key. SMS, Email, OTP, Storage. Start building today.
              </p>
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-['Bricolage_Grotesque'] font-bold text-xs hover:bg-red-700 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* ── RELATED POSTS — off-white ── */}
      <section className="bg-gray-50 px-6 py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 font-mono text-xs uppercase tracking-wider text-gray-600 mb-6">
            More from the blog
          </div>
          <h2 className="font-['Bricolage_Grotesque'] text-3xl font-extrabold tracking-tight text-gray-900 mb-10">
            Keep reading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RELATED.map((post, i) => (
              <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.08 }} viewport={{ once: true }}>
                <Link href={`/blog/${post.slug}`} className="related-card">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <span 
                      className="font-mono text-xs px-2.5 py-1 rounded-full inline-block mb-3.5"
                      style={{ 
                        background: `${post.tagColor}10`, 
                        border: `1px solid ${post.tagColor}25`,
                        color: post.tagColor 
                      }}
                    >
                      {post.tag}
                    </span>
                    <h3 className="font-['Bricolage_Grotesque'] text-sm font-bold text-gray-900 leading-tight tracking-tight mb-4">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {post.readTime}
                      </span>
                      <span className="font-mono text-xs text-gray-400">{post.date}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER — dark ── */}
      <section className="bg-black px-6 py-20">
        <div className="max-w-lg mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-900/20 border border-red-800/30 font-mono text-xs uppercase tracking-wider text-red-400 mb-5">
              Newsletter
            </div>
            <h2 className="font-['Bricolage_Grotesque'] text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold tracking-tight leading-tight text-white mb-3.5">
              Get the next article<br /><span className="text-red-600">in your inbox</span>
            </h2>
            <p className="font-['Plus_Jakarta_Sans'] text-sm text-white/45 leading-relaxed mb-7">
              No spam. One email per week at most. Unsubscribe anytime.
            </p>
            <div className="flex gap-2.5 max-w-md mx-auto flex-wrap">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="flex-1 min-w-[200px] px-4 py-3 rounded-lg bg-[#141414] border border-[#222] text-white font-['Plus_Jakarta_Sans'] text-sm outline-none" 
              />
              <button className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg font-['Bricolage_Grotesque'] font-bold hover:bg-red-700 transition-all flex-shrink-0">
                Subscribe <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}