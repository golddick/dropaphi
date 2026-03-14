


'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  MessageSquare, Mail, Shield, Database, Layout, Smartphone,
  Zap, ArrowRight, CheckCircle, Users, TrendingUp, Menu, X,
  Play, Code, Globe, Lock, Cpu
} from 'lucide-react';

// Splash Screen
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-br from-red-600 via-red-700 to-red-900"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <h1 className="text-7xl font-black text-white tracking-tight">
          DROP<span className="text-yellow-300">APHI</span>
        </h1>
      </motion.div>
      <motion.div 
        className="mt-8 h-1 w-48 bg-red-800 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div 
          className="h-full bg-linear-to-r from-yellow-300 via-white to-yellow-300"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2 }}
        />
      </motion.div>
      <motion.p 
        className="mt-4 text-red-100 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Loading Platform...
      </motion.p>
    </motion.div>
  );
};

// Navbar
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-4' : 'bg-white border-b border-gray-200 py-6'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-linear-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-gray-900">
            DROP<span className="text-red-600">API</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {[
            { name: 'Products', href: '#products' },
            { name: 'Developers', href: '#developers' },
            { name: 'Pricing', href: '#pricing' },
            { name: 'About', href: '/about' },
            { name: 'Blog', href: '/blog' },
          ].map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth/signin" className="hidden md:block text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors">
            Sign In
          </Link>
          <Link href="/auth/signup">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 text-sm font-bold text-white bg-linear-to-r from-red-600 to-red-700 rounded-lg shadow-md hover:shadow-xl transition-all"
            >
              Get Started
            </motion.button>
          </Link>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-6 py-4 space-y-4">
              {['Products', 'Developers', 'Pricing', 'About', 'Blog'].map((item) => (
                <Link 
                  key={item} 
                  href={`/${item.toLowerCase()}`}
                  className="block text-base font-semibold text-gray-700 hover:text-red-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Hero Section
const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-linear-to-br from-gray-50 via-white to-red-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-50" />
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
            v2.0 Live: Africa-Optimized Infrastructure
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-6">
            Unified Communication
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-red-600 via-red-500 to-yellow-500">
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

          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {['A', 'B', 'C', 'D'].map((letter, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-red-600 border-2 border-white flex items-center justify-center text-sm font-bold text-white shadow-md">
                  {letter}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">2,000+ Developers</p>
              <p className="text-xs text-gray-500">Building on Drop APHI</p>
            </div>
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
  );
};

// Stats Section
const Stats = () => {
  return (
    <section className="py-20 bg-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Messages Sent", value: "50M", suffix: "+", icon: MessageSquare },
            { label: "Uptime", value: "99.9", suffix: "%", icon: Zap },
            { label: "Avg Latency", value: "<100", suffix: "ms", icon: Cpu },
            { label: "Developers", value: "2k", suffix: "+", icon: Users },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              className="text-center p-6 rounded-2xl bg-linear-to-br from-gray-50 to-white border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all group"
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <stat.icon className="w-10 h-10 text-red-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <div className="flex items-baseline justify-center mb-2">
                <h3 className="text-4xl md:text-5xl font-black text-gray-900">{stat.value}</h3>
                <span className="text-2xl font-bold text-red-600 ml-1">{stat.suffix}</span>
              </div>
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Section
const Features = () => {
  const features = [
    {
      title: "SMS Gateway",
      description: "Direct carrier routes across Nigeria, Ghana & Kenya with 99.9% delivery rate.",
      icon: MessageSquare,
      gradient: "from-red-500 to-red-600",
    },
    {
      title: "Email API",
      description: "Transactional emails that land in inbox, not spam. Template support included.",
      icon: Mail,
      gradient: "from-yellow-500 to-yellow-600",
    },
    // {
    //   title: "WhatsApp Business",
    //   description: "Official API integration for rich media and two-way customer conversations.",
    //   icon: Smartphone,
    //   gradient: "from-green-500 to-green-600",
    // },
    {
      title: "OTP Verification",
      description: "Multi-channel one-time passwords via SMS, Email, or WhatsApp in seconds.",
      icon: Shield,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "File Storage",
      description: "Edge-cached CDN storage for images, documents, and media files globally.",
      icon: Database,
      gradient: "from-purple-500 to-purple-600",
    },
    // {
    //   title: "Portfolio Builder",
    //   description: "Generate professional developer portfolios with integrated contact forms.",
    //   icon: Layout,
    //   gradient: "from-pink-500 to-pink-600",
    // }
  ];

  return (
    <section className="py-24 bg-linear-to-br from-gray-50 via-white to-red-50" id="products">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-gray-900 mb-4"
          >
            All-in-One Communication Platform
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Everything you need to reach your users across multiple channels
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-red-200 hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${feature.gradient} p-3 mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              
              <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-red-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTA = () => {
  return (
    <section className="py-24 bg-linear-to-br from-red-600 via-red-700 to-red-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black text-white mb-6"
        >
          Ready to Drop the Complexity?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-red-100 mb-10 max-w-2xl mx-auto"
        >
          Join 2,000+ developers building the next generation of African applications
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-white text-red-600 font-black rounded-xl hover:bg-gray-100 transition-colors shadow-2xl text-lg"
            >
              Get Started for Free
            </motion.button>
          </Link>
          <Link href="/contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-transparent border-2 border-white text-white font-black rounded-xl hover:bg-white/10 transition-colors text-lg"
            >
              Contact Sales
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => (
  <footer className="bg-gray-900 text-white pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-linear-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-black">DROP<span className="text-red-500">APHI</span></span>
          </div>
          <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
            Unified communication infrastructure. Send SMS, Email and more with a single API.
          </p>
          <div className="flex gap-4">
            {['T', 'G', 'D'].map((social, i) => (
              <a 
                key={i} 
                href="#" 
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors font-bold"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
        
        {[
        //   { 
        //     title: "Product", 
        //     links: [
        //       { name: "SMS API", href: "/products/sms" },
        //       { name: "Email API", href: "/products/email" },
        //       { name: "WhatsApp", href: "/products/whatsapp" },
        //       { name: "Pricing", href: "/pricing" }
        //     ] 
        //   },
          { 
            title: "Developers", 
            links: [
              { name: "Documentation", href: "/docs" },
              { name: "DropID Reference", href: "/docs/dropid" },
            //   { name: "SDKs", href: "/docs/sdks" },
            //   { name: "Status", href: "/status" }
            ] 
          },
          { 
            title: "Company", 
            links: [
              { name: "About", href: "/about" },
              { name: "Blog", href: "/blog" },
            //   { name: "Careers", href: "/careers" },
            //   { name: "Contact", href: "/contact" }
            ] 
          },
          { 
            title: "Legal", 
            links: [
              { name: "Privacy", href: "/privacy" },
              { name: "Terms", href: "/terms" },
            //   { name: "Cookies", href: "/cookies" },
            //   { name: "Security", href: "/security" }
            ] 
          },
        ].map((column, index) => (
          <div key={index}>
            <h4 className="text-white font-bold mb-4 text-lg">{column.title}</h4>
            <ul className="space-y-3">
              {column.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-red-500 transition-colors relative group inline-block text-sm"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm">
          © 2026 Drop API Inc. All rights reserved. Made with ❤️ in Lagos, Nigeria.
        </p>
        <div className="flex gap-6 text-sm">
          <a href="/sitemap" className="text-gray-500 hover:text-red-500 transition-colors">Sitemap</a>
          <a href="/accessibility" className="text-gray-500 hover:text-red-500 transition-colors">Accessibility</a>
        </div>
      </div>
    </div>
  </footer>
);

// Main Component
export default function LandingPage() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <SplashScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white min-h-screen text-gray-900"
        >
          <Navbar />
          <Hero />
          <Stats />
          <Features />
          <CTA />
          <Footer />
        </motion.div>
      )}
    </>
  );
}