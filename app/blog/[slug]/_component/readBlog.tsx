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
      <text x="428" y="389" className="font-mono text-[11px] fill-red-600">Pan-African Network Map</text>
    </svg>
  );
}

/* ── Code block component ── */
function CodeBlock({ code, lang = 'javascript' }: { code: string; lang?: string }) {
  const lines = code.trim().split('\n');
  return (
    <div className="bg-black rounded-xl overflow-hidden border border-gray-900 my-7">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-900">
        <div className="flex gap-1.5">
          {['#FF5F57','#FEBC2E','#28C840'].map(c => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }}/>
          ))}
        </div>
        <span className="font-mono text-xs text-gray-700">{lang}</span>
      </div>
      <div className="p-5 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="text-gray-800 select-none mr-5 min-w-[20px] text-right flex-shrink-0">{i + 1}</span>
            <span 
              className="text-gray-300" 
              dangerouslySetInnerHTML={{ __html:
                line
                  .replace(/('.*?')/g, '<span class="text-green-400">$1</span>')
                  .replace(/(\/\/.*)/g, '<span class="text-gray-600">$1</span>')
                  .replace(/\b(const|let|var|import|from|await|async|return|new)\b/g, '<span class="text-purple-400">$1</span>')
                  .replace(/\b(drop|client)\b/g, '<span class="text-blue-400">$1</span>')
                  .replace(/\b(DropAPI|send|verify|upload)\b/g, '<span class="text-yellow-400">$1</span>')
                  .replace(/\b(sms|email|otp|storage|push)\b/g, '<span class="text-green-300">$1</span>')
              }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Props for dynamic blog post ── */
interface BlogPostProps {
  post: {
    title: string;
    excerpt: string;
    content: string;
    date: string;
    readTime: string;
    category: string;
    author: {
      name: string;
      role: string;
      avatar?: string;
    };
    tags: string[];
    slug: string;
  };
  relatedPosts?: Array<{
    slug: string;
    tag: string;
    tagColor: string;
    title: string;
    date: string;
    readTime: string;
  }>;
}

/* ── Main article page ── */
export default function BlogPostPage({ post, relatedPosts = [] }: BlogPostProps) {
  const { user } = useAuthStore();

  // Render HTML content safely
  const renderContent = () => {
    return { __html: post.content };
  };

  return (
    <div className="overflow-x-hidden bg-white">
      <Navigation user={user} />

      {/* ── ARTICLE HEADER — dark ── */}
      <section className="bg-black text-white px-6 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-3/5 w-150 h-100 bg-[radial-gradient(ellipse,rgba(220,20,60,0.12)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(220,20,60,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,20,60,0.03)_1px,transparent_1px)] bg-[length:48px_48px]" />
        
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Back link */}
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-600 no-underline mb-7 transition-colors hover:text-red-600"
            >
              <ArrowLeft size={14} /> Back to Blog
            </Link>

            {/* Tag + meta */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="font-mono text-xs px-3 py-1.5 rounded-full bg-red-900/20 border border-red-800/30 text-red-400">
                {post.category}
              </span>
              <span className="font-mono text-xs text-gray-600 flex items-center gap-1.5">
                <Clock size={11} /> {post.readTime}
              </span>
              <span className="font-mono text-xs text-gray-600">{post.date}</span>
            </div>

            {/* Title */}
            <h1 className="font-['Bricolage_Grotesque'] text-[clamp(2rem,4.5vw,3.4rem)] font-extrabold leading-[1.1] tracking-[-0.03em] mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="font-['Plus_Jakarta_Sans'] text-lg text-white/50 leading-relaxed max-w-2xl mb-9">
              {post.excerpt}
            </p>

            {/* Author + share */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center font-['Bricolage_Grotesque'] font-extrabold text-base text-white shrink-0">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-['Bricolage_Grotesque'] font-bold text-sm">{post.author.name}</p>
                  <p className="font-mono text-xs text-gray-600">{post.author.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[
                  { icon: <Twitter size={13} />, label: 'Tweet', onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank') },
                  { icon: <Copy size={13} />, label: 'Copy link', onClick: () => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); } },
                  { icon: <Bookmark size={13} />, label: 'Save', onClick: () => { /* Save logic */ } },
                ].map(({ icon, label, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-800 bg-transparent font-mono text-xs text-gray-400 transition-all duration-200 hover:border-red-600 hover:text-red-600"
                  >
                    {icon} {label}
                  </button>
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
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-16 items-start">
          {/* ── Main content ── */}
          <motion.article
            className="prose prose-lg max-w-none
              prose-headings:font-['Bricolage_Grotesque'] prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-gray-900
              prose-h2:text-2xl prose-h2:mt-11 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-5
              prose-ul:list-none prose-ul:pl-0 prose-ul:space-y-2 prose-ul:mb-5
              prose-li:text-gray-600 prose-li:leading-relaxed prose-li:flex prose-li:gap-2 prose-li:items-start
              prose-li:before:content-[''] prose-li:before:block prose-li:before:w-1.5 prose-li:before:h-1.5 prose-li:before:rounded-full prose-li:before:bg-red-600 prose-li:before:mt-2 prose-li:before:flex-shrink-0
              prose-blockquote:border-l-4 prose-blockquote:border-red-600 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:bg-red-50/30 prose-blockquote:rounded-r-lg prose-blockquote:my-7
              prose-blockquote:p:italic prose-blockquote:p:text-gray-700 prose-blockquote:p:text-base
              prose-img:rounded-xl prose-img:my-8
              prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            dangerouslySetInnerHTML={renderContent()}
          />

          {/* ── Sidebar ── */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="sticky top-20 hidden lg:block"
          >
            {/* Table of contents - dynamically generated from headings */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <p className="font-['Bricolage_Grotesque'] font-bold text-sm text-gray-900 mb-4">In this article</p>
              <div className="flex flex-col gap-2.5">
                {post.content.match(/<h2[^>]*>(.*?)<\/h2>/g)?.map((heading, i) => {
                  const text = heading.replace(/<[^>]*>/g, '');
                  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  return (
                    <a 
                      key={i}
                      href={`#${id}`}
                      className="font-['Plus_Jakarta_Sans'] text-xs text-gray-500 no-underline leading-tight py-1 pl-2.5 transition-all duration-200 hover:text-red-600"
                      style={{ borderLeft: i === 0 ? '2px solid #DC143C' : '2px solid transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#DC143C'; e.currentTarget.style.borderLeftColor = '#DC143C'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#777'; e.currentTarget.style.borderLeftColor = i === 0 ? '#DC143C' : 'transparent'; }}
                    >
                      {text}
                    </a>
                  );
                }) || (
                  <p className="text-xs text-gray-400">No headings found</p>
                )}
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
                className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-['Bricolage_Grotesque'] font-bold text-xs transition-all duration-200 hover:bg-red-700"
              >
                Get Started Free
              </Link>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* ── RELATED POSTS — off-white ── */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 px-6 py-20 border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 font-mono text-xs uppercase tracking-wider text-gray-600 mb-6">
              More from the blog
            </div>
            <h2 className="font-['Bricolage_Grotesque'] text-3xl font-extrabold tracking-tight text-gray-900 mb-10">
              Keep reading
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post, i) => (
                <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.08 }} viewport={{ once: true }}>
                  <Link href={`/blog/${post.slug}`} className="block transition-all duration-300 hover:-translate-y-1">
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
      )}

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
                className="flex-1 min-w-50 px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white font-['Plus_Jakarta_Sans'] text-sm outline-none focus:border-red-600 transition-colors" 
              />
              <button className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg font-['Bricolage_Grotesque'] font-bold text-sm transition-all duration-200 hover:bg-red-700 shrink-0">
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