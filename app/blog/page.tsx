'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Search } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    slug: 'getting-started-with-drop-api',
    title: 'Getting Started with Drop API',
    excerpt: 'Learn how to integrate Drop API into your application in just 5 minutes.',
    category: 'Tutorials',
    author: 'John Doe',
    date: '2024-02-15',
    readTime: '5 min read',
    image: '📚',
  },
  {
    id: 2,
    slug: 'best-practices-for-sms-campaigns',
    title: 'Best Practices for SMS Campaigns',
    excerpt: 'Maximize engagement with these proven SMS marketing strategies.',
    category: 'Tutorials',
    author: 'Jane Smith',
    date: '2024-02-10',
    readTime: '8 min read',
    image: '📱',
  },
  {
    id: 3,
    slug: 'understanding-otp-security',
    title: 'Understanding OTP Security',
    excerpt: 'Deep dive into how OTP technology protects your users.',
    category: 'Updates',
    author: 'Bob Johnson',
    date: '2024-02-08',
    readTime: '10 min read',
    image: '🔐',
  },
  {
    id: 4,
    slug: 'scaling-your-communication-stack',
    title: 'Scaling Your Communication Stack',
    excerpt: 'Handle millions of messages with Drop API infrastructure.',
    category: 'Case Studies',
    author: 'Alice Williams',
    date: '2024-02-05',
    readTime: '12 min read',
    image: '🚀',
  },
  {
    id: 5,
    slug: 'email-deliverability-tips',
    title: 'Email Deliverability Tips',
    excerpt: 'Ensure your emails reach the inbox with these expert tips.',
    category: 'Tutorials',
    author: 'Charlie Brown',
    date: '2024-02-01',
    readTime: '7 min read',
    image: '✉️',
  },
  {
    id: 6,
    slug: 'drop-api-ecosystem-overview',
    title: 'Drop API Ecosystem Overview',
    excerpt: 'Explore the complete suite of APIs available in Drop.',
    category: 'Updates',
    author: 'Diana Prince',
    date: '2024-01-28',
    readTime: '6 min read',
    image: '🌍',
  },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Tutorials', 'Updates', 'Case Studies'];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main style={{ backgroundColor: '#FAFAFA' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: '#E5E5E5' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded font-bold text-white text-sm"
                style={{ backgroundColor: '#DC143C' }}
              >
                D
              </div>
              <span className="hidden sm:inline font-bold text-lg" style={{ color: '#1A1A1A' }}>
                Drop API
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/auth/login">
                <Button variant="outline" className="text-xs sm:text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="text-xs sm:text-sm" style={{ backgroundColor: '#DC143C' }}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Blog & Resources
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: '#666666' }}>
            Learn, grow, and stay updated with Drop API insights and best practices.
          </p>
        </motion.div>
      </section>

      {/* Search and Filter */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-3 h-5 w-5" style={{ color: '#999999' }} />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: (selectedCategory === null && category === 'All') || selectedCategory === category ? '#DC143C' : '#FFFFFF',
                  color: (selectedCategory === null && category === 'All') || selectedCategory === category ? '#FFFFFF' : '#1A1A1A',
                  border: (selectedCategory === null && category === 'All') || selectedCategory === category ? 'none' : '1px solid #E5E5E5',
                }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Blog Posts Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {filteredPosts.map((post, index) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="p-6 border rounded-lg cursor-pointer transition-all hover:scale-105"
                style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
              >
                <div className="text-4xl mb-3">{post.image}</div>
                <div className="mb-3">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded"
                    style={{ backgroundColor: '#F5F5F5', color: '#DC143C' }}
                  >
                    {post.category}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-2" style={{ color: '#1A1A1A' }}>
                  {post.title}
                </h3>
                <p className="text-sm mb-4 line-clamp-2" style={{ color: '#666666' }}>
                  {post.excerpt}
                </p>
                <div className="flex justify-between items-center text-xs" style={{ color: '#999999' }}>
                  <span>{post.author}</span>
                  <span>{post.readTime}</span>
                </div>
                <div className="text-xs mt-3" style={{ color: '#999999' }}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p style={{ color: '#999999' }} className="text-lg">
              No articles found matching your search.
            </p>
          </motion.div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t mt-12 sm:mt-16 md:mt-24 py-8 sm:py-12" style={{ borderColor: '#E5E5E5' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm" style={{ color: '#666666' }}>
              &copy; 2024 Drop API. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
