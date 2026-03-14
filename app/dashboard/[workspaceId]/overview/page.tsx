





'use client';

import { useEffect } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useDashboardStore } from '@/lib/stores/dashboard/dashboard';
import { QuickStats } from './_component/quick-stats';
import { UsageChart } from './_component/usage-chart';
import { UsageProgress } from './_component/usage-progress';
import { RecentActivity } from './_component/recent-activity';

const services = [
  {
    title: 'SMS API',
    description: 'Send bulk and transactional SMS messages',
    icon: MessageSquare,
    href: '/dashboard/sms',
    statKey: 'sms',
  },
  {
    title: 'Email API',
    description: 'Send emails with templates and tracking',
    icon: Mail,
    href: '/dashboard/email',
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
    href: '/dashboard/file-manager',
    statKey: 'storage',
  },
];

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

  useEffect(() => {
    fetchOverview(workspaceId);
    fetchChartData(workspaceId);
  }, [workspaceId]);

  console.log(overview, 'das over')
  console.log(workspaceId, 'das workspace')

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
          className="rounded-lg p-8 sm:p-12"
          style={{ 
            backgroundColor: '#FFFFFF', 
            borderColor: '#E5E5E5', 
            borderWidth: '1px',
            backgroundImage: 'linear-gradient(135deg, rgba(220,20,60,0.02) 0%, rgba(220,20,60,0.05) 100%)',
          }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 capitalize" style={{ color: '#1A1A1A' }}>
            Welcome to {overview?.workspace?.name || 'Drop APHI'}
          </h1>
          <p className="text-lg mb-6" style={{ color: '#666666' }}>
            {overview ? (
              <>You're on the <span className="font-bold capitalize">{overview.workspace.plan.toLowerCase()}</span> plan. Here's your usage overview.</>
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

      {/* Usage Charts */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            Usage Overview
          </h2>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => {
                  setChartPeriod(period);
                  fetchChartData( period);
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
      {overview && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Current Usage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UsageProgress
              title="SMS"
              used={overview.usage.sms.used}
              limit={overview.usage.sms.limit}
              percentage={overview.usage.sms.percentage}
              color="#DC143C"
              icon={MessageSquare}
            />
            <UsageProgress 
              title="Email"
              used={overview.usage.email.used}
              limit={overview.usage.email.limit}
              percentage={overview.usage.email.percentage}
              color="#4CAF50"
              icon={Mail}
            />
            <UsageProgress 
              title="OTP"
              used={overview.usage.otp.used}
              limit={overview.usage.otp.limit}
              percentage={overview.usage.otp.percentage}
              color="#FF9800"
              icon={Lock}
            />
            <UsageProgress 
              title="Storage"
              used={overview.usage.storage.used}
              limit={overview.usage.storage.limit}
              percentage={overview.usage.storage.percentage}
              color="#2196F3"
              icon={FileText}
              unit="MB"
            />
          </div>
        </motion.section>
      )}

      {/* Services Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
          Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            const stats = overview?.stats.total[service.statKey as keyof typeof overview.stats.total] || 0;
            
            return (
              <motion.div
                key={service.href}
                variants={itemVariants}
                className="group p-6 rounded-lg border transition-all cursor-pointer"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E5E5',
                }}
                whileHover={{ borderColor: '#DC143C' }}
              >
                <Link href={`/dashboard/${workspaceId}${service.href}`} className="block h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: 'rgba(220, 20, 60, 0.1)',
                      }}
                    >
                      <Icon size={24} style={{ color: '#DC143C' }} />
                    </div>
                    <ArrowRight
                      size={20}
                      style={{ color: '#999999' }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: '#1A1A1A' }}>
                    {service.title}
                  </h3>
                  <p className="text-sm mb-6" style={{ color: '#666666' }}>
                    {service.description}
                  </p>
                  <div className="flex gap-6 text-xs">
                    <div>
                      <p style={{ color: '#999999' }} className="uppercase">
                        {service.statKey === 'storage' ? 'FILES' : 'SENT'}
                      </p>
                      <p
                        className="font-bold text-sm mt-1"
                        style={{ color: '#1A1A1A' }}
                      >
                        {service.statKey === 'storage' 
                          ? `${stats} files` 
                          : stats.toLocaleString()}
                      </p>
                    </div>
                    {service.statKey !== 'storage' && (
                      <div>
                        <p style={{ color: '#999999' }} className="uppercase">
                          SUCCESS
                        </p>
                        <p
                          className="font-bold text-sm mt-1"
                          style={{ color: '#1A1A1A' }}
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
          sms={overview.recent.sms}
          emails={overview.recent.emails}
          workspaceId={workspaceId}
        />
      )}

      {/* Getting Started (shown only if no usage) */}
      {overview?.stats.total.sms === 0 && 
       overview?.stats.total.email === 0 && 
       overview?.stats.total.otp === 0 && (
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
                href: `/dashboard/${workspaceId}/sms`,
              },
              {
                title: 'Integrate into Your App',
                description: 'Use our SDKs or REST API to integrate',
                icon: '4',
                href: '/docs/api-reference',
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