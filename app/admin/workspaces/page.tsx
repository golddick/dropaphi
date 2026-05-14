'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink,
  Shield,
  ShieldAlert,
  Users as UsersIcon,
  Mail,
  Smartphone,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  email: string;
  plan: string;
  isActive: boolean;
  memberCount: number;
  owners: Array<{ id: string; name: string; email: string }>;
  currentEmailsSent: number;
  currentSmsSent: number;
  currentSubscribers: number;
  emailLimit: number;
  smsLimit: number;
  subscriberLimit: number;
  subscription: {
    tier: string;
    status: string;
    currentPeriodEnd: string;
  } | null;
  createdAt: string;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/workspaces?page=${pagination.page}&limit=${pagination.limit}&search=${search}&plan=${planFilter}`);
      const data = await res.json();
      if (data.success) {
        setWorkspaces(data.data.workspaces);
        setPagination(data.data.pagination);
      } else {
        toast.error(data.message || 'Failed to fetch workspaces');
      }
    } catch (error) {
      toast.error('An error occurred while fetching workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [pagination.page, planFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchWorkspaces();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Workspaces</h1>
          <p className="text-gray-500">Manage all customer workspaces and their limits.</p>
        </div>
        <div className="flex items-center gap-2">
           {/* Add any global actions here if needed */}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg border" style={{ borderColor: '#E5E5E5' }}>
        <form onSubmit={handleSearch} className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search workspaces by name, slug or email..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <select 
          className="p-2 border rounded-lg bg-white"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          style={{ borderColor: '#E5E5E5' }}
        >
          <option value="all">All Plans</option>
          <option value="FREE">Free</option>
          <option value="STARTER">Starter</option>
          <option value="PROFESSIONAL">Professional</option>
          <option value="BUSINESS">Business</option>
        </select>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => {
            setSearch('');
            setPlanFilter('all');
            setPagination({ ...pagination, page: 1 });
          }}
        >
          Reset Filters
        </Button>
      </div>

      {/* Workspaces Table */}
      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#E5E5E5' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50" style={{ borderColor: '#E5E5E5' }}>
                <th className="p-4 font-semibold text-sm text-gray-600">Workspace</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Owner</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Plan & Status</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Usage</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading workspaces...</td>
                </tr>
              ) : workspaces.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No workspaces found.</td>
                </tr>
              ) : (
                workspaces.map((workspace) => (
                  <tr key={workspace.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#E5E5E5' }}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: '#1A1A1A' }}>{workspace.name}</p>
                          <p className="text-xs text-gray-500">{workspace.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {workspace.owners.length > 0 ? (
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{workspace.owners[0].name}</p>
                          <p className="text-xs text-gray-500">{workspace.owners[0].email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No owner</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          workspace.plan === 'BUSINESS' ? 'bg-purple-100 text-purple-700' :
                          workspace.plan === 'PROFESSIONAL' ? 'bg-blue-100 text-blue-700' :
                          workspace.plan === 'STARTER' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {workspace.plan}
                        </span>
                        <div className="flex items-center gap-1">
                          {workspace.isActive ? (
                            <CheckCircle2 size={12} className="text-green-500" />
                          ) : (
                            <XCircle size={12} className="text-red-500" />
                          )}
                          <span className="text-xs">{workspace.isActive ? 'Active' : 'Disabled'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span>Emails:</span>
                          <span className="font-medium">{workspace.currentEmailsSent} / {workspace.emailLimit}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>SMS:</span>
                          <span className="font-medium">{workspace.currentSmsSent} / {workspace.smsLimit}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Subscribers:</span>
                          <span className="font-medium">{workspace.currentSubscribers} / {workspace.subscriberLimit}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                       <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical size={16} />
                       </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 flex items-center justify-between bg-gray-50 border-t" style={{ borderColor: '#E5E5E5' }}>
            <p className="text-sm text-gray-500">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
