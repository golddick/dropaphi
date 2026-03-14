'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Play } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';
import { ModeToggle } from '../theme-toggle';

export default function Home() {

  const { user } = useAuthStore()

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
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
                Drop APHI
              </span>
            </Link>

              <div className="flex items-center gap-4">
              {!user ? (
          <>
            <Link
              href="/signin"
              className="text-sm font-medium hover:underline"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="bg-black text-white px-4 py-2 rounded-md text-sm"
            >
              Sign Up
            </Link>
          </>
              ) : (
                < div className='flex items-center gap-2'>
                  <Link
                    href="/dashboard"
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Dashboard
                  </Link>
                   {/* <ModeToggle /> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 via-white to-red-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-50" />
      </div>
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[40px_40px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm font-semibold mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            v1.0 Live
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-6">
            Unified Communication
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-red-600 via-red-500 to-red-500">
              Infrastructure
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
            Send SMS, Email, WhatsApp, and OTP with a single API. 
            Built for developers, trusted by 2,000+ businesses.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/auth/signup">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(220,38,38,0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-linear-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center gap-2"
              >
                Start Building Free <ArrowRight size={18} />
              </motion.button>
            </Link>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 font-bold rounded-xl hover:border-red-600 transition-all flex items-center gap-2 shadow-sm"
            >
              <Play size={18} className="fill-red-600 text-red-600" /> Watch Demo
            </motion.button>
          </div>
        </motion.div>

        {/* Code Window */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-yellow-600 rounded-2xl blur opacity-25" />
          <div className="relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-5 py-4 bg-gray-50 border-b-2 border-gray-200">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-sm text-gray-600 font-mono font-semibold">send_sms.js</span>
            </div>
            <div className="p-6 font-mono text-sm bg-gray-900 text-gray-100">
              <div className="space-y-1">
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 w-6 text-right">1</span>
                  <span>
                    <span className="text-purple-400">import</span> {'{ DropAPI }'} <span className="text-purple-400">from</span> <span className="text-green-400">'@dropapi/sdk'</span>;
                  </span>
                </div>
                <div className="flex"><span className="text-gray-600 select-none mr-4 w-6 text-right">2</span></div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 w-6 text-right">3</span>
                  <span><span className="text-purple-400">const</span> <span className="text-blue-400">client</span> = <span className="text-purple-400">new</span> DropAPI({'{'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 w-6 text-right">4</span>
                  <span className="pl-4"><span className="text-yellow-300">apiKey</span>: <span className="text-green-400">'sk_live_...'</span></span>
                </div>
                <div className="flex"><span className="text-gray-600 select-none mr-4 w-6 text-right">5</span><span>{'});'}</span></div>
                <div className="flex mt-3">
                  <span className="text-gray-600 select-none mr-4 w-6 text-right">6</span>
                  <span className="text-gray-500">// Send SMS</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 w-6 text-right">7</span>
                  <span><span className="text-purple-400">const</span> <span className="text-blue-400">result</span> = <span className="text-purple-400">await</span> <span className="text-blue-400">client</span>.sms.send({'{'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 w-6 text-right">8</span>
                  <span className="pl-4"><span className="text-yellow-300">to</span>: <span className="text-green-400">'+234801234567'</span>,</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 w-6 text-right">9</span>
                  <span className="pl-4"><span className="text-yellow-300">message</span>: <span className="text-green-400">'Your code: 8291'</span></span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 select-none mr-4 w-6 text-right">10</span>
                  <span>{'});'}</span>
                </div>
              </div>
              
              <motion.div 
                className="mt-6 p-4 bg-green-500/20 border-2 border-green-500 rounded-lg text-green-400 flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                <CheckCircle size={20} /> 
                <div>
                  <p className="font-bold">Success!</p>
                  <p className="text-xs text-green-300">Message ID: msg_892312332</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

      {/* Services Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16"
          style={{ color: '#1A1A1A' }}
        >
          Powerful APIs for Modern Communication
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {[
            { 
              title: 'SMS API', 
              description: 'Send bulk SMS & transactional messages at scale. Perfect for OTP, alerts, and notifications across Africa.',
              icon: '📱'
            },
            { 
              title: 'Email API', 
              description: 'Reliable email delivery with templates, tracking, and analytics. Built for high-volume sending.',
              icon: '✉️'
            },
            { 
              title: 'OTP Service', 
              description: 'Multi-channel verification via SMS, Email, or WhatsApp. Secure authentication in seconds.',
              icon: '🔐'
            },
            { 
              title: 'File Storage', 
              description: 'Scalable file storage with CDN integration. Global delivery, local reliability.',
              icon: '💾'
            },
          ].map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 border hover:border-opacity-100 transition-all hover:scale-105"
              style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
            >
              <div className="text-3xl mb-3">{service.icon}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>
                {service.title}
              </h3>
              <p style={{ color: '#666666' }} className="text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* DropID Feature Highlight*/}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              DropID: Human-Readable Database IDs
            </h2>
            <p className="text-lg mb-6" style={{ color: '#666666' }}>
              Stop debugging cryptic UUIDs. DropID generates IDs that actually make sense.
            </p>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: '#DC143C' }}>
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: '#1A1A1A' }}>Instantly Readable</p>
                  <p className="text-sm" style={{ color: '#666666' }}>
                    <code className="bg-gray-100 px-2 py-1 rounded">user_a3f2b9c1d4e5</code> instead of <br/>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">550e8400-e29b-41d4-a916-446655440000</code>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: '#DC143C' }}>
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: '#1A1A1A' }}>Multi-Tenant Ready</p>
                  <p className="text-sm" style={{ color: '#666666' }}>
                    <code className="bg-gray-100 px-2 py-1 rounded">acme_order_x7k9m2n4p1q8</code> - Perfect for SaaS apps
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: '#DC143C' }}>
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: '#1A1A1A' }}>Crypto-Secure & Fast</p>
                  <p className="text-sm" style={{ color: '#666666' }}>2-3M IDs/sec, collision-resistant, only 2KB</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/docs/dropid">
                <Button style={{ backgroundColor: '#DC143C' }}>
                  Read Docs
                </Button>
              </Link>
              <a href="https://npmjs.com/package/drop-api-id" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  View on npm
                </Button>
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gray-900 rounded-lg p-6 text-sm font-mono overflow-x-auto shadow-2xl">
              <div className="text-green-400 mb-2">// Before: Cryptic UUIDs</div>
              <div className="text-red-400 line-through mb-4">
                Error: User 550e8400-e29b-41d4-a916-446655440000 not found
              </div>
              <div className="text-green-400 mb-2">// After: Human-Readable</div>
              <div className="text-green-300 mb-6">
                Error: User <span className="text-yellow-300">user_a3f2b9c1d4e5</span> not found
              </div>
              <div className="text-blue-400 mb-2">// Install & Use</div>
              <div className="text-gray-300 mb-1">$ npm install drop-api-id</div>
              <div className="text-gray-300 mb-4"></div>
              <div className="text-purple-400">import</div>
              <div className="text-gray-300 inline"> {'{ dropid }'} </div>
              <div className="text-purple-400 inline">from </div>
              <div className="text-yellow-300 inline">'drop-api-id'</div>
              <div className="text-gray-300">;</div>
              <div className="text-gray-300 mt-4"></div>
              <div className="text-blue-300 inline">dropid</div>
              <div className="text-gray-300 inline">(</div>
              <div className="text-yellow-300 inline">'user'</div>
              <div className="text-gray-300 inline">);</div>
              <div className="text-green-400 mt-1">// → user_a3f2b9c1d4e5</div>
              <div className="text-gray-300 mt-4"></div>
              <div className="text-blue-300 inline">dropid</div>
              <div className="text-gray-300 inline">(</div>
              <div className="text-yellow-300 inline">'order'</div>
              <div className="text-gray-300 inline">, </div>
              <div className="text-yellow-300 inline">'acme'</div>
              <div className="text-gray-300 inline">);</div>
              <div className="text-green-400 mt-1">// → acme_order_x7k9m2n4p1q8</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16"
          style={{ color: '#1A1A1A' }}
        >
          Built for Every Use Case
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
        >
          {[
            {
              title: 'E-Commerce',
              description: 'Order confirmations, shipping updates, and delivery notifications keep customers informed.',
              features: ['Order Confirmations', 'Shipping Alerts', 'Readable Order IDs']
            },
            {
              title: 'SaaS Platforms',
              description: 'Secure authentication, account notifications, and debugging with readable IDs.',
              features: ['2FA/OTP', 'DropID Integration', 'User Analytics']
            },
            {
              title: 'FinTech & Banking',
              description: 'Transaction alerts, authentication, and security notifications for financial institutions.',
              features: ['Transaction Alerts', 'Secure Auth', 'Audit Trails']
            },
            {
              title: 'Healthcare',
              description: 'Appointment reminders, test results, and HIPAA-compliant patient IDs.',
              features: ['Appointment Alerts', 'Patient IDs', 'Test Results']
            },
          ].map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 border rounded-lg"
              style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
            >
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1A1A1A' }}>
                {useCase.title}
              </h3>
              <p className="mb-4" style={{ color: '#666666' }}>
                {useCase.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {useCase.features.map((feature, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs rounded"
                    style={{ backgroundColor: '#F5F5F5', color: '#666666' }}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why Choose Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24" style={{ backgroundColor: '#F5F5F5' }}>
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16"
          style={{ color: '#1A1A1A' }}
        >
          Why Choose Drop API?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {[
            { title: '99.9% Uptime', description: 'Enterprise-grade reliability with redundant infrastructure' },
            { title: 'Pan-African Coverage', description: 'Optimized routes and local partnerships across Africa' },
            { title: 'Simple Pricing', description: 'Pay as you go, no hidden fees, scale effortlessly' },
            { title: 'Developer Friendly', description: 'Comprehensive docs, SDKs, and DropID included free' },
            { title: 'Real-time Analytics', description: 'Track delivery, opens, clicks, and engagement instantly' },
            { title: '24/7 Support', description: 'Dedicated support team ready to help your business' },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6"
            >
              <div
                className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-lg mb-4"
                style={{ backgroundColor: '#DC143C' }}
              >
                {index + 1}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#666666' }} className="text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16"
          style={{ color: '#1A1A1A' }}
        >
          Simple, Transparent Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {[
            { name: 'Starter', price: 'Free', period: '', features: ['1000 SMS/month', '100 Emails/month', 'DropID SDK Included', 'Basic Support', 'Community Access'], highlighted: false },
            { name: 'Professional', price: '$99', period: '/month', features: ['100K SMS/month', '50K Emails/month', 'DropID SDK Included', 'Priority Support', 'Analytics Dashboard', 'API Access'], highlighted: true },
            { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited Everything', 'DropID SDK Included', 'Dedicated Account Manager', 'SLA Guarantee', 'Custom Integration', 'Training & Onboarding'], highlighted: false },
          ].map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 border-2 rounded-lg relative"
              style={{
                borderColor: plan.highlighted ? '#DC143C' : '#E5E5E5',
                backgroundColor: plan.highlighted ? '#FFF' : '#FFFFFF',
              }}
            >
              {plan.highlighted && (
                <div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  POPULAR
                </div>
              )}
              <h3 className="font-bold text-2xl mb-2" style={{ color: '#1A1A1A' }}>
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
                  {plan.price}
                </span>
                {plan.period && <span style={{ color: '#666666' }}>{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: '#666666' }}>
                    <span style={{ color: '#DC143C' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="w-full">
                <Button
                  className="w-full"
                  style={{
                    backgroundColor: plan.highlighted ? '#DC143C' : '#FFFFFF',
                    color: plan.highlighted ? '#FFFFFF' : '#1A1A1A',
                    border: plan.highlighted ? 'none' : '1px solid #E5E5E5'
                  }}
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <div
          className="rounded-lg p-8 sm:p-12 md:p-16 text-center"
          style={{ backgroundColor: '#1A1A1A' }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to get started?
          </h2>
          <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
            Join developers building with Drop API today. DropID SDK included free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="text-sm sm:text-base"
                style={{ backgroundColor: '#DC143C' }}
              >
                Sign Up Now
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                size="lg"
                variant="outline"
                className="text-sm sm:text-base bg-white"
              >
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t mt-12 sm:mt-16 md:mt-24 py-8 sm:py-12"
        style={{ borderColor: '#E5E5E5' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                Product
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: '#666666' }}>
                <li><a href="#" className="hover:underline">Features</a></li>
                <li><a href="#" className="hover:underline">Pricing</a></li>
                <li><Link href="/docs" className="hover:underline">Documentation</Link></li>
                <li><Link href="/docs/dropid" className="hover:underline">DropID SDK</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                Company
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: '#666666' }}>
                <li><Link href="/about" className="hover:underline">About</Link></li>
                <li><Link href="/blog" className="hover:underline">Blog</Link></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                Legal
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: '#666666' }}>
                <li><Link href="/privacy" className="hover:underline">Privacy</Link></li>
                <li><Link href="/terms" className="hover:underline">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4" style={{ color: '#1A1A1A' }}>
                Developers
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: '#666666' }}>
                <li><a href="https://github.com/golddick/dropid" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a></li>
                <li><a href="https://npmjs.com/package/drop-api-id" target="_blank" rel="noopener noreferrer" className="hover:underline">npm Package</a></li>
                <li><a href="#" className="hover:underline">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div
            className="border-t pt-8"
            style={{ borderColor: '#E5E5E5' }}
          >
            <p className="text-center text-sm" style={{ color: '#666666' }}>
              &copy; 2024 Drop API. All rights reserved. DropID is open source (MIT License).
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}












