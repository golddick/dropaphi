// 'use client';

// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import { ArrowRight, Play, CheckCircle, MessageSquare, Mail, Bell, HardDrive, Shield } from 'lucide-react';
// import { DashboardMockup } from './home';

// const SERVICES = [
//   { icon: <MessageSquare size={13} />, label: 'SMS', color: '#DC143C', soon: false },
//   { icon: <Mail size={13} />, label: 'Email', color: '#3B82F6', soon: false },
//   { icon: <Shield size={13} />, label: 'OTP / 2FA', color: '#22C55E', soon: false },
//   { icon: <HardDrive size={13} />, label: 'File Storage', color: '#F97316', soon: false },
//   { icon: <Bell size={13} />, label: 'Blog', color: '#A855F7', soon: true },
// ];

// export default function HeroSection() {
//   return (
//     <section className="bg-background relative overflow-hidden">
//       {/* BG layers */}
//       <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.07)_1px,transparent_1px)] bg-size-[28px_28px]" />
//       <div className="absolute top-20 left-1/2 -translate-x-1/2 w-175 h-115 bg-[radial-gradient(ellipse_at_center,rgba(220,20,60,0.055)_0%,transparent_65%)] pointer-events-none" />
//       <div className="absolute -bottom-15 left-1/2 -translate-x-1/2 w-225 h-125 bg-[radial-gradient(ellipse_at_center,rgba(220,20,60,0.08)_0%,transparent_68%)] pointer-events-none" />

//       <div className="max-w-7xl mx-auto px-6 pt-20 relative z-10">
//         {/* ── COPY BLOCK ── */}
//         <motion.div
//           initial={{ opacity: 0, y: 28 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
//           className="text-center max-w-4xl mx-auto"
//         >
//           {/* Live badge */}
//           <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 font-mono text-[0.71rem] text-red-600 uppercase mb-6">
//             <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
//             v0.5 — Live &amp; Production Ready
//           </div>

//           {/* Headline */}
//           <h1 className="font-['Bricolage_Grotesque'] font-extrabold text-[clamp(2.5rem,5.5vw,4.6rem)] leading-[1.07] tracking-[-0.035em] text-gray-900 mb-5">
//             Stop Installing{' '}
//             <span className="text-red-600">Five</span>
//             <br />
//             Infrastructures.{' '}
//             <span className="text-red-600">Use One.</span>
//           </h1>

//           {/* Sub-headline */}
//           <p className="font-['Plus_Jakarta_Sans'] text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8">
//             SMS · Email · OTP · File Storage · Push — everything your app needs to
//             communicate, on a{' '}
//             <strong className="text-gray-900 font-semibold">single API key.</strong>
//             {' '}No juggling vendors. No stitching SDKs.
//           </p>

//           {/* Service pills */}
//           <div className="flex flex-wrap gap-2 justify-center mb-8">
//             {SERVICES.map(({ icon, label, color, soon }, i) => (
//               <motion.div
//                 key={label}
//                 className={`
//                   inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs border
//                   transition-all duration-200 cursor-default hover:-translate-y-0.5 hover:shadow-md
//                   ${soon ? 'bg-gray-50 border-gray-200 text-gray-400 opacity-70' : 'bg-opacity-5'}
//                 `}
//                 style={{
//                   backgroundColor: soon ? undefined : `${color}07`,
//                   borderColor: soon ? undefined : `${color}28`,
//                   color: soon ? undefined : color,
//                 }}
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4 + i * 0.07 }}
//               >
//                 {icon}
//                 {label}
//                 {soon ? (
//                   <span className="text-[0.58rem] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 font-mono tracking-wide">
//                     SOON
//                   </span>
//                 ) : (
//                   <CheckCircle size={10} style={{ color, opacity: 0.65 }} />
//                 )}
//               </motion.div>
//             ))}
//           </div>

//           {/* CTA row */}
//           <div className="flex gap-3 justify-center flex-wrap mb-10">
//             <Link
//               href="/auth/signup"
//               className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-red-600 text-white font-['Bricolage_Grotesque'] font-bold text-sm shadow-md hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
//             >
//               Get Started <ArrowRight size={15} />
//             </Link>
//             <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-transparent border-2 border-gray-200 text-gray-800 font-['Bricolage_Grotesque'] font-semibold text-sm hover:border-red-600 hover:text-red-600 transition-all duration-200">
//               <Play size={13} className="fill-red-600 text-red-600" />
//               See it in action
//             </button>
//           </div>

//           {/* Stat strip */}
//           <motion.div
//             className="flex bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm max-w-2xl mx-auto mb-14"
//             initial={{ opacity: 0, y: 14 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55, duration: 0.6 }}
//           >
//             {[
//               ['1,00+', 'Businesses'],
//               ['28k+',  'Messages sent'],
//               ['99.9%',  'Uptime SLA'],
//               ['<50ms',  'Avg latency'],
//             ].map(([val, lbl], i, arr) => (
//               <div key={lbl} className="flex-1 text-center py-4 px-2.5">
//                 <div className="font-['Bricolage_Grotesque'] font-extrabold text-xl text-gray-900 tracking-tight">{val}</div>
//                 <div className="font-mono text-[0.62rem] text-gray-300 uppercase tracking-wide mt-0.5">{lbl}</div>
//               </div>
//             ))}
//           </motion.div>
//         </motion.div>

//         {/* ── DASHBOARD SVG ── */}
//         <motion.div
//           initial={{ opacity: 0, y: 64 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.05, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
//           className="relative max-w-6xl mx-auto"
//         >
//           {/* Floating status chips */}
//           <motion.div
//             className="absolute bg-white border border-gray-100 rounded-lg p-2.5 shadow-lg items-center gap-1.5 z-10 hidden md:flex"
//             style={{ top: 44, left: -8 }}
//             animate={{ y: [0, -9, 0] }}
//             transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
//           >
//             <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
//             <span className="font-mono text-xs text-gray-700">99.2% delivery rate</span>
//           </motion.div>

//           <motion.div
//             className="absolute bg-white border border-gray-100 rounded-lg p-2.5 shadow-lg items-center gap-1.5 z-10 hidden md:flex"
//             style={{ top: 88, right: -8 }}
//             animate={{ y: [0, 9, 0] }}
//             transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
//           >
//             <span className="text-base leading-none">⚡</span>
//             <span className="font-mono text-xs text-gray-700">47ms avg latency</span>
//           </motion.div>

//           <motion.div
//             className="absolute bg-white border border-gray-100 rounded-lg p-2.5 shadow-lg items-center gap-1.5 z-10 hidden md:flex"
//             style={{ bottom: 130, left: 32 }}
//             animate={{ y: [0, -6, 0] }}
//             transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2.2 }}
//           >
//             <CheckCircle size={13} className="text-red-600 shrink-0" />
//             <span className="font-mono text-xs text-gray-700">SMS delivered · 2m ago</span>
//           </motion.div>

//           <motion.div
//             className="absolute bg-white border border-gray-100 rounded-lg p-2.5 shadow-lg items-center gap-1.5 z-10 hidden md:flex"
//             style={{ bottom: 160, right: 32 }}
//             animate={{ y: [0, 7, 0] }}
//             transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
//           >
//             <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
//             <span className="font-mono text-xs text-gray-700">Email campaign queued</span>
//           </motion.div>

//           {/* The dashboard */}
//           <div className="rounded-t-2xl overflow-hidden border border-gray-200 border-b-0 shadow-[-2px_0_0_0_rgba(220,20,60,0.13),-8px_0_40px_rgba(220,20,60,0.07),0_24px_80px_rgba(0,0,0,0.1)]">
//             <DashboardMockup />
//           </div>

//           {/* Fade to white at bottom */}
//           <div className="h-20 -mt-20 relative z-5 bg-linear-to-b from-transparent to-white" />
//         </motion.div>
//       </div>
//     </section>
//   );
// }





'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Play,
  CheckCircle,
  MessageSquare,
  Mail,
  Bell,
  HardDrive,
  Shield,
  Zap,
} from 'lucide-react';
import { DashboardMockup } from './home';

/* ─── Data ─────────────────────────────────────────────────── */

const SERVICES = [
  { icon: <MessageSquare size={12} />, label: 'SMS',          color: '#ef4444', soon: false },
  { icon: <Mail         size={12} />, label: 'Email',        color: '#3b82f6', soon: false },
  { icon: <Shield       size={12} />, label: 'OTP / 2FA',    color: '#22c55e', soon: false },
  { icon: <HardDrive    size={12} />, label: 'File Storage', color: '#f97316', soon: false },
  { icon: <Bell         size={12} />, label: 'Push / Blog',  color: '#a855f7', soon: true  },
];

// Category labels — no real brand names (avoids trademark / disparagement risk)
const VENDORS: { label: string; icon: string }[] = [
  { label: 'SMS Provider',    icon: '💬' },
  { label: 'Email Service',   icon: '📧' },
  { label: 'Auth & OTP',      icon: '🔐' },
  { label: 'Cloud Storage',   icon: '☁️'  },
  { label: '2FA Platform',    icon: '🛡️'  },
];

const STATS: [string, string][] = [
  ['100+',  'Businesses'],
  ['28k+',  'Messages sent'],
  ['99.9%', 'Uptime SLA'],
  ['<50ms', 'Avg latency'],
];

const FLOAT_CHIPS = [
  { pos: 'top-11 left-[-8px]',    dot: '#22c55e', text: '99.2% delivery rate',      delay: 0,   dir: -9 },
  { pos: 'top-22 right-[-8px]',   dot: '#3b82f6', text: '47ms avg latency',         delay: 1.1, dir: 9  },
  { pos: 'bottom-32 left-8',      dot: '#DC143C', text: 'SMS delivered · 2m ago',   delay: 2.2, dir: -6 },
  { pos: 'bottom-40 right-8',     dot: '#3b82f6', text: 'Email campaign queued',    delay: 0.6, dir: 7  },
];

/* ─── Code-rain canvas ──────────────────────────────────────── */

const CODE_CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノ' +
  '01{}[];()=>const let async await fetch POST GET ' +
  'import export function return if else for while ' +
  'true false null undefined API_KEY .send() .verify() .upload() SMS OTP 200 404 Bearer ';

function useCodeRain(ref: React.RefObject<HTMLCanvasElement | null>, containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const canvas = ref.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    const chars = CODE_CHARS.split('');
    const fontSize = 13;
    let drops: number[] = [];
    let animId: number;

    function resize() {
      canvas!.width  = container!.offsetWidth;
      canvas!.height = container!.offsetHeight;
      const cols = Math.floor(canvas!.width / (fontSize * 0.65));
      drops = Array.from({ length: cols }, () =>
        Math.floor(Math.random() * (-canvas!.height / fontSize))
      );
    }

    function draw() {
      // Trail: semi-transparent background fill creates the fade-out effect
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? 'rgba(10,10,15,0.045)' : 'rgba(250,250,250,0.06)';
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const ch  = chars[Math.floor(Math.random() * chars.length)];
        const x   = i * (fontSize * 0.65);
        const y   = drops[i] * fontSize;
        const p   = y / canvas!.height;                    // 0→1 top→bottom

        if (Math.random() > 0.92) {
          // bright head flash — white in dark, deep red in light
          ctx.fillStyle = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(220,20,60,0.9)';
        } else if (isDark) {
          const r = Math.round(180 + 75 * p);
          const g = Math.round(20  + 10 * (1 - p));
          const b = Math.round(30  + 20 * (1 - p));
          ctx.fillStyle = `rgba(${r},${g},${b},${0.28 + 0.55 * p})`;
        } else {
          // Light mode: muted red → dark red as it falls
          const alpha = 0.06 + 0.22 * p;
          ctx.fillStyle = `rgba(220,20,60,${alpha})`;
        }

        ctx.fillText(ch, x, y);
        if (y > canvas!.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [ref, containerRef]);
}

/* ─── Component ─────────────────────────────────────────────── */

export default function HeroSection() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const sectionRef   = useRef<HTMLElement>(null);

  useCodeRain(canvasRef, sectionRef);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-background"
    >
      {/* ── Code-rain canvas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-[0.22] dark:opacity-[0.18] pointer-events-none"
      />

      {/* ── Radial colour overlays — light & dark variants ── */}
      <div className="absolute inset-0 pointer-events-none dark:[background:radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(220,20,60,0.13)_0%,transparent_65%),radial-gradient(ellipse_100%_50%_at_50%_100%,rgba(220,20,60,0.09)_0%,transparent_68%),linear-gradient(180deg,rgba(10,10,15,0.05)_0%,rgba(10,10,15,0.65)_80%,rgba(10,10,15,1)_100%)] [background:radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(220,20,60,0.06)_0%,transparent_65%),radial-gradient(ellipse_100%_50%_at_50%_100%,rgba(220,20,60,0.04)_0%,transparent_68%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.5)_80%,rgba(255,255,255,1)_100%)]" />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">

        {/* Copy block */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-4xl mx-auto"
        >

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
            bg-red-50 dark:bg-red-950/50
            border border-red-200 dark:border-red-800/40
            text-[0.68rem] text-red-600 dark:text-red-400
            uppercase tracking-widest mb-7">
            <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            v1.0 — Live &amp; Production Ready
          </div>

          {/* Headline */}
          <h1 className="
            font-extrabold
            text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.06] tracking-[-0.035em]
            text-foreground mb-5">
            One API Key.<br />
            <span className="text-(--drop-red)">Multiple Services</span> Replaced.<br />
            <span className="text-(--drop-red)">Single</span> Billing.
          </h1>

          {/* Sub-headline */}
            <p className="text-base md:text-[1.05rem]
            text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-7">
            A unified infrastructure platform delivering{' '}
            <strong className="text-foreground font-semibold">SMS, Email, OTP/2FA,
            and File Storage</strong>{' '}under a{' '}
            <strong className="text-foreground font-semibold">single API key</strong>.
            Ship faster. Sleep better.
          </p>

          {/* Category replacement strip — safe, no brand names */}
          <div className="flex flex-wrap items-center gap-2 justify-center mb-7">
            <span className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-widest">
              Replaces your
            </span>
            {VENDORS.map(({ label, icon }) => (
              <span key={label}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                  border border-border bg-muted
                  text-[0.65rem] text-muted-foreground
                  line-through decoration-(--drop-red)/40">
                <span className="not-italic no-underline">{icon}</span>
                {label}
              </span>
            ))}
            <span className="text-(--drop-red) font-bold text-sm">→</span>
            <span className="px-3 py-1 rounded-full
              border border-(--drop-red)/30
              bg-red-50 dark:bg-red-950/40
               text-[0.65rem] text-(--drop-red) font-medium">
              ✦ One integration
            </span>
          </div>

          {/* Service pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {SERVICES.map(({ icon, label, color, soon }, i) => (
              <motion.div
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  text-xs border transition-all duration-200 cursor-default
                  hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  backgroundColor: soon ? 'color-mix(in srgb, var(--muted) 80%, transparent)' : `${color}12`,
                  borderColor:     soon ? 'var(--border)'                                       : `${color}35`,
                  color:           soon ? 'var(--muted-foreground)'                             : color,
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
              >
                {icon}
                {label}
                {soon ? (
                  <span className="text-[0.55rem] px-1.5 py-0.5 rounded-full
                    bg-muted text-muted-foreground font-mono tracking-wider">
                    SOON
                  </span>
                ) : (
                  <CheckCircle size={9} style={{ color, opacity: 0.65 }} />
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex gap-3 justify-center flex-wrap mb-10">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg
                bg-red-600 text-white  font-bold text-sm
                shadow-[0_0_0_0_rgba(220,20,60,0.4)]
                hover:bg-red-700 hover:-translate-y-0.5
                hover:shadow-[0_8px_24px_rgba(220,20,60,0.35)]
                transition-all duration-200"
            >
              Get Started Free <ArrowRight size={14} />
            </Link>

             <Link
              href="/in-action">
             <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
              bg-transparent border border-border text-muted-foreground font-semibold text-sm
              hover:border-(--drop-red)/50 hover:text-(--drop-red) transition-all duration-200">
              <Play size={12} className="fill-red-500 text-red-500" />
              See it in action
            </button>
            </Link>
          </div>

          {/* Stat strip */}
          <motion.div
            className="grid grid-cols-4 rounded-xl overflow-hidden
              border border-border bg-card/60
              backdrop-blur-sm max-w-xl mx-auto mb-14"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            {STATS.map(([val, lbl], i) => (
              <div key={lbl}
                className={`text-center py-4 px-2.5 ${i < STATS.length - 1 ? 'border-r border-border' : ''}`}>
                <div className=" font-extrabold text-xl
                  text-foreground tracking-tight">
                  {val}
                </div>
                <div className=" text-[0.58rem] text-muted-foreground/50 uppercase
                  tracking-widest mt-1">
                  {lbl}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 64 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.05, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Floating status chips */}
          {FLOAT_CHIPS.map(({ pos, dot, text, delay, dir }, i) => (
            <motion.div
              key={i}
              className={`absolute ${pos}
                bg-card/90 border border-border
                backdrop-blur-md rounded-lg p-2.5 shadow-lg
                items-center gap-1.5 z-10 hidden md:flex`}
              animate={{ y: [0, dir, 0] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay }}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
              <span className="font-mono text-[0.65rem] text-foreground/70">{text}</span>
            </motion.div>
          ))}

          {/* Dashboard frame */}
          <div className="rounded-t-2xl overflow-hidden border border-border border-b-0
            shadow-[-2px_0_0_0_rgba(220,20,60,0.13),-8px_0_40px_rgba(220,20,60,0.07),0_24px_80px_rgba(0,0,0,0.15)]">
            <DashboardMockup />
          </div>

          {/* Fade to background colour at bottom */}
          <div className="h-20 -mt-20 relative z-5 bg-linear-to-b from-transparent to-background" />
        </motion.div>

      </div>
    </section>
  );
}







// 'use client';

// import { useEffect, useRef } from 'react';
// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import {
//   ArrowRight,
//   Play,
//   CheckCircle,
//   MessageSquare,
//   Mail,
//   Bell,
//   HardDrive,
//   Shield,
//   Zap,
// } from 'lucide-react';
// import { DashboardMockup } from './home';

// /* ─── Data ─────────────────────────────────────────────────── */

// const SERVICES = [
//   { icon: <MessageSquare size={12} />, label: 'SMS',          color: '#ef4444', soon: false },
//   { icon: <Mail         size={12} />, label: 'Email',        color: '#3b82f6', soon: false },
//   { icon: <Shield       size={12} />, label: 'OTP / 2FA',    color: '#22c55e', soon: false },
//   { icon: <HardDrive    size={12} />, label: 'File Storage', color: '#f97316', soon: false },
//   { icon: <Bell         size={12} />, label: 'Push / Blog',  color: '#a855f7', soon: true  },
// ];

// const VENDORS = ['Twilio', 'SendGrid', 'Firebase', 'AWS S3', 'Authy'];

// const STATS: [string, string][] = [
//   ['100+',  'Businesses'],
//   ['28k+',  'Messages sent'],
//   ['99.9%', 'Uptime SLA'],
//   ['<50ms', 'Avg latency'],
// ];

// const FLOAT_CHIPS = [
//   { pos: 'top-11 left-[-8px]',    dot: '#22c55e', text: '99.2% delivery rate',      delay: 0,   dir: -9 },
//   { pos: 'top-22 right-[-8px]',   dot: '#3b82f6', text: '47ms avg latency',         delay: 1.1, dir: 9  },
//   { pos: 'bottom-32 left-8',      dot: '#DC143C', text: 'SMS delivered · 2m ago',   delay: 2.2, dir: -6 },
//   { pos: 'bottom-40 right-8',     dot: '#3b82f6', text: 'Email campaign queued',    delay: 0.6, dir: 7  },
// ];

// /* ─── Code-rain canvas ──────────────────────────────────────── */

// const CODE_CHARS =
//   'アイウエオカキクケコサシスセソタチツテトナニヌネノ' +
//   '01{}[];()=>const let async await fetch POST GET ' +
//   'import export function return if else for while ' +
//   'DROPAPHI XONNECT 6THGRID ' +
//   'true false null undefined API_KEY .send() .verify() .upload() SMS OTP 200 404 Bearer ';

// function useCodeRain(ref: React.RefObject<HTMLCanvasElement | null>, containerRef: React.RefObject<HTMLElement | null>) {
//   useEffect(() => {
//     const canvas = ref.current;
//     const container = containerRef.current;
//     if (!canvas || !container) return;

//     const ctx = canvas.getContext('2d')!;
//     const chars = CODE_CHARS.split('');
//     const fontSize = 13;
//     let drops: number[] = [];
//     let animId: number;

//     function resize() {
//       canvas!.width  = container!.offsetWidth;
//       canvas!.height = container!.offsetHeight;
//       const cols = Math.floor(canvas!.width / (fontSize * 0.65));
//       drops = Array.from({ length: cols }, () =>
//         Math.floor(Math.random() * (-canvas!.height / fontSize))
//       );
//     }

//     function draw() {
//       ctx.fillStyle = 'rgba(10,10,15,0.045)';
//       ctx.fillRect(0, 0, canvas!.width, canvas!.height);
//       ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

//       for (let i = 0; i < drops.length; i++) {
//         const ch  = chars[Math.floor(Math.random() * chars.length)];
//         const x   = i * (fontSize * 0.65);
//         const y   = drops[i] * fontSize;
//         const p   = y / canvas!.height;                    // 0→1 top→bottom

//         if (Math.random() > 0.92) {
//           ctx.fillStyle = 'rgba(255,255,255,0.9)';         // bright head flash
//         } else {
//           const r = Math.round(180 + 75 * p);
//           const g = Math.round(20  + 10 * (1 - p));
//           const b = Math.round(30  + 20 * (1 - p));
//           ctx.fillStyle = `rgba(${r},${g},${b},${0.28 + 0.55 * p})`;
//         }

//         ctx.fillText(ch, x, y);
//         if (y > canvas!.height && Math.random() > 0.975) drops[i] = 0;
//         drops[i]++;
//       }

//       animId = requestAnimationFrame(draw);
//     }

//     resize();
//     draw();

//     const ro = new ResizeObserver(resize);
//     ro.observe(container);

//     return () => {
//       cancelAnimationFrame(animId);
//       ro.disconnect();
//     };
//   }, [ref, containerRef]);
// }

// /* ─── Component ─────────────────────────────────────────────── */

// export default function HeroSection() {
//   const canvasRef    = useRef<HTMLCanvasElement>(null);
//   const sectionRef   = useRef<HTMLElement>(null);

//   useCodeRain(canvasRef, sectionRef);

//   return (
//     <section
//       ref={sectionRef}
//       className="relative overflow-hidden bg-background"
//       // className="relative overflow-hidden bg-[#0a0a0f]"
//     >
//       {/* ── Code-rain canvas ── */}
//       <canvas
//         ref={canvasRef}
//         className="absolute inset-0 w-full h-full opacity-[0.18] pointer-events-none"
//       />

//       {/* ── Radial colour overlays ── */}
//       <div className="absolute inset-0 pointer-events-none"
//         style={{
//           background:
//             'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(220,20,60,0.13) 0%, transparent 65%),' +
//             'radial-gradient(ellipse 100% 50% at 50% 100%, rgba(220,20,60,0.09) 0%, transparent 68%),' +
//             'linear-gradient(180deg, rgba(10,10,15,0.05) 0%, rgba(10,10,15,0.65) 80%, rgba(10,10,15,1) 100%)',
//         }}
//       />

//       {/* ── Content ── */}
//       <div className="relative z-10 max-w-8xl mx-auto px-6 pt-20">

//         {/* Copy block */}
//         <motion.div
//           initial={{ opacity: 0, y: 28 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
//           className="text-center max-w-6xl mx-auto"
//         >

//           {/* Live badge */}
//           <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
//             bg-red-950/50 border border-red-800/40
//             text-[0.68rem] text-red-400 uppercase tracking-widest mb-7">
//             <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
//             v1.0 — Live &amp; Production Ready
//           </div>

//           {/* Headline */}
//           <h1 className=" font-extrabold
//             text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.06] tracking-[-0.035em]
//             text-zinc-100 mb-5">
//             One API Key.<br />
//             <span className="text-red-500">Multiple Vendors</span> Replaced.<br />
//             <span className="text-red-500">Single</span> Billing.
//           </h1>

//           {/* Sub-headline */}
      
//           <p className="text-base md:text-[1.05rem]
//             text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-7">
//             A unified infrastructure platform delivering{' '}
//             <strong className="text-zinc-200 font-semibold">SMS, Email, OTP/2FA,
//             and File Storage</strong>{' '}under a{' '}
//             <strong className="text-zinc-200 font-semibold">single API key</strong>.
//             Ship faster. Sleep better.
//           </p>

//           {/* Vendor replacement strip */}
//           <div className="flex flex-wrap items-center gap-2 justify-center mb-7">
//             <span className="font-mono text-[0.65rem] text-zinc-600 uppercase tracking-widest">
//               Replaces
//             </span>
//             {VENDORS.map((v) => (
//               <span key={v}
//                 className="px-2.5 py-1 rounded-full border border-white/[0.07]
//                   bg-white/[0.03] font-mono text-[0.65rem] text-zinc-500
//                   line-through decoration-red-600/40">
//                 {v}
//               </span>
//             ))}
//             <span className="text-red-500 font-bold text-sm">→</span>
//             <span className="px-3 py-1 rounded-full border border-red-700/40
//               bg-red-950/40 font-mono text-[0.65rem] text-red-400 font-medium">
//               ✦ One integration
//             </span>
//           </div>

//           {/* Service pills */}
//           <div className="flex flex-wrap gap-2 justify-center mb-8">
//             {SERVICES.map(({ icon, label, color, soon }, i) => (
//               <motion.div
//                 key={label}
//                 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
//                   font-mono text-xs border transition-all duration-200 cursor-default
//                   hover:-translate-y-0.5 hover:shadow-md"
//                 style={{
//                   backgroundColor: soon ? 'rgba(255,255,255,0.03)' : `${color}12`,
//                   borderColor:     soon ? 'rgba(255,255,255,0.08)' : `${color}35`,
//                   color:           soon ? '#52525b'                 : color,
//                 }}
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4 + i * 0.07 }}
//               >
//                 {icon}
//                 {label}
//                 {soon ? (
//                   <span className="text-[0.55rem] px-1.5 py-0.5 rounded-full
//                     bg-white/5 text-zinc-600 font-mono tracking-wider">
//                     SOON
//                   </span>
//                 ) : (
//                   <CheckCircle size={9} style={{ color, opacity: 0.65 }} />
//                 )}
//               </motion.div>
//             ))}
//           </div>

//           {/* CTA row */}
//           <div className="flex gap-3 justify-center flex-wrap mb-10">
//             <Link
//               href="/auth/signup"
//               className="inline-flex items-center gap-2 px-7 py-3 rounded-lg
//                 bg-red-600 text-white font-bold text-sm
//                 shadow-[0_0_0_0_rgba(220,20,60,0.4)]
//                 hover:bg-red-700 hover:-translate-y-0.5
//                 hover:shadow-[0_8px_24px_rgba(220,20,60,0.35)]
//                 transition-all duration-200"
//             >
//               Get Started Free <ArrowRight size={14} />
//             </Link>
//             <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
//               bg-transparent border border-white/10 text-zinc-400 font-semibold text-sm
//               hover:border-red-600/50 hover:text-red-400 transition-all duration-200">
//               <Play size={12} className="fill-red-500 text-red-500" />
//               See it in action
//             </button>
//           </div>

//           {/* Stat strip */}
//           <motion.div
//             className="grid grid-cols-4 rounded-xl overflow-hidden
//               border border-white/[0.06] bg-white/[0.025]
//               backdrop-blur-sm max-w-xl mx-auto mb-14"
//             initial={{ opacity: 0, y: 14 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55, duration: 0.6 }}
//           >
//             {STATS.map(([val, lbl], i) => (
//               <div key={lbl}
//                 className={`text-center py-4 px-2.5 ${i < STATS.length - 1 ? 'border-r border-white/[0.06]' : ''}`}>
//                 <div className="font-extrabold text-xl
//                   text-zinc-100 tracking-tight">
//                   {val}
//                 </div>
//                 <div className="font-mono text-[0.58rem] text-zinc-600 uppercase
//                   tracking-widest mt-1">
//                   {lbl}
//                 </div>
//               </div>
//             ))}
//           </motion.div>
//         </motion.div>

//         {/* Dashboard mockup */}
//         <motion.div
//           initial={{ opacity: 0, y: 64 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.05, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
//           className="relative max-w-6xl mx-auto"
//         >
//           {/* Floating status chips */}
//           {FLOAT_CHIPS.map(({ pos, dot, text, delay, dir }, i) => (
//             <motion.div
//               key={i}
//               className={`absolute ${pos}
//                 bg-[rgba(20,20,26,0.85)] border border-white/[0.09]
//                 backdrop-blur-md rounded-lg p-2.5 shadow-lg
//                 items-center gap-1.5 z-10 hidden md:flex`}
//               animate={{ y: [0, dir, 0] }}
//               transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay }}
//             >
//               <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
//               <span className="font-mono text-[0.65rem] text-zinc-300">{text}</span>
//             </motion.div>
//           ))}

//           {/* Dashboard frame */}
//           <div className="rounded-t-2xl overflow-hidden border border-white/[0.08] border-b-0
//             shadow-[-2px_0_0_0_rgba(220,20,60,0.13),-8px_0_40px_rgba(220,20,60,0.07),0_24px_80px_rgba(0,0,0,0.4)]">
//             <DashboardMockup />
//           </div>

//           {/* Fade to background colour at bottom */}
//           <div className="h-20 -mt-20 relative z-[5] bg-gradient-to-b from-transparent to-[#0a0a0f]" />
//         </motion.div>

//       </div>
//     </section>
//   );
// }
