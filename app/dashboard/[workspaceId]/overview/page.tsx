'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Mail,
  Lock,
  FileText,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  CreditCard,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useDashboardStore } from '@/lib/stores/dashboard/dashboard';
import { QuickStats } from './_component/quick-stats';
import { UsageChart } from './_component/usage-chart';
import { UsageProgress } from './_component/usage-progress';
import { RecentActivity } from './_component/recent-activity';
import { TopUpModal } from './_component/top-up-modal';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function OverviewPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const OurServices = [
    {
      title: 'SMS service',
      description: 'Send bulk and transactional SMS messages',
      icon: MessageSquare,
      href: `/dashboard/${workspaceId}/sms`,
      statKey: 'sms',
    },
    {
      title: 'Email Service',
      description: 'Send emails with templates and tracking',
      icon: Mail,
      href: `/dashboard/${workspaceId}/email`,
      statKey: 'email',
    },
    {
      title: 'OTP Service',
      description: 'Multi-channel OTP verification',
      icon: Lock,
      href: '/dashboard/otp',
      statKey: 'otp',
    },
    {
      title: 'File Storage',
      description: 'Secure file management with CDN',
      icon: FileText,
      href: `/dashboard/${workspaceId}/file-manager`,
      statKey: 'storage',
    },
    {
      title: 'Blog Service',
      description: 'Manage and publish your blog posts',
      icon: FileText,
      href: '/dashboard/blog',
      statKey: 'blog',
    },
    {
      title: 'Push Notifications',
      description: 'Engage users with real-time push messages',
      icon: MessageSquare,
      href: '/dashboard/push',
      statKey: 'push',
    },
    {
      title: 'Newsletter Subscribers',
      description: 'Engage users with real-time push messages',
      icon: MessageSquare,
      href: `/dashboard/${workspaceId}/subscribers`,
      statKey: 'subscribers',
    },
  ];


  const [topUpService, setTopUpService] = useState<{ title: string; type: string; unit?: string } | null>(null);

  const { 
    overview, 
    chartData, 
    chartPeriod,
    isLoading, 
    error,
    fetchOverview, 
    fetchChartData,
    setChartPeriod,
  } = useDashboardStore();

  const [serviceCosts, setServiceCosts] = useState<any[]>([]);

  const serviceConfig = [
    {
      statKey: 'sms',
      title: 'SMS ',
      icon: MessageSquare,
      color: '#DC143C'
    },
    {
      statKey: 'email',
      title: 'Email',
      icon: Mail,
      color: '#4CAF50'
    },
    {
      statKey: 'otp',
      title: 'OTP Service',
      icon: Lock,
      color: '#FF9800'
    },
    {
      statKey: 'storage',
      title: 'File Storage',
      icon: FileText,
      unit: 'MB',
      color: '#2196F3'
    },
    {
      statKey: 'blog',
      title: 'Blog Service',
      icon: FileText,
      color: '#9C27B0'
    },
    {
      statKey: 'push',
      title: 'Push Notifications',
      icon: MessageSquare,
      color: '#E91E63'
    },
    {
      statKey: 'api',
      title: 'API Calls',
      icon: Zap,
      color: '#607D8B'
    },
    {
      statKey: 'subscribers',
      title: 'Newsletter Subscribers',
      icon: Zap,
      color: '#607D8B'
    },
  ];

  const services = useMemo(() => {
    if (!serviceCosts.length) return [];

    return serviceCosts
        .filter(cost => cost.isActive)
        .map(cost => {
          const config = serviceConfig.find(c => c.statKey.toUpperCase() === cost.service.toUpperCase());
          if (!config) return null;
          return {
            ...config,
            ...cost,
            title: config.title, // Keep UI title
          };
        })
        .filter(Boolean);
  }, [serviceCosts]);

  useEffect(() => {
    const fetchServiceCosts = async () => {
      try {
        const response = await fetch('/api/service-costs');
        const result = await response.json();
        if (result.success) {
          setServiceCosts(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch service costs:', error);
      }
    };
    fetchServiceCosts();
  }, []);


  const handleTopUp = (service: any) => {
    setTopUpService({
      title: service.title,
      type: service.statKey || service.type,
      unit: service.unit
    });
  };


  // Get usage data from dashboard overview (sync with overview page)
  const usage = overview?.usage || {
    sms: { used: 0, limit: 0, percentage: 0 },
    email: { used: 0, limit: 0, percentage: 0 },
    otp: { used: 0, limit: 0, percentage: 0 },
    storage: { used: 0, limit: 0, percentage: 0 },
    blog: { used: 0, limit: 0, percentage: 0 },
    push: { used: 0, limit: 0, percentage: 0 },
    api: { used: 0, limit: 0, percentage: 0 },
  };

  const walletData = overview?.wallet || {
    balance: 0,
    smsCredits: 0,
    emailCredits: 0,
    otpCredits: 0,
    storageCredits: 0,
    blogCredits: 0,
    pushCredits: 0,
    apiCredits: 0,
  };


  useEffect(() => {
    if (workspaceId) {
      fetchOverview(workspaceId);
      fetchChartData(workspaceId, chartPeriod);
    }
  }, [workspaceId, chartPeriod, fetchOverview, fetchChartData]);


  if (error) { 
    return (
      <div className="p-6">
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFE5E5', color: '#B81C1C' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="rounded-lg p-8 sm:p-12 bg-card border border-border bg-linear-to-br from-primary/5 to-primary/10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 capitalize text-foreground">
            Welcome to {overview?.workspace?.name || 'Drop APHI'}
          </h1>
          <p className="text-lg mb-6 text-muted-foreground">
            {overview ? (
              <>You're on the <span className="font-bold capitalize text-primary">{overview.workspace.plan.toLowerCase()}</span> plan. Here's your usage overview.</>
            ) : (
              'You\'re all set to start sending messages. Choose a service below to get started.'
            )}
          </p>
          <div className="flex gap-4">
            <Link href="/docs">
              <Button variant="outline">
                View Documentation
              </Button>
            </Link>
            {overview?.subscription && (
              <Link href={`/dashboard/${workspaceId}/billing`}>
                <Button variant="outline">
                  Manage Subscription
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.section>

      {/* Quick Stats */}
      <QuickStats 
        overview={overview} 
        isLoading={isLoading.overview} 
      />

      {topUpService && (
        <TopUpModal
          isOpen={!!topUpService}
          onClose={() => setTopUpService(null)}
          serviceTitle={topUpService.title}
          serviceType={topUpService.type}
          unit={topUpService.unit}
          workspaceId={workspaceId}
        />
      )}

      {/* Usage Charts */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Usage Overview
          </h2>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((period) => (
              // <button
              //   key={period}
              //   onClick={() => {
              //     setChartPeriod(period);
              //     fetchChartData( period);
              //   }}
              <button
              key={period}
              onClick={() => {
                setChartPeriod(period);
                fetchChartData(workspaceId, period);
              }}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  chartPeriod === period 
                    ? 'text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: chartPeriod === period ? '#DC143C' : 'transparent',
                }}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <UsageChart 
          data={chartData} 
          isLoading={isLoading.charts} 
        />
      </motion.section>

      {/* Usage Progress Bars */}
      {overview && services.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Current Usage
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service: any) => {
              const key = service.statKey as keyof typeof usage;
              const item = usage[key] || { used: 0, limit: 0, percentage: 0 };
              const creditsKey = `${key}Credits` as keyof typeof walletData;
              const credits = (walletData[creditsKey] as number) || 0;

              return (
                  <UsageProgress
                      key={service.statKey}
                      title={service.title}
                      used={item.used}
                      limit={item.limit}
                      percentage={item.percentage}
                      walletCredits={credits}
                      color={service.color}
                      icon={service.icon}
                      unit={service.unit}
                      onTopUp={() => handleTopUp(service)}
                  />
              );
            })}
          </div>

          {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">*/}
          {/*  {services.map((service: any) => {*/}
          {/*    const key = service.statKey as keyof typeof overview.usage;*/}
          {/*    const usageData = overview.usage[key] || { used: 0, limit: 0, percentage: 0 };*/}
          {/*    const creditsKey = `${key}Credits` as keyof typeof overview.wallet;*/}
          {/*    const credits = (overview.wallet?.[creditsKey] as number) || 0;*/}

          {/*    return (*/}
          {/*      <UsageProgress*/}
          {/*        key={service.statKey}*/}
          {/*        title={service.title.replace(' API', '').replace(' Service', '')}*/}
          {/*        used={usageData.used}*/}
          {/*        limit={usageData.limit}*/}
          {/*        percentage={usageData.percentage}*/}
          {/*        walletCredits={credits}*/}
          {/*        color={service.color}*/}
          {/*        icon={service.icon}*/}
          {/*        unit={service.unit}*/}
          {/*        onTopUp={() => setTopUpService({*/}
          {/*          title: service.title,*/}
          {/*          type: service.statKey,*/}
          {/*          unit: service.unit*/}
          {/*        })}*/}
          {/*      />*/}
          {/*    );*/}
          {/*  })}*/}
          {/*</div>*/}
        </motion.section>
      )}

      {/* Services Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service: any) => {
            const Icon = service.icon;
            const stats = overview?.stats.total[service.statKey as keyof typeof overview.stats.total] || 0;
            
            return (
              <motion.div
                key={service.statKey}
                variants={itemVariants}
                className="group p-6 rounded-lg border transition-all cursor-pointer bg-card border-border hover:border-primary"
              >
                <Link href={`/dashboard/${workspaceId}${service.href}`} className="block h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-lg bg-primary/10"
                    >
                      <Icon size={24} className="text-primary" />
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-foreground">
                    {service.title}
                  </h3>
                  <p className="text-sm mb-6 text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="flex gap-6 text-xs">
                    <div>
                      <p className="uppercase text-muted-foreground">
                        {service.statKey === 'storage' ? 'FILES' : 'SENT'}
                      </p>
                      <p
                        className="font-bold text-sm mt-1 text-foreground"
                      >
                        {service.statKey === 'storage' 
                          ? `${stats} files` 
                          : stats.toLocaleString()}
                      </p>
                    </div>
                    {service.statKey !== 'storage' && (
                      <div>
                        <p className="uppercase text-muted-foreground">
                          SUCCESS
                        </p>
                        <p
                          className="font-bold text-sm mt-1 text-foreground"
                        >
                          {overview?.stats.success[service.statKey as keyof typeof overview.stats.success] || 0}%
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Recent Activity */}
      {overview && (
        <RecentActivity
          sms={overview.recent?.sms || []}
          emails={overview.recent?.emails || []}
          workspaceId={workspaceId}
        />
      )}

      {/* Getting Started (shown only if no usage) */}
      {overview?.stats?.total?.sms === 0 && 
       overview?.stats?.total?.email === 0 && 
       overview?.stats?.total?.otp === 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Getting Started
          </h2>
          <div className="space-y-4">
            {[
              {
                title: 'Get API Keys',
                description: 'Navigate to API Keys section and copy your credentials',
                icon: '1',
                href: `/dashboard/${workspaceId}/api-keys`,
              },
              {
                title: 'Read the Docs',
                description: 'Check out our comprehensive documentation and examples',
                icon: '2',
                href: '/docs',
              },
              {
                title: 'Send Your First Message',
                description: 'Start with SMS, Email, or OTP service',
                icon: '3',
                href: `/dashboard/${workspaceId}/email`,
              },

            ].map((step) => (
              <Link key={step.icon} href={step.href}>
                <div
                  className="flex gap-4 p-4 rounded-lg border hover:border-red-600 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E5E5',
                  }}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: '#DC143C' }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1" style={{ color: '#1A1A1A' }}>
                      {step.title}
                    </h3>
                    <p className="text-xs" style={{ color: '#666666' }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}