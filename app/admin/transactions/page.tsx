// app/admin/transactions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Download, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Calendar,
  Filter,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAdminStore } from '@/lib/stores/admin/store/admin.transaction';

export default function AdminTransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const {
    transactions,
    stats,
    isLoading,
    error,
    fetchTransactions,
    exportTransactions,
    clearError,
  } = useAdminStore();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.workspaceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      await exportTransactions(format);
      toast.success(`Transactions exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'SUBSCRIPTION_PAYMENT':
        return 'bg-green-100 text-green-700';
      case 'SUBSCRIPTION_RENEWAL':
        return 'bg-blue-100 text-blue-700';
      case 'SUBSCRIPTION_UPGRADE':
        return 'bg-purple-100 text-purple-700';
      case 'SUBSCRIPTION_DOWNGRADE':
        return 'bg-orange-100 text-orange-700';
      case 'SUBSCRIPTION_REFUND':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'SUBSCRIPTION_PAYMENT':
        return '💰';
      case 'SUBSCRIPTION_RENEWAL':
        return '🔄';
      case 'SUBSCRIPTION_UPGRADE':
        return '⬆️';
      case 'SUBSCRIPTION_DOWNGRADE':
        return '⬇️';
      case 'SUBSCRIPTION_REFUND':
        return '↩️';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            Subscription Transactions
          </h1>
          <p style={{ color: '#666666' }}>
            View and manage all subscription payments and renewals
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
          >
            <Download size={18} className="mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => fetchTransactions()}
            variant="outline"
          >
            <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="p-6 rounded-lg border bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: '#666666' }}>Total Transactions</p>
            <Wallet size={20} style={{ color: '#DC143C' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            {stats?.totalTransactions?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>

        <div className="p-6 rounded-lg border bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: '#666666' }}>Total Revenue</p>
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats?.totals?.payments || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Renewals: {formatCurrency(stats?.totals?.renewals || 0)}
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: '#666666' }}>Refunds</p>
            <TrendingDown size={20} className="text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(stats?.totals?.refunds || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Net: {formatCurrency(stats?.totals?.net || 0)}
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: '#666666' }}>Active Subscriptions</p>
            <CreditCard size={20} style={{ color: '#DC143C' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
            {stats?.activeSubscriptions || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            MRR: {formatCurrency(stats?.mrr || 0)}
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-3" style={{ color: '#999999' }} />
          <Input
            placeholder="Search by ID, workspace, email, invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white min-w-45"
          style={{ borderColor: '#E5E5E5' }}
        >
          <option value="all">All Types</option>
          <option value="SUBSCRIPTION_PAYMENT">Initial Payments</option>
          <option value="SUBSCRIPTION_RENEWAL">Renewals</option>
          <option value="SUBSCRIPTION_UPGRADE">Upgrades</option>
          <option value="SUBSCRIPTION_DOWNGRADE">Downgrades</option>
          <option value="SUBSCRIPTION_REFUND">Refunds</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white min-w-38"
          style={{ borderColor: '#E5E5E5' }}
        >
          <option value="all">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white min-w-38"
          style={{ borderColor: '#E5E5E5' }}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border rounded-lg overflow-hidden bg-white"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Workspace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Type</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw size={24} className="mx-auto mb-2 animate-spin" />
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.slice(0, 50).map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-mono font-medium">{tx.id.substring(0, 8)}...</p>
                        {tx.invoiceNumber && (
                          <p className="text-xs text-gray-500">Invoice: {tx.invoiceNumber}</p>
                        )}
                        {tx.referenceId && (
                          <p className="text-xs text-gray-500">Ref: {tx.referenceId.substring(0, 8)}...</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-sm">{tx.workspaceName}</p>
                        <p className="text-xs text-gray-500">{tx.userEmail}</p>
                        {tx.workspaceId && (
                          <p className="text-xs text-gray-400">{tx.workspaceId.substring(0, 8)}...</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{tx.description}</p>
                      {tx.tier && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                          Plan: {tx.tier}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xl">{getTypeIcon(tx.type)}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getTypeColor(tx.type)}`}>
                          {tx.type.replace('SUBSCRIPTION_', '').replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        <span className={`font-bold ${
                          tx.type === 'SUBSCRIPTION_REFUND' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {tx.type === 'SUBSCRIPTION_REFUND' ? '-' : '+'}
                          {formatCurrency(tx.amount)}
                        </span>
                        {tx.discount ? (
                          <p className="text-xs text-gray-500">
                            Discount: {formatCurrency(tx.discount)}
                          </p>
                        ) : null}
                        {tx.promoCode ? (
                          <p className="text-xs text-purple-600">
                            Promo: {tx.promoCode}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600">{formatDate(tx.createdAt)}</p>
                        {tx.paidAt && (
                          <p className="text-xs text-gray-400">Paid: {formatDate(tx.paidAt)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/admin/transactions/${tx.id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Wallet size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No transactions found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search query</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {Math.min(filteredTransactions.length, 50)} of {filteredTransactions.length} transactions
          </span>
          {filteredTransactions.length > 50 && (
            <span className="text-xs">Showing last 50 transactions. Use filters to narrow results.</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}