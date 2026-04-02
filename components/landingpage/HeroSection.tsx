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
//   { icon: <Bell size={13} />, label: 'Push Notifications', color: '#A855F7', soon: true },
// ];

// export default function HeroSection() {
//   return (
//     <section className="bg-white relative overflow-hidden">
//       {/* <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600&family=DM+Mono:wght@300;400&display=swap');

//         @keyframes pulse-dot {
//           0%,100% { transform: scale(1); opacity: 1; }
//           50%      { transform: scale(1.5); opacity: 0.5; }
//         }
//         .pulse { animation: pulse-dot 2s ease-in-out infinite; }

//         .svc-pill {
//           display: inline-flex; align-items: center; gap: 6px;
//           padding: 5px 12px; border-radius: 999px;
//           font-family: 'DM Mono', monospace; font-size: 0.7rem;
//           border: 1px solid; white-space: nowrap;
//           transition: transform 0.18s, box-shadow 0.18s;
//           cursor: default;
//         }
//         .svc-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.07); }

//         .float-chip {
//           position: absolute;
//           background: white; border: 1px solid #EBEBEB;
//           border-radius: 10px; padding: 9px 13px;
//           box-shadow: 0 6px 24px rgba(0,0,0,0.09);
//           display: flex; align-items: center; gap: 7px;
//           z-index: 10;
//         }
//         .float-chip span {
//           font-family: 'DM Mono', monospace; font-size: 0.73rem; color: #333;
//         }

//         .btn-primary {
//           display: inline-flex; align-items: center; gap: 8px;
//           padding: 13px 28px; border-radius: 8px; border: none;
//           background: #DC143C; color: white; cursor: pointer;
//           font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 0.92rem;
//           text-decoration: none;
//           box-shadow: 0 4px 18px rgba(220,20,60,0.3);
//           transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
//         }
//         .btn-primary:hover { background: #c01236; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(220,20,60,0.38); }

//         .btn-ghost {
//           display: inline-flex; align-items: center; gap: 8px;
//           padding: 12px 24px; border-radius: 8px;
//           background: transparent; border: 1.5px solid #E2E2E2; color: #333; cursor: pointer;
//           font-family: 'Bricolage Grotesque', sans-serif; font-weight: 600; font-size: 0.92rem;
//           transition: border-color 0.2s, color 0.2s;
//         }
//         .btn-ghost:hover { border-color: #DC143C; color: #DC143C; }

//         @media (max-width: 680px) {
//           .float-chip { display: none !important; }
//         }
//       `}</style> */}

//       {/* BG layers */}
//       <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.07)_1px,transparent_1px)] bg-size-[28px_28px]" />
//       <div className="absolute top-20 left-1/2 -translate-x-1/2 w-175 h-115 bg-[radial-gradient(ellipse_at_center,rgba(220,20,60,0.055)_0%,transparent_65%)] pointer-events-none" />
//       <div className="absolute -bottom-15 left-1/2 -translate-x-1/2 w-225 h-125 bg-[radial-gradient(ellipse_at_center,rgba(220,20,60,0.08)_0%,transparent_68%)] pointer-events-none" />

//       <div className="max-w-275 mx-auto px-6 pt-20 relative z-10">

//         {/* ── COPY BLOCK ── */}
//         <motion.div
//           initial={{ opacity: 0, y: 28 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
//           className="text-center max-w-190 mx-auto"
//         >
//           {/* Live badge */}
//           <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(220,20,60,0.07)] border border-[rgba(220,20,60,0.2)] font-['DM_Mono'] text-[0.71rem] text-[#DC143C] tracking-[0.07em] uppercase mb-6">
//             <span className="pulse w-1.5 h-1.5 rounded-full bg-[#DC143C] inline-block" />
//             v0.5 — Live &amp; Production Ready
//           </div>

//           {/* Headline */}
//           <h1 className="font-['Bricolage_Grotesque'] font-extrabold text-[clamp(2.5rem,5.5vw,4.6rem)] leading-[1.07] tracking-[-0.035em] text-[#0A0A0A] mb-5">
//             Stop Installing{' '}
//             <span className="text-[#DC143C]">Five</span>
//             <br />
//             Infrastructures.{' '}
//             <span className="text-[#DC143C]">Use One.</span>
//           </h1>

//           {/* Sub-headline */}
//           <p className="font-['Plus_Jakarta_Sans'] text-base md:text-lg text-[#666] leading-relaxed max-w-130 mx-auto mb-8">
//             SMS · Email · OTP · File Storage · Push — everything your app needs to
//             communicate, on a{' '}
//             <strong className="text-[#0A0A0A] font-semibold">single API key.</strong>
//             {' '}No juggling vendors. No stitching SDKs.
//           </p>

//           {/* Service pills */}
//           <div className="flex flex-wrap gap-2 justify-center mb-8">
//             {SERVICES.map(({ icon, label, color, soon }, i) => (
//               <motion.div
//                 key={label}
//                 className="svc-pill"
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4 + i * 0.07 }}
//                 style={{
//                   color: soon ? '#C0C0C0' : color,
//                   borderColor: soon ? '#EBEBEB' : `${color}28`,
//                   background: soon ? '#FAFAFA' : `${color}07`,
//                   opacity: soon ? 0.7 : 1,
//                 }}
//               >
//                 {icon}
//                 {label}
//                 {soon
//                   ? <span className="text-[0.58rem] px-1.5 py-0.5 rounded bg-[#F0F0F0] text-[#C0C0C0] font-['DM_Mono'] tracking-[0.06em]">SOON</span>
//                   : <CheckCircle size={10} style={{ color, opacity: 0.65 }} />
//                 }
//               </motion.div>
//             ))}
//           </div>

//           {/* CTA row */}
//           <div className="flex gap-3 justify-center flex-wrap mb-10">
//             <Link href="/auth/signup" className="btn-primary">
//               Get Started <ArrowRight size={15} />
//             </Link>
//             <button className="btn-ghost">
//               <Play size={13} className="fill-[#DC143C] text-[#DC143C]" />
//               See it in action
//             </button>
//           </div>

//           {/* Stat strip */}
//           <motion.div
//             className="flex bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] max-w-160 mx-auto mb-14"
//             initial={{ opacity: 0, y: 14 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55, duration: 0.6 }}
//           >
//             {[
//               ['1,000+', 'Businesses'],
//               ['284k+',  'Messages sent'],
//               ['99.9%',  'Uptime SLA'],
//               ['<50ms',  'Avg latency'],
//             ].map(([val, lbl], i, arr) => (
//               <>
//                 <div key={lbl} className="flex-1 text-center py-4 px-2.5">
//                   <div className="font-['Bricolage_Grotesque'] font-extrabold text-[1.3rem] text-[#0A0A0A] tracking-[-0.03em]">{val}</div>
//                   <div className="font-['DM_Mono'] text-[0.62rem] text-[#BBB] uppercase tracking-[0.09em] mt-0.5">{lbl}</div>
//                 </div>
//                 {i < arr.length - 1 && <div key={`d${i}`} className="w-px bg-[#EBEBEB] shrink-0" />}
//               </>
//             ))}
//           </motion.div>
//         </motion.div>

//         {/* ── DASHBOARD SVG ── */}
//         <motion.div
//           initial={{ opacity: 0, y: 64 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1.05, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
//           className="relative max-w-260 mx-auto"
//         >
//           {/* Floating status chips */}
//           <motion.div
//             className="float-chip"
//             style={{ top: 44, left: -8 }}
//             animate={{ y: [0, -9, 0] }}
//             transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
//           >
//             <div className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
//             <span>99.2% delivery rate</span>
//           </motion.div>

//           <motion.div
//             className="float-chip"
//             style={{ top: 88, right: -8 }}
//             animate={{ y: [0, 9, 0] }}
//             transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
//           >
//             <span className="text-base leading-none">⚡</span>
//             <span>47ms avg latency</span>
//           </motion.div>

//           <motion.div
//             className="float-chip"
//             style={{ bottom: 130, left: 32 }}
//             animate={{ y: [0, -6, 0] }}
//             transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2.2 }}
//           >
//             <CheckCircle size={13} className="text-[#DC143C] shrink-0" />
//             <span>SMS delivered · 2m ago</span>
//           </motion.div>

//           <motion.div
//             className="float-chip"
//             style={{ bottom: 160, right: 32 }}
//             animate={{ y: [0, 7, 0] }}
//             transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
//           >
//             <div className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0" />
//             <span>Email campaign queued</span>
//           </motion.div>

//           {/* The dashboard */}
//           <div className="rounded-t-2xl overflow-hidden border border-[#E2E2E2] border-b-0 shadow-[-2px_0_0_0_#DC143C22,-8px_0_40px_rgba(220,20,60,0.07),0_24px_80px_rgba(0,0,0,0.1)]">
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

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, CheckCircle, MessageSquare, Mail, Bell, HardDrive, Shield } from 'lucide-react';
import { DashboardMockup } from './home';

const SERVICES = [
  { icon: <MessageSquare size={13} />, label: 'SMS', color: '#DC143C', soon: false },
  { icon: <Mail size={13} />, label: 'Email', color: '#3B82F6', soon: false },
  { icon: <Shield size={13} />, label: 'OTP / 2FA', color: '#22C55E', soon: false },
  { icon: <HardDrive size={13} />, label: 'File Storage', color: '#F97316', soon: false },
  { icon: <Bell size={13} />, label: 'Push Notifications', color: '#A855F7', soon: true },
];

export default function HeroSection() {
  return (
    <section className="bg-white relative overflow-hidden">
      {/* BG layers */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.07)_1px,transparent_1px)] bg-size-[28px_28px]" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-175 h-115 bg-[radial-gradient(ellipse_at_center,rgba(220,20,60,0.055)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute -bottom-15 left-1/2 -translate-x-1/2 w-225 h-125 bg-[radial-gradient(ellipse_at_center,rgba(220,20,60,0.08)_0%,transparent_68%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-20 relative z-10">
        {/* ── COPY BLOCK ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 font-mono text-[0.71rem] text-red-600 uppercase mb-6">
            <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
            v0.5 — Live &amp; Production Ready
          </div>

          {/* Headline */}
          <h1 className="font-['Bricolage_Grotesque'] font-extrabold text-[clamp(2.5rem,5.5vw,4.6rem)] leading-[1.07] tracking-[-0.035em] text-gray-900 mb-5">
            Stop Installing{' '}
            <span className="text-red-600">Five</span>
            <br />
            Infrastructures.{' '}
            <span className="text-red-600">Use One.</span>
          </h1>

          {/* Sub-headline */}
          <p className="font-['Plus_Jakarta_Sans'] text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8">
            SMS · Email · OTP · File Storage · Push — everything your app needs to
            communicate, on a{' '}
            <strong className="text-gray-900 font-semibold">single API key.</strong>
            {' '}No juggling vendors. No stitching SDKs.
          </p>

          {/* Service pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {SERVICES.map(({ icon, label, color, soon }, i) => (
              <motion.div
                key={label}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs border
                  transition-all duration-200 cursor-default hover:-translate-y-0.5 hover:shadow-md
                  ${soon ? 'bg-gray-50 border-gray-200 text-gray-400 opacity-70' : 'bg-opacity-5'}
                `}
                style={{
                  backgroundColor: soon ? undefined : `${color}07`,
                  borderColor: soon ? undefined : `${color}28`,
                  color: soon ? undefined : color,
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
              >
                {icon}
                {label}
                {soon ? (
                  <span className="text-[0.58rem] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 font-mono tracking-wide">
                    SOON
                  </span>
                ) : (
                  <CheckCircle size={10} style={{ color, opacity: 0.65 }} />
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex gap-3 justify-center flex-wrap mb-10">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-red-600 text-white font-['Bricolage_Grotesque'] font-bold text-sm shadow-md hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              Get Started <ArrowRight size={15} />
            </Link>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-transparent border-2 border-gray-200 text-gray-800 font-['Bricolage_Grotesque'] font-semibold text-sm hover:border-red-600 hover:text-red-600 transition-all duration-200">
              <Play size={13} className="fill-red-600 text-red-600" />
              See it in action
            </button>
          </div>

          {/* Stat strip */}
          <motion.div
            className="flex bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm max-w-2xl mx-auto mb-14"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            {[
              ['1,00+', 'Businesses'],
              ['28k+',  'Messages sent'],
              ['99.9%',  'Uptime SLA'],
              ['<50ms',  'Avg latency'],
            ].map(([val, lbl], i, arr) => (
              <div key={lbl} className="flex-1 text-center py-4 px-2.5">
                <div className="font-['Bricolage_Grotesque'] font-extrabold text-xl text-gray-900 tracking-tight">{val}</div>
                <div className="font-mono text-[0.62rem] text-gray-300 uppercase tracking-wide mt-0.5">{lbl}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── DASHBOARD SVG ── */}
        <motion.div
          initial={{ opacity: 0, y: 64 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.05, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Floating status chips */}
          <motion.div
            className="absolute bg-white border border-gray-100 rounded-lg p-2.5 shadow-lg items-center gap-1.5 z-10 hidden md:flex"
            style={{ top: 44, left: -8 }}
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="font-mono text-xs text-gray-700">99.2% delivery rate</span>
          </motion.div>

          <motion.div
            className="absolute bg-white border border-gray-100 rounded-lg p-2.5 shadow-lg items-center gap-1.5 z-10 hidden md:flex"
            style={{ top: 88, right: -8 }}
            animate={{ y: [0, 9, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
          >
            <span className="text-base leading-none">⚡</span>
            <span className="font-mono text-xs text-gray-700">47ms avg latency</span>
          </motion.div>

          <motion.div
            className="absolute bg-white border border-gray-100 rounded-lg p-2.5 shadow-lg items-center gap-1.5 z-10 hidden md:flex"
            style={{ bottom: 130, left: 32 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2.2 }}
          >
            <CheckCircle size={13} className="text-red-600 shrink-0" />
            <span className="font-mono text-xs text-gray-700">SMS delivered · 2m ago</span>
          </motion.div>

          <motion.div
            className="absolute bg-white border border-gray-100 rounded-lg p-2.5 shadow-lg items-center gap-1.5 z-10 hidden md:flex"
            style={{ bottom: 160, right: 32 }}
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span className="font-mono text-xs text-gray-700">Email campaign queued</span>
          </motion.div>

          {/* The dashboard */}
          <div className="rounded-t-2xl overflow-hidden border border-gray-200 border-b-0 shadow-[-2px_0_0_0_rgba(220,20,60,0.13),-8px_0_40px_rgba(220,20,60,0.07),0_24px_80px_rgba(0,0,0,0.1)]">
            <DashboardMockup />
          </div>

          {/* Fade to white at bottom */}
          <div className="h-20 -mt-20 relative z-5 bg-linear-to-b from-transparent to-white" />
        </motion.div>
      </div>
    </section>
  );
}