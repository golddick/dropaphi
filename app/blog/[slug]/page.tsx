'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';

const blogContent: Record<string, any> = {
  'getting-started-with-drop-api': {
    title: 'Getting Started with Drop API',
    author: 'John Doe',
    date: '2024-02-15',
    readTime: '5 min read',
    category: 'Tutorials',
    content: `
      <h2>Introduction</h2>
      <p>Drop API makes it incredibly easy to integrate SMS, Email, OTP, and file storage into your application. In this guide, we'll walk through the basic setup process.</p>

      <h2>Prerequisites</h2>
      <p>Before you begin, make sure you have:</p>
      <ul>
        <li>A Drop API account (create one for free)</li>
        <li>Your API key from the dashboard</li>
        <li>Basic knowledge of REST APIs</li>
      </ul>

      <h2>Step 1: Install the SDK</h2>
      <p>We provide SDKs for popular languages. Install via npm:</p>
      <pre><code>npm install @drop-api/node-sdk</code></pre>

      <h2>Step 2: Initialize the Client</h2>
      <p>Set up the Drop API client in your application:</p>
      <pre><code>const Drop = require('@drop-api/node-sdk');\nconst drop = new Drop('YOUR_API_KEY');</code></pre>

      <h2>Step 3: Send Your First SMS</h2>
      <p>Send a test SMS to verify everything is working:</p>
      <pre><code>await drop.sms.send({\n  to: '+2348012345678',\n  message: 'Hello from Drop API!'\n});</code></pre>

      <h2>Conclusion</h2>
      <p>Congratulations! You've successfully sent your first message with Drop API. Explore our documentation for more advanced features.</p>
    `,
  },
  'best-practices-for-sms-campaigns': {
    title: 'Best Practices for SMS Campaigns',
    author: 'Jane Smith',
    date: '2024-02-10',
    readTime: '8 min read',
    category: 'Tutorials',
    content: `
      <h2>Maximize Your SMS Engagement</h2>
      <p>SMS is one of the most effective communication channels. Here are proven strategies to maximize engagement.</p>

      <h2>1. Timing is Everything</h2>
      <p>Send messages during optimal times. Studies show 9 AM and 7 PM typically have highest engagement rates for most audiences.</p>

      <h2>2. Personalization Works</h2>
      <p>Use recipient names and personalized content. Messages that address users by name see 20% higher engagement.</p>

      <h2>3. Keep it Brief</h2>
      <p>SMS should be concise and action-oriented. Users typically spend less than 30 seconds reading each message.</p>

      <h2>4. Clear Call-to-Action</h2>
      <p>Always include a clear CTA. Whether it's "Reply YES" or "Click here", make the next action obvious.</p>

      <h2>5. Segment Your Audience</h2>
      <p>Different segments respond to different messages. Segment by behavior, location, or preferences for better results.</p>

      <h2>6. Monitor Your Metrics</h2>
      <p>Track delivery rates, open rates, and conversions. Use this data to continuously improve your campaigns.</p>
    `,
  },
  'understanding-otp-security': {
    title: 'Understanding OTP Security',
    author: 'Bob Johnson',
    date: '2024-02-08',
    readTime: '10 min read',
    category: 'Updates',
    content: `
      <h2>OTP Fundamentals</h2>
      <p>One-Time Passwords (OTP) are a critical security layer in modern applications. Learn how they work and why they matter.</p>

      <h2>How OTP Works</h2>
      <p>OTPs are unique, single-use codes generated for each authentication attempt. They typically expire within 5-10 minutes.</p>

      <h2>Multi-Channel Delivery</h2>
      <p>Drop API supports delivering OTPs via SMS, Email, or WhatsApp. Choose the channel best suited for your use case.</p>

      <h2>Security Best Practices</h2>
      <p>Always enforce short expiration times, limit retry attempts, and never log OTP codes in plain text.</p>

      <h2>Implementation Tips</h2>
      <p>Set minimum OTP length to 6 digits, implement rate limiting, and provide clear user feedback during verification.</p>
    `,
  },
  'scaling-your-communication-stack': {
    title: 'Scaling Your Communication Stack',
    author: 'Alice Williams',
    date: '2024-02-05',
    readTime: '12 min read',
    category: 'Case Studies',
    content: `
      <h2>Case Study: E-Commerce Platform</h2>
      <p>Learn how a leading e-commerce platform scaled their communication infrastructure to handle millions of daily messages.</p>

      <h2>The Challenge</h2>
      <p>The platform needed to send order confirmations, shipping updates, and promotional messages at scale without sacrificing reliability.</p>

      <h2>The Solution</h2>
      <p>By implementing Drop API, they achieved:</p>
      <ul>
        <li>99.9% message delivery rate</li>
        <li>Sub-second message processing</li>
        <li>Multi-channel messaging (SMS, Email, Push)</li>
      </ul>

      <h2>Results</h2>
      <p>After implementing Drop API, the platform saw a 45% increase in customer engagement and improved order confirmation rates.</p>

      <h2>Key Takeaways</h2>
      <p>Reliable communication infrastructure is critical for scaling. Choose a provider that can grow with you.</p>
    `,
  },
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogContent[params.slug];

  if (!post) {
    return (
      <main style={{ backgroundColor: '#FAFAFA' }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/blog">
            <Button variant="outline" className="mb-8">
              <ArrowLeft size={18} className="mr-2" />
              Back to Blog
            </Button>
          </Link>
          <div className="text-center py-12">
            <h1 style={{ color: '#1A1A1A' }} className="text-2xl font-bold mb-4">
              Post Not Found
            </h1>
            <p style={{ color: '#666666' }}>The blog post you're looking for doesn't exist.</p>
          </div>
        </div>
      </main>
    );
  }

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
            <Link href="/blog">
              <Button variant="outline" className="text-xs sm:text-sm">
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <div className="mb-4">
              <span
                className="text-xs font-bold px-3 py-1 rounded"
                style={{ backgroundColor: '#F5F5F5', color: '#DC143C' }}
              >
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm" style={{ color: '#999999' }}>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="prose prose-lg"
            style={{ color: '#666666' }}
          >
            <div
              className="space-y-4 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: post.content.replace(/<(h2|p|ul)>/g, '<$1 style="color: #1A1A1A; margin-top: 1.5rem; margin-bottom: 1rem;">').replace(/<h2>/g, '<h2 style="color: #1A1A1A; font-size: 1.875rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">'),
              }}
            />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-lg"
            style={{ backgroundColor: '#F5F5F5' }}
          >
            <h3 className="font-bold text-lg mb-3" style={{ color: '#1A1A1A' }}>
              Ready to build with Drop API?
            </h3>
            <p className="mb-4" style={{ color: '#666666' }}>
              Start integrating communication features into your app today.
            </p>
            <Link href="/auth/signup">
              <Button style={{ backgroundColor: '#DC143C' }}>
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </article>

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
