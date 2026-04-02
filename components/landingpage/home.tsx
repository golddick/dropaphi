







'use client';

import { useAuthStore } from '@/lib/stores/auth';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import DropIdSection from './DropIdSection';
import AnalyticsSection from './AnalyticsSection';
import UseCasesSection from './UseCasesSection';
import WhyDropSection from './WhyDropSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import CTASection from './CTASection';
import Footer from './Footer';

/* ─── Inline SVG Components (unchanged) ─── */
export const DashboardMockup = () => (
  <svg viewBox="0 0 760 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
    <defs>
      <linearGradient id="dg1" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#DC143C"/>
        <stop offset="100%" stopColor="#ff6b6b"/>
      </linearGradient>
      <linearGradient id="dg2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#DC143C" stopOpacity="0.35"/>
        <stop offset="100%" stopColor="#DC143C" stopOpacity="0.03"/>
      </linearGradient>
      <linearGradient id="dg3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.03"/>
      </linearGradient>
    </defs>

    {/* Window frame */}
    <rect width="760" height="500" rx="16" fill="#0D0D0D"/>

    {/* Title bar */}
    <rect width="760" height="46" rx="16" fill="#161616"/>
    <rect y="30" width="760" height="16" fill="#161616"/>
    <circle cx="22" cy="23" r="5.5" fill="#FF5F57"/>
    <circle cx="41" cy="23" r="5.5" fill="#FEBC2E"/>
    <circle cx="60" cy="23" r="5.5" fill="#28C840"/>
    {/* URL bar */}
    <rect x="280" y="13" width="200" height="20" rx="6" fill="#1E1E1E"/>
    <text x="295" y="27" fontFamily="monospace" fontSize="10" fill="#444">app.dropaphi.com/wsb677755/dashboard</text>

    {/* Sidebar */}
    <rect x="0" y="46" width="178" height="454" fill="#101010"/>

    {/* Logo */}
    <rect x="14" y="66" width="150" height="34" rx="8" fill="#181818"/>
    <rect x="22" y="74" width="18" height="18" rx="4" fill="#DC143C"/>
    <text x="22" y="86" fontFamily="sans-serif" fontSize="9" fontWeight="800" fill="white">D</text>
    <text x="46" y="87" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="white">DropAPHI</text>

    {/* Nav items */}
    {[
      { label: 'Overview',  y: 118, active: true  },
      { label: 'SMS',       y: 154, active: false },
      { label: 'Email',     y: 190, active: false },
      { label: 'Storage',   y: 226, active: false },
      { label: 'OTP', y: 262, active: false },
      { label: 'API Keys',  y: 298, active: false },
      { label: 'Settings',  y: 334, active: false },
    ].map(({ label, y, active }) => (
      <g key={label}>
        {active && <rect x="10" y={y - 9} width="158" height="28" rx="6" fill="#1C1C1C"/>}
        {active && <rect x="10" y={y - 9} width="3" height="28" rx="2" fill="#DC143C"/>}
        <circle cx="30" cy={y + 5} r="4" fill={active ? '#DC143C' : '#2A2A2A'} opacity={active ? 1 : 0.8}/>
        <text x="42" y={y + 9} fontFamily="sans-serif" fontSize="10.5" fill={active ? 'white' : '#555'}>{label}</text>
      </g>
    ))}

    {/* Usage meter at bottom of sidebar */}
    <rect x="14" y="400" width="150" height="58" rx="8" fill="#161616" stroke="#1E1E1E" strokeWidth="1"/>
    <text x="22" y="418" fontFamily="sans-serif" fontSize="9" fill="#555">Monthly Usage</text>
    <rect x="22" y="426" width="124" height="6" rx="3" fill="#1E1E1E"/>
    <rect x="22" y="426" width="81" height="6" rx="3" fill="url(#dg1)"/>
    <text x="22" y="446" fontFamily="sans-serif" fontSize="9" fill="#444">65K / 100K msgs</text>
    <text x="118" y="446" fontFamily="sans-serif" fontSize="9" fill="#DC143C">65%</text>

    {/* ── MAIN CONTENT ── */}
    {/* Header row */}
    <text x="200" y="76" fontFamily="sans-serif" fontSize="16" fontWeight="700" fill="white">Overview</text>
    <text x="200" y="94" fontFamily="sans-serif" fontSize="10" fill="#444">March 2025  ·  All channels</text>

    {/* Filter pills */}
    <rect x="570" y="62" width="44" height="20" rx="6" fill="#1E1E1E"/>
    <text x="580" y="75" fontFamily="sans-serif" fontSize="9" fill="#666">7 days</text>
    <rect x="620" y="62" width="44" height="20" rx="6" fill="#DC143C" opacity="0.15"/>
    <text x="629" y="75" fontFamily="sans-serif" fontSize="9" fill="#DC143C">30 days</text>
    <rect x="670" y="62" width="44" height="20" rx="6" fill="#1E1E1E"/>
    <text x="678" y="75" fontFamily="sans-serif" fontSize="9" fill="#666">90 days</text>

    {/* ── STAT CARDS ── */}
    {[
      { x: 198, label: 'SMS Sent',     val: '284,920', change: '+12.4%', up: true,  color: '#DC143C' },
      { x: 340, label: 'Emails',       val: '91,203',  change: '+5.2%',  up: true,  color: '#3B82F6' },
      { x: 482, label: 'OTP Verified', val: '48,291',  change: '+8.1%',  up: true,  color: '#22C55E' },
      { x: 624, label: 'Files Stored', val: '12.4 GB', change: '+2.1%',  up: true,  color: '#F97316' },
    ].map(({ x, label, val, change, color }) => (
      <g key={label}>
        <rect x={x} y="108" width="134" height="74" rx="9" fill="#151515" stroke="#1E1E1E" strokeWidth="1"/>
        {/* top color bar */}
        <rect x={x} y="108" width="134" height="3" rx="2" fill={color} opacity="0.6"/>
        <text x={x + 12} y="130" fontFamily="sans-serif" fontSize="9.5" fill="#555">{label}</text>
        <text x={x + 12} y="156" fontFamily="sans-serif" fontSize="19" fontWeight="800" fill="white">{val}</text>
        <rect x={x + 12} y="166" width="38" height="12" rx="3" fill={color} opacity="0.12"/>
        <text x={x + 15} y="176" fontFamily="sans-serif" fontSize="8.5" fill={color}>↑ {change}</text>
      </g>
    ))}

    {/* ── CHART AREA ── */}
    <rect x="198" y="196" width="360" height="158" rx="10" fill="#131313" stroke="#1C1C1C" strokeWidth="1"/>
    <text x="212" y="216" fontFamily="sans-serif" fontSize="10.5" fontWeight="600" fill="#888">Message Volume</text>

    {/* Area fill — SMS */}
    <path d="M212,326 C228,310 244,298 260,308 C276,318 292,282 308,265 C324,248 340,272 356,255 C372,238 388,262 404,242 C420,222 436,248 452,230 C460,220 468,223 476,218 L476,338 L212,338 Z" fill="url(#dg2)"/>
    {/* Line — SMS */}
    <path d="M212,326 C228,310 244,298 260,308 C276,318 292,282 308,265 C324,248 340,272 356,255 C372,238 388,262 404,242 C420,222 436,248 452,230 C460,220 468,223 476,218" stroke="#DC143C" strokeWidth="2" fill="none" strokeLinecap="round"/>

    {/* Area fill — Email */}
    <path d="M212,338 C228,332 244,320 260,328 C276,336 292,316 308,305 C324,294 340,312 356,300 C372,288 388,304 404,295 C420,286 436,298 452,290 C460,285 468,287 476,284 L476,338 L212,338 Z" fill="url(#dg3)"/>
    {/* Line — Email */}
    <path d="M212,338 C228,332 244,320 260,328 C276,336 292,316 308,305 C324,294 340,312 356,300 C372,288 388,304 404,295 C420,286 436,298 452,290 C460,285 468,287 476,284" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="3 2" opacity="0.7"/>

    {/* Dots on SMS line */}
    {[[260,308],[308,265],[356,255],[404,242],[452,230]].map(([cx,cy],i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r="3.5" fill="#0D0D0D" stroke="#DC143C" strokeWidth="1.5"/>
      </g>
    ))}

    {/* Tooltip */}
    <rect x="340" y="228" width="72" height="32" rx="5" fill="#DC143C"/>
    <text x="350" y="242" fontFamily="sans-serif" fontSize="8.5" fontWeight="600" fill="white">Mar 14</text>
    <text x="350" y="254" fontFamily="sans-serif" fontSize="10" fontWeight="800" fill="white">14,203</text>
    <line x1="376" y1="260" x2="356" y2="255" stroke="#DC143C" strokeWidth="1"/>

    {/* X-axis labels */}
    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => (
      <text key={m} x={213 + i * 22} y="350" fontFamily="sans-serif" fontSize="7.5" fill="#333">{m}</text>
    ))}

    {/* Chart legend */}
    <circle cx="214" cy="362" r="4" fill="#DC143C"/>
    <text x="222" y="366" fontFamily="sans-serif" fontSize="9" fill="#666">SMS</text>
    <line x1="244" y1="362" x2="252" y2="362" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 2"/>
    <text x="256" y="366" fontFamily="sans-serif" fontSize="9" fill="#666">Email</text>

    {/* ── CHANNEL BREAKDOWN (right of chart) ── */}
    <rect x="566" y="196" width="176" height="158" rx="10" fill="#131313" stroke="#1C1C1C" strokeWidth="1"/>
    <text x="580" y="216" fontFamily="sans-serif" fontSize="10.5" fontWeight="600" fill="#888">Channel Split</text>

    {/* Donut placeholder */}
    <circle cx="654" cy="263" r="36" fill="none" stroke="#1E1E1E" strokeWidth="12"/>
    {/* SMS arc */}
    <circle cx="654" cy="263" r="36" fill="none" stroke="#DC143C" strokeWidth="12"
      strokeDasharray="84 142" strokeDashoffset="0" strokeLinecap="round"/>
    {/* Email arc */}
    <circle cx="654" cy="263" r="36" fill="none" stroke="#3B82F6" strokeWidth="12"
      strokeDasharray="43 183" strokeDashoffset="-88" strokeLinecap="round"/>
    {/* OTP arc */}
    <circle cx="654" cy="263" r="36" fill="none" stroke="#22C55E" strokeWidth="12"
      strokeDasharray="27 199" strokeDashoffset="-135" strokeLinecap="round"/>
    {/* Storage arc */}
    <circle cx="654" cy="263" r="36" fill="none" stroke="#F97316" strokeWidth="12"
      strokeDasharray="12 214" strokeDashoffset="-166" strokeLinecap="round"/>
    {/* Center label */}
    <text x="654" y="259" fontFamily="sans-serif" fontSize="13" fontWeight="800" fill="white" textAnchor="middle">424K</text>
    <text x="654" y="272" fontFamily="sans-serif" fontSize="8" fill="#555" textAnchor="middle">total</text>

    {/* Legend */}
    {[['#DC143C','SMS','59%'],['#3B82F6','Email','31%'],['#22C55E','OTP','7%'],['#F97316','Files','3%']].map(([c,l,pct],i) => (
      <g key={l}>
        <rect x="578" y={305 + i * 13} width="8" height="8" rx="2" fill={c}/>
        <text x="590" y={313 + i * 13} fontFamily="sans-serif" fontSize="9" fill="#666">{l}</text>
        <text x="718" y={313 + i * 13} fontFamily="sans-serif" fontSize="9" fill="#444" textAnchor="end">{pct}</text>
      </g>
    ))}

    {/* ── RECENT ACTIVITY ── */}
    <rect x="198" y="374" width="348" height="100" rx="10" fill="#131313" stroke="#1C1C1C" strokeWidth="1"/>
    <text x="212" y="394" fontFamily="sans-serif" fontSize="10.5" fontWeight="600" fill="#888">Recent Activity</text>

    {[
      { type: 'SMS',   to: '+234 801 234 5678', msg: 'OTP sent',          time: '2m',  ok: true  },
      { type: 'EMAIL', to: 'user@company.io',   msg: 'Welcome email',     time: '5m',  ok: true  },
      { type: 'STORE', to: 'invoice_Q3.pdf',    msg: 'File uploaded',     time: '9m',  ok: true  },
      { type: 'OTP',   to: '+234 706 123 4567', msg: 'Verification sent', time: '14m', ok: false },
    ].map(({ type, to, msg, time, ok }, i) => {
     const typeColors: Record<string, string> = { SMS:'#DC143C', EMAIL:'#3B82F6', STORE:'#F97316', OTP:'#22C55E' };
    const tc = typeColors[type] ?? '#555';
      return (
        <g key={i}>
          <rect x="208" y={402 + i * 17} width="328" height="14" rx="3" fill="#181818" opacity={i % 2 === 0 ? 0 : 0.4}/>
          {/* type badge */}
          <rect x="212" y={404 + i * 17} width="32" height="10" rx="2" fill={tc} opacity="0.15"/>
          <text x="214" y={413 + i * 17} fontFamily="monospace" fontSize="7.5" fontWeight="700" fill={tc}>{type}</text>
          <text x="250" y={413 + i * 17} fontFamily="sans-serif" fontSize="9" fill="#555">{to}</text>
          <text x="430" y={413 + i * 17} fontFamily="sans-serif" fontSize="8.5" fill="#333">{msg}</text>
          <circle cx="524" cy={409 + i * 17} r="3" fill={ok ? '#28C840' : '#FF5F57'}/>
          <text x="530" y={413 + i * 17} fontFamily="sans-serif" fontSize="8" fill="#333">{time} ago</text>
        </g>
      );
    })}

    {/* ── QUICK STATS (right of activity) ── */}
    <rect x="554" y="374" width="188" height="100" rx="10" fill="#131313" stroke="#1C1C1C" strokeWidth="1"/>
    <text x="568" y="394" fontFamily="sans-serif" fontSize="10.5" fontWeight="600" fill="#888">Delivery Rate</text>

    {[
      { label: 'SMS',   pct: 98, color: '#DC143C' },
      { label: 'Email', pct: 99, color: '#3B82F6' },
      { label: 'OTP',   pct: 97, color: '#22C55E' },
    ].map(({ label, pct, color }, i) => (
      <g key={label}>
        <text x="568" y={410 + i * 22} fontFamily="sans-serif" fontSize="8.5" fill="#666">{label}</text>
        <rect x="596" y={402 + i * 22} width="108" height="7" rx="3" fill="#1E1E1E"/>
        <rect x="596" y={402 + i * 22} width={108 * pct / 100} height="7" rx="3" fill={color} opacity="0.8"/>
        <text x="708" y={410 + i * 22} fontFamily="sans-serif" fontSize="8.5" fill={color} textAnchor="end">{pct}%</text>
      </g>
    ))}
  </svg>
);

export const ApiFlowDiagram = () => (
  <svg viewBox="0 0 640 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <rect width="640" height="360" rx="20" fill="#FAFAFA" stroke="#F0F0F0" strokeWidth="1"/>
    <rect x="30" y="140" width="120" height="80" rx="12" fill="white" stroke="#E0E0E0" strokeWidth="1.5"/>
    <rect x="46" y="156" width="32" height="32" rx="8" fill="#1A1A1A"/>
    <text x="54" y="177" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill="white">{'</>'}</text>
    <text x="38" y="210" fontFamily="sans-serif" fontSize="10" fontWeight="600" fill="#333">Your App</text>
    {/* <text x="44" y="224" fontFamily="sans-serif" fontSize="8" fill="#999">Node / Python / PHP</text> */}
    <line x1="152" y1="180" x2="248" y2="180" stroke="#DC143C" strokeWidth="2" strokeDasharray="6 3"/>
    <polygon points="248,174 260,180 248,186" fill="#DC143C"/>
    <rect x="172" y="164" width="56" height="16" rx="4" fill="#DC143C"/>
    <text x="180" y="175" fontFamily="sans-serif" fontSize="8" fontWeight="600" fill="white">API Request</text>
    <rect x="260" y="110" width="120" height="140" rx="14" fill="#1A1A1A"/>
    <rect x="268" y="118" width="104" height="24" rx="6" fill="#DC143C"/>
    <text x="278" y="134" fontFamily="sans-serif" fontSize="10" fontWeight="700" fill="white">DropAPHI Core</text>
    {['Route', 'Queue', 'Deliver', 'Track'].map((t, i) => (
      <g key={t}>
        <rect x="272" y={150 + i * 22} width="96" height="16" rx="4" fill="#222"/>
        <circle cx="284" cy={158 + i * 22} r="3" fill="#DC143C"/>
        <text x="292" y={162 + i * 22} fontFamily="sans-serif" fontSize="9" fill="#888">{t}</text>
      </g>
    ))}
    {[
      { label: 'SMS', y: 60, color: '#F97316' },
      { label: 'Email', y: 130, color: '#3B82F6' },
      { label: 'WhatsApp', y: 200, color: '#22C55E' },
      { label: 'OTP', y: 270, color: '#A855F7' }
    ].map(({ label, y, color }) => (
      <g key={label}>
        <line x1="382" y1={y + 20} x2="458" y2={y + 20} stroke={color} strokeWidth="1.5" strokeDasharray="5 3"/>
        <polygon points={`458,${y + 14} 470,${y + 20} 458,${y + 26}`} fill={color}/>
        <rect x="472" y={y} width="90" height="40" rx="8" fill="white" stroke="#F0F0F0" strokeWidth="1"/>
        <circle cx="490" cy={y + 20} r="8" fill={color} opacity="0.15"/>
        <text x="487" y={y + 24} fontFamily="sans-serif" fontSize="10" fill={color}>●</text>
        <text x="504" y={y + 24} fontFamily="sans-serif" fontSize="10" fontWeight="600" fill="#333">{label}</text>
      </g>
    ))}
    <path d="M 262 260 Q 190 310 90 260 Q 70 250 90 220" stroke="#DC143C" strokeWidth="1.5" strokeDasharray="5 3" fill="none"/>
    <polygon points="84,222 90,208 96,222" fill="#DC143C"/>
    <rect x="148" y="288" width="70" height="16" rx="4" fill="white" stroke="#EEE" strokeWidth="1"/>
    <text x="156" y="299" fontFamily="sans-serif" fontSize="8" fill="#888">Webhook / Response</text>
  </svg>
);

export const DropIdDemo = () => (
  <svg viewBox="0 0 600 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <rect width="600" height="340" rx="16" fill="#0A0A0A"/>
    <rect width="600" height="44" rx="16" fill="#111"/>
    <rect y="28" width="600" height="16" fill="#111"/>
    <circle cx="22" cy="22" r="5" fill="#FF5F57"/>
    <circle cx="40" cy="22" r="5" fill="#FEBC2E"/>
    <circle cx="58" cy="22" r="5" fill="#28C840"/>
    <text x="76" y="27" fontFamily="monospace" fontSize="11" fill="#444">dropid_demo.js</text>
    <text x="28" y="78" fontFamily="monospace" fontSize="11" fill="#555">// Before — UUID hell</text>
    <rect x="20" y="88" width="560" height="36" rx="6" fill="#1A1A1A"/>
    <text x="34" y="108" fontFamily="monospace" fontSize="11" fill="#FF5F57">User 550e8400-e29b-41d4-a916-446655440000 not found</text>
    <text x="28" y="148" fontFamily="monospace" fontSize="11" fill="#555">// After — Human-readable</text>
    <rect x="20" y="158" width="560" height="36" rx="6" fill="#162016"/>
    <text x="34" y="178" fontFamily="monospace" fontSize="11" fill="#4ADE80">User <tspan fill="#FDE68A">user_a3f2b9c1d4e5</tspan> not found</text>
    <text x="28" y="220" fontFamily="monospace" fontSize="11" fill="#555">$ npm install drop-api-id</text>
    <rect x="20" y="232" width="560" height="90" rx="8" fill="#141414"/>
    <text x="34" y="256" fontFamily="monospace" fontSize="11" fill="#C792EA">import <tspan fill="#CDD6F4">{'{ dropid }'}</tspan> <tspan fill="#C792EA">from</tspan> <tspan fill="#A6E3A1">'drop-api-id'</tspan>;</text>
    <text x="34" y="278" fontFamily="monospace" fontSize="11" fill="#89B4FA">dropid<tspan fill="#CDD6F4">('user')</tspan>         <tspan fill="#444">→ user_a3f2b9c1d4e5</tspan></text>
    <text x="34" y="298" fontFamily="monospace" fontSize="11" fill="#89B4FA">dropid<tspan fill="#CDD6F4">('order', 'acme')</tspan>  <tspan fill="#444">→ acme_order_x7k9m2n4</tspan></text>
    <rect x="430" y="56" width="150" height="50" rx="10" fill="#1A1A1A" stroke="#252525" strokeWidth="1"/>
    <text x="446" y="77" fontFamily="monospace" fontSize="11" fontWeight="700" fill="#DC143C">2–3M IDs/sec</text>
    <text x="446" y="93" fontFamily="monospace" fontSize="9" fill="#555">Crypto-secure · 2KB</text>
  </svg>
);

export const AnalyticsMockup = () => (
  <svg viewBox="0 0 560 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <rect width="560" height="320" rx="16" fill="white" stroke="#F0F0F0" strokeWidth="1"/>
    <text x="24" y="40" fontFamily="sans-serif" fontSize="16" fontWeight="800" fill="#111">Real-time Analytics</text>
    <text x="24" y="58" fontFamily="sans-serif" fontSize="11" fill="#999">Live delivery dashboard</text>
    {[['284K', 'SMS', '#DC143C'], ['99.2%', 'Delivered', '#22C55E'], ['48K', 'OTP', '#3B82F6'], ['12K', 'Email', '#F97316']].map(([v, l, c], i) => (
      <g key={l}>
        <rect x={24 + i * 132} y="74" width="118" height="54" rx="10" fill="#FAFAFA" stroke="#F0F0F0" strokeWidth="1"/>
        <text x={34 + i * 132} y="98" fontFamily="sans-serif" fontSize="18" fontWeight="800" fill="#111">{v}</text>
        <rect x={34 + i * 132} y="106" width="36" height="12" rx="4" fill={c} opacity="0.12"/>
        <text x={38 + i * 132} y="116" fontFamily="sans-serif" fontSize="8" fontWeight="600" fill={c}>{l}</text>
      </g>
    ))}
    <rect x="16" y="142" width="528" height="130" rx="10" fill="#FAFAFA"/>
    <defs>
      <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#DC143C" stopOpacity="0.2"/>
        <stop offset="100%" stopColor="#DC143C" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <path d="M30,250 C60,230 90,210 120,220 C150,230 180,190 210,175 C240,160 270,185 300,165 C330,145 360,170 390,150 C420,130 450,155 480,140 C500,130 520,135 530,130 L530,260 L30,260 Z" fill="url(#areaGrad2)"/>
    <path d="M30,250 C60,230 90,210 120,220 C150,230 180,190 210,175 C240,160 270,185 300,165 C330,145 360,170 390,150 C420,130 450,155 480,140 C500,130 520,135 530,130" stroke="#DC143C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {[[120,220],[210,175],[300,165],[390,150],[480,140]].map(([cx,cy],i) => (
      <circle key={i} cx={cx} cy={cy} r="5" fill="white" stroke="#DC143C" strokeWidth="2"/>
    ))}
    <rect x="282" y="140" width="76" height="36" rx="6" fill="#DC143C"/>
    <text x="296" y="156" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="white">Apr 15</text>
    <text x="296" y="168" fontFamily="sans-serif" fontSize="11" fontWeight="800" fill="white">12,842</text>
    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'].map((m, i) => (
      <text key={m} x={32 + i * 68} y="280" fontFamily="sans-serif" fontSize="9" fill="#CCC">{m}</text>
    ))}
  </svg>
);


/* ─── Main Page ─── */
export default function LandingPage() {
  const { user } = useAuthStore();

  return (
    <main className="font-sans overflow-x-hidden bg-white">
      
      <Navigation user={user} />
      <HeroSection />
      <Ticker />
      <ServicesSection />
      <DropIdSection />
      <AnalyticsSection />
      <UseCasesSection />
      <WhyDropSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}

/* ─── Ticker Component ─── */
export function Ticker() {
  return (
    <div className="bg-black border-t border-b border-gray-900 py-3 overflow-hidden">
      <div className="overflow-hidden">
        <div className="flex animate-[tick_28s_linear_infinite] w-max">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex items-center">
              {['SMS API', 'Email API', 'WhatsApp', 'OTP Service', 'File Storage', 'DropID SDK', 'Pan-African', '99.9% SLA', 'Open Source', '2K+ Businesses'].map((item, j) => (
                <span 
                  key={j} 
                  className={`font-mono text-xs uppercase tracking-widest px-7 border-r border-gray-800 whitespace-nowrap ${
                    j % 2 === 0 ? 'text-white/40' : 'text-red-600'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}