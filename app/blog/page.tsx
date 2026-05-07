'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import Footer from '@/components/landingpage/Footer';
import { useAuthStore } from '@/lib/stores/auth';
import Navigation from '@/components/landingpage/Navigation';
import { useState, useEffect } from 'react';

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = (content || '').trim().split(/\s+/).length;
  const mins = Math.ceil(words / wordsPerMinute);
  return `${mins} min read`;
}

export default function BlogPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/admin/blog?isApproved=true&status=PUBLISHED');
        const data = await res.json();
        if (data.success) {
          setPosts(data.data.posts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const featuredPost = posts.find(p => p.isFeatured) || posts[0];
  const displayPosts = posts.filter(p => p.id !== featuredPost?.id);

  const FEATURED = featuredPost ? {
    slug: featuredPost.slug,
    tag: featuredPost.tags[0] || 'Engineering',
    tagColor: '#DC143C',
    title: featuredPost.title,
    excerpt: featuredPost.excerpt,
    author: featuredPost.author?.fullName || 'Golddick O.',
    role: 'Founder & CEO',
    date: featuredPost.publishedAt ? new Date(featuredPost.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'March 12, 2025',
    readTime: calculateReadingTime(featuredPost.content),
  } : {
    slug: 'why-african-developers-need-local-infra',
    tag: 'Engineering',
    tagColor: '#DC143C',
    title: 'Why African Developers Need Communication Infrastructure Built at Home',
    excerpt: 'Global messaging APIs weren\'t designed for African networks. Here\'s what we learned building for 30+ markets — and why local routing intelligence changes everything.',
    author: 'Golddick O.',
    role: 'Founder & CEO',
    date: 'March 12, 2025',
    readTime: '8 min read',
  };

  const CATEGORIES = ['All', 'Engineering', 'Product', 'Tutorials', 'Company'];

  const POSTS = displayPosts.map(p => ({
    slug: p.slug,
    tag: p.tags[0] || 'General',
    tagColor: '#3B82F6',
    title: p.title,
    excerpt: p.excerpt,
    author: p.author?.fullName || 'Anonymous',
    date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
    readTime: calculateReadingTime(p.content),
  }));

  function BlogCover({ color, tag, index }: { color: string; tag: string; index: number }) {
    const patterns = [
      <>
        <rect width="360" height="180" fill={`${color}08`}/>
        {[...Array(8)].map((_,i) => <line key={i} x1={i*52} y1="0" x2={i*52} y2="180" stroke={color} strokeWidth="0.5" opacity="0.15"/>)}
        {[...Array(4)].map((_,i) => <line key={i} x1="0" y1={i*60} x2="360" y2={i*60} stroke={color} strokeWidth="0.5" opacity="0.15"/>)}
        <circle cx="180" cy="90" r="50" fill="none" stroke={color} strokeWidth="1" opacity="0.2"/>
        <circle cx="180" cy="90" r="30" fill="none" stroke={color} strokeWidth="1" opacity="0.15"/>
        <circle cx="180" cy="90" r="8" fill={color} opacity="0.4"/>
      </>,
      <>
        <rect width="360" height="180" fill={`${color}06`}/>
        {[0,30,60,90,120,150].map((y,i) => (
          <path key={i} d={`M0,${y+20} C60,${y} 120,${y+40} 180,${y+20} C240,${y} 300,${y+40} 360,${y+20}`} stroke={color} strokeWidth="1.5" fill="none" opacity="0.15"/>
        ))}
        <rect x="140" y="70" width="80" height="40" rx="8" fill={color} opacity="0.12"/>
      </>,
      <>
        <rect width="360" height="180" fill={`${color}07`}/>
        {[...Array(12)].map((_,i) => <line key={i} x1={i*40-80} y1="0" x2={i*40+80} y2="180" stroke={color} strokeWidth="0.7" opacity="0.12"/>)}
        <rect x="110" y="50" width="140" height="80" rx="12" fill="none" stroke={color} strokeWidth="1.5" opacity="0.25"/>
        <rect x="120" y="60" width="120" height="60" rx="8" fill={color} opacity="0.07"/>
      </>,
    ];
    return (
      <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto rounded-t-xl">
        {patterns[index % patterns.length]}
        <rect x="16" y="148" width="54" height="18" rx="4" fill={color} opacity="0.9"/>
        <text x="22" y="160" className="font-mono text-[9px] font-bold fill-white">{tag.toUpperCase()}</text>
      </svg>
    );
  }

  return (
    <div className="overflow-x-hidden bg-white">
      <Navigation user={user} />

      <section className="bg-black text-white px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-3/5 w-[700px] h-[500px] bg-[radial-gradient(ellipse,rgba(220,20,60,0.12)_0%,transparent_65%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-900/20 border border-red-800/30 font-mono text-xs uppercase tracking-wider text-red-400 mb-6">
              The Drop APHI Blog
            </div>
            <h1 className="font-['Bricolage_Grotesque'] text-[clamp(2.6rem,5.5vw,4.4rem)] font-extrabold leading-[1.07] tracking-[-0.035em] mb-5 max-w-3xl">
              Engineering, product,<br />
              <span className="text-red-600">and building for Africa.</span>
            </h1>
            <p className="font-['Plus_Jakarta_Sans'] text-base text-white/50 leading-relaxed max-w-lg">
              Deep dives, tutorials, and stories from the team building Africa's communication infrastructure.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 font-mono text-xs uppercase tracking-wider text-gray-600 mb-6">
            Featured Post
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link href={`/blog/${FEATURED.slug}`} className="no-underline">
              <div className="bg-black rounded-2xl overflow-hidden border border-gray-900 cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-8 md:p-14">
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs mb-5"
                      style={{ 
                        background: `${FEATURED.tagColor}18`, 
                        border: `1px solid ${FEATURED.tagColor}30`,
                        color: FEATURED.tagColor 
                      }}
                    >
                      {FEATURED.tag}
                    </span>
                    <h2 className="font-['Bricolage_Grotesque'] text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold text-white leading-tight tracking-tight mb-4">
                      {FEATURED.title}
                    </h2>
                    <p className="font-['Plus_Jakarta_Sans'] text-sm text-white/50 leading-relaxed mb-8">
                      {FEATURED.excerpt}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-['Bricolage_Grotesque'] font-extrabold text-xs text-white">
                          {FEATURED.author[0]}
                        </div>
                        <div>
                          <p className="font-['Bricolage_Grotesque'] font-bold text-sm text-white">{FEATURED.author}</p>
                          <p className="font-mono text-xs text-[#555]">{FEATURED.role}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-[#444]">·</span>
                      <span className="font-mono text-xs text-[#555]">{FEATURED.date}</span>
                      <span className="font-mono text-xs text-[#444]">·</span>
                      <span className="font-mono text-xs text-[#555] flex items-center gap-1">
                        <Clock size={11} /> {FEATURED.readTime}
                      </span>
                    </div>
                    <div className="mt-8 inline-flex items-center gap-2 text-red-600 font-['Bricolage_Grotesque'] font-bold text-sm">
                      Read Article <ArrowRight size={15} />
                    </div>
                  </div>

                  <div className="bg-[#111] flex items-center justify-center p-10 min-h-[300px]">
                    <svg viewBox="0 0 320 240" fill="none" className="w-full max-w-[320px]">
                      <rect width="320" height="240" rx="12" fill="#0D0D0D"/>
                      {[...Array(7)].map((_,i) => (
                        <line key={i} x1={i*54} y1="0" x2={i*54} y2="240" stroke="#DC143C" strokeWidth="0.4" opacity="0.12"/>
                      ))}
                      {[...Array(5)].map((_,i) => (
                        <line key={i} x1="0" y1={i*60} x2="320" y2={i*60} stroke="#DC143C" strokeWidth="0.4" opacity="0.12"/>
                      ))}
                      <circle cx="160" cy="120" r="80" fill="none" stroke="#DC143C" strokeWidth="1" opacity="0.12"/>
                      <circle cx="160" cy="120" r="55" fill="none" stroke="#DC143C" strokeWidth="1" opacity="0.18"/>
                      <circle cx="160" cy="120" r="30" fill="none" stroke="#DC143C" strokeWidth="1" opacity="0.25"/>
                      <circle cx="160" cy="120" r="10" fill="#DC143C" opacity="0.7"/>
                      <text x="116" y="218" className="font-mono text-[9px] fill-[#333]">Pan-African Coverage</text>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 flex-wrap mb-12">
            {CATEGORIES.map((cat, i) => (
              <div
                key={cat}
                className="px-4 py-1.5 rounded-full font-mono text-xs border transition-all cursor-pointer"
                style={{
                  color: i === 0 ? 'white' : '#666',
                  background: i === 0 ? '#0A0A0A' : 'white',
                  borderColor: i === 0 ? '#0A0A0A' : '#EBEBEB',
                }}
              >
                {cat}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-xl" />
              ))
            ) : POSTS.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                viewport={{ once: true }}
              >
                <Link href={`/blog/${post.slug}`} className="no-underline">
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <BlogCover color={post.tagColor} tag={post.tag} index={i} />
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3.5">
                        <span 
                          className="font-mono text-xs px-2.5 py-1 rounded-full"
                          style={{ 
                            background: `${post.tagColor}10`, 
                            border: `1px solid ${post.tagColor}25`,
                            color: post.tagColor 
                          }}
                        >
                          {post.tag}
                        </span>
                        <span className="font-mono text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={10} /> {post.readTime}
                        </span>
                      </div>

                      <h3 className="font-['Bricolage_Grotesque'] text-base font-bold text-gray-900 leading-tight tracking-tight mb-2.5">
                        {post.title}
                      </h3>
                      <p className="font-['Plus_Jakarta_Sans'] text-xs text-gray-500 leading-relaxed mb-5 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center font-['Bricolage_Grotesque'] font-extrabold text-xs text-white flex-shrink-0"
                            style={{ background: post.tagColor }}
                          >
                            {post.author[0]}
                          </div>
                          <div>
                            <p className="font-['Bricolage_Grotesque'] font-bold text-xs text-gray-900">{post.author}</p>
                            <p className="font-mono text-[0.62rem] text-gray-400">{post.date}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-red-600" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-900/20 border border-red-800/30 font-mono text-xs uppercase tracking-wider text-red-400 mb-5">
              Newsletter
            </div>
            <h2 className="font-['Bricolage_Grotesque'] text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight leading-tight text-white mb-4">
              Engineering updates,<br /><span className="text-red-600">straight to your inbox</span>
            </h2>
            <p className="font-['Plus_Jakarta_Sans'] text-sm text-white/45 leading-relaxed mb-8">
              No spam. Just deep dives, tutorials, and product updates from the Drop APHI team.
            </p>
            <div className="flex gap-2.5 max-w-lg mx-auto flex-wrap">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-[200px] px-4 py-3 rounded-lg bg-[#141414] border border-[#222] text-white font-['Plus_Jakarta_Sans'] text-sm outline-none"
              />
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-['Bricolage_Grotesque'] font-bold hover:bg-red-700 transition-all flex-shrink-0">
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
