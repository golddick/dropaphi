'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  const values = [
    { title: 'Reliability', description: 'Enterprise-grade infrastructure with 99.9% uptime SLA' },
    { title: 'Innovation', description: 'Continuously improving our APIs with cutting-edge technology' },
    { title: 'Support', description: '24/7 dedicated support team for your success' },
    { title: 'Transparency', description: 'Simple pricing with no hidden fees or surprises' },
    { title: 'Pan-African', description: 'Optimized for African markets with local partnerships' },
    { title: 'Developer-First', description: 'Comprehensive docs and SDKs for all platforms' },
  ];

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
            About Drop API
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: '#666666' }}>
            Revolutionizing communication infrastructure for Africa, one API at a time.
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Our Story
            </h2>
            <p className="mb-4 leading-relaxed" style={{ color: '#666666' }}>
              Drop API was founded with a simple mission: to make reliable communications infrastructure accessible to every developer and business in Africa. We recognized that existing global solutions didn't meet the unique needs of African markets.
            </p>
            <p className="mb-4 leading-relaxed" style={{ color: '#666666' }}>
              Starting from a garage in Lagos, we've grown to serve thousands of developers across the continent, delivering millions of messages and files daily with unmatched reliability.
            </p>
            <p style={{ color: '#666666' }}>
              Today, Drop API powers communication for e-commerce platforms, financial services, healthcare providers, and SaaS companies across Africa.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="hidden md:block p-8 rounded-lg"
            style={{ backgroundColor: '#F5F5F5' }}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold" style={{ color: '#DC143C' }}>FOUNDED</p>
                <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>2021</p>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#DC143C' }}>HEADQUARTERS</p>
                <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Lagos, Nigeria</p>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#DC143C' }}>CUSTOMERS</p>
                <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>5000+</p>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#DC143C' }}>MESSAGES/DAY</p>
                <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>50M+</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24" style={{ backgroundColor: '#F5F5F5' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            The Problem We Solve
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#666666' }}>
            Africa's communication infrastructure challenges required a native solution.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { title: 'Unreliable Delivery', description: 'Global providers fail to deliver consistently in African networks' },
            { title: 'Expensive Solutions', description: 'International rates make communication costs prohibitive' },
            { title: 'Poor Support', description: 'Limited support for African timezones and local requirements' },
            { title: 'Complex Integration', description: 'Existing platforms require complex setup and maintenance' },
            { title: 'No Local Expertise', description: 'Lack of understanding of regional regulatory requirements' },
            { title: 'Limited Features', description: 'Few platforms offer SMS, Email, OTP, and Storage in one place' },
          ].map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-lg"
              style={{ backgroundColor: '#FFFFFF', borderLeft: '4px solid #DC143C' }}
            >
              <h3 className="font-bold mb-2" style={{ color: '#1A1A1A' }}>
                {problem.title}
              </h3>
              <p style={{ color: '#666666' }} className="text-sm">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Our Values
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 border rounded-lg hover:scale-105 transition-transform"
              style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
            >
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>
                {value.title}
              </h3>
              <p style={{ color: '#666666' }} className="text-sm">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="rounded-lg p-8 sm:p-12 md:p-16 text-center"
          style={{ backgroundColor: '#1A1A1A' }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Join Us?
          </h2>
          <p className="text-gray-300 mb-8" style={{ color: '#999999' }}>
            Be part of Africa's communication revolution.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" style={{ backgroundColor: '#DC143C' }}>
              Get Started Free
            </Button>
          </Link>
        </motion.div>
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
