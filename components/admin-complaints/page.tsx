// app/admin/complaints/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Send,
  ChevronDown,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useComplaintStore, Complaint, Reply } from '@/lib/stores/complaint/complaint.store';

// ── Types ──────────────────────────────────────────────────────────────────────

type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type ComplaintCategory =
  | 'Billing / Subscription'
  | 'API Issue'
  | 'Documentation Error'
  | 'Performance / Downtime'
  | 'Security Concern'
  | 'Other';

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ComplaintStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  OPEN: {
    label: 'Open',
    className: 'border-yellow-600 text-yellow-500',
    icon: <AlertCircle size={11} />,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'border-blue-600 text-blue-400',
    icon: <Clock size={11} />,
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'border-green-700 text-green-500',
    icon: <CheckCircle2 size={11} />,
  },
  CLOSED: {
    label: 'Closed',
    className: 'border-border text-muted-foreground',
    icon: <X size={11} />,
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// Map store status to display status
const mapStatus = (status: string): ComplaintStatus => {
  return status as ComplaintStatus;
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdminComplaintsPage() {
  const {
    complaints,
    isLoading,
    pagination,
    fetchComplaints,
    updateComplaintStatus,
    addReply,
    deleteComplaint,
  } = useComplaintStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [closeId, setCloseId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch complaints on mount and when filters change
  useEffect(() => {
    fetchComplaints({ status: statusFilter, page: 1 });
  }, [fetchComplaints, statusFilter]);

  // Filter complaints based on search
  const filtered = complaints.filter((c) => {
    const matchSearch =
      !search ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const selected = complaints.find((c) => c.id === selectedId) ?? null;

  const handleUpdateStatus = useCallback((id: string, status: ComplaintStatus) => {
    updateComplaintStatus(id, status);
  }, [updateComplaintStatus]);

  const handleSendReply = useCallback(() => {
    if (!replyText.trim() || !selectedId) return;
    addReply(selectedId, replyText.trim());
    setReplyText('');
  }, [replyText, selectedId, addReply]);

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteComplaint(deleteId);
      if (selectedId === deleteId) {
        setSelectedId(null);
      }
      setDeleteId(null);
    }
  }, [deleteId, deleteComplaint, selectedId]);

  const statusCounts = {
    all: complaints.length,
    OPEN: complaints.filter((c) => c.status === 'OPEN').length,
    IN_PROGRESS: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    RESOLVED: complaints.filter((c) => c.status === 'RESOLVED').length,
    CLOSED: complaints.filter((c) => c.status === 'CLOSED').length,
  };

  if (isLoading && complaints.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="w-full space-y-8">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Review and respond to user complaints across all workspaces.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-lg px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            All systems operational
          </div>
        </div>

        {/* ── Stat Pills ── */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'All'],
              ['OPEN', 'Open'],
              ['IN_PROGRESS', 'In Progress'],
              ['RESOLVED', 'Resolved'],
              ['CLOSED', 'Closed'],
            ] as [string, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                statusFilter === key
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'border-border text-muted-foreground hover:border-red-600/50 hover:text-foreground'
              }`}
            >
              {label}
              <span
                className={`rounded-full px-1.5 py-0 text-[10px] font-bold ${
                  statusFilter === key ? 'bg-red-800 text-white' : 'bg-[#1a1a2e] text-muted-foreground'
                }`}
              >
                {statusCounts[key as keyof typeof statusCounts]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search complaints…"
            className="pl-10 bg-transparent border-border focus:border-red-600/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ── Main Layout ── */}
        <div className={`flex gap-6 ${selected ? 'items-start' : ''}`}>
          {/* Table */}
          <div className={`${selected ? 'w-1/2' : 'w-full'} rounded-xl border border-border overflow-hidden transition-all duration-300`}>
            <Table>
              <TableHeader>
                <TableRow className="bg-background border hover:border-border">
                  <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Complaint</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">From</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Category</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Date</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-widest text-muted-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                      {isLoading ? 'Loading complaints...' : 'No complaints found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => {
                    const status = mapStatus(c.status);
                    return (
                      <TableRow
                        key={c.id}
                        className={`cursor-pointer transition-colors ${
                          selectedId === c.id
                            ? 'bg-red-950/20 border-l-2 border-l-red-600'
                            : 'border hover:border-border'
                        }`}
                        onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                      >
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">{c.id.slice(-8)}</span>
                            <span className="font-medium text-sm line-clamp-1">{c.subject}</span>
                            {c.replies.length > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageSquare size={10} /> {c.replies.length} repl{c.replies.length === 1 ? 'y' : 'ies'}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{c.name}</span>
                            <span className="text-xs text-muted-foreground">{c.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{c.category}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`gap-1 text-xs ${STATUS_CONFIG[status].className}`}
                          >
                            {STATUS_CONFIG[status].icon}
                            {STATUS_CONFIG[status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(c.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedId(c.id);
                                }}
                              >
                                <MessageSquare className="mr-2 h-3.5 w-3.5" /> Open thread
                              </DropdownMenuItem>
                              {c.status !== 'IN_PROGRESS' && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(c.id, 'IN_PROGRESS');
                                  }}
                                >
                                  <Clock className="mr-2 h-3.5 w-3.5" /> Mark in progress
                                </DropdownMenuItem>
                              )}
                              {c.status !== 'RESOLVED' && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(c.id, 'RESOLVED');
                                  }}
                                >
                                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Mark resolved
                                </DropdownMenuItem>
                              )}
                              {c.status !== 'CLOSED' && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCloseId(c.id);
                                  }}
                                >
                                  <X className="mr-2 h-3.5 w-3.5" /> Close
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(c.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Detail / Thread Panel ── */}
          {selected && (
            <div className="w-1/2 rounded-xl border border-border bg-background flex flex-col overflow-hidden sticky top-6" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
              {/* Panel Header */}
              <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border bg-transparent">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{selected.id.slice(-8)}</span>
                    <Badge
                      variant="outline"
                      className={`gap-1 text-xs ${STATUS_CONFIG[mapStatus(selected.status)].className}`}
                    >
                      {STATUS_CONFIG[mapStatus(selected.status)].icon}
                      {STATUS_CONFIG[mapStatus(selected.status)].label}
                    </Badge>
                  </div>
                  <h2 className="text-sm font-semibold leading-tight line-clamp-2">{selected.subject}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selected.name} · {selected.email} · {selected.category}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {/* Quick status change */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                        Status <ChevronDown size={12} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as ComplaintStatus[]).map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() => handleUpdateStatus(selected.id, s)}
                          className={selected.status === s ? 'font-semibold' : ''}
                        >
                          {STATUS_CONFIG[s].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setSelectedId(null)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>

              {/* Thread */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Original message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1a1a2e] border border-border flex items-center justify-center text-xs font-bold shrink-0 text-blue-400">
                    {initials(selected.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">{selected.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(selected.createdAt)} · {formatTime(selected.createdAt)}
                      </span>
                    </div>
                    <div className="rounded-xl rounded-tl-none bg-[#0f0f18] border border-border p-3 text-sm text-white leading-relaxed">
                      {selected.message}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {selected.replies.map((reply: Reply) => (
                  <div key={reply.id} className={`flex gap-3 ${reply.author === 'admin' ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        reply.author === 'admin'
                          ? 'bg-red-950 border border-red-800 text-red-400'
                          : 'bg-[#1a1a2e] border border-border text-blue-400'
                      }`}
                    >
                      {reply.author === 'admin' ? 'ST' : initials(reply.authorName)}
                    </div>
                    <div className="flex-1">
                      <div className={`flex items-center gap-2 mb-1 ${reply.author === 'admin' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-semibold">{reply.authorName}</span>
                        {reply.author === 'admin' && (
                          <span className="text-[10px] bg-red-950/40 text-red-400 border border-red-900 px-1.5 rounded-full">Admin</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(reply.createdAt)} · {formatTime(reply.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`rounded-xl p-3 text-sm leading-relaxed ${
                          reply.author === 'admin'
                            ? 'rounded-tr-none bg-red-950/20 border border-red-900/40 text-foreground/90'
                            : 'rounded-tl-none bg-[#0f0f18] border border-border text-foreground/90'
                        }`}
                      >
                        {reply.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              {selected.status !== 'CLOSED' ? (
                <div className="border-t border-border p-4">
                  <div className="flex gap-2 items-end">
                    <textarea
                      rows={3}
                      placeholder="Type your reply…"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      className="flex-1 resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 transition-all"
                    />
                    <Button
                      size="sm"
                      disabled={!replyText.trim()}
                      onClick={handleSendReply}
                      className="bg-red-600 hover:bg-red-700 text-white shrink-0 gap-1.5 h-9"
                    >
                      <Send size={13} /> Send
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    ⌘ + Enter to send · Sending marks complaint as &quot;In Progress&quot;
                  </p>
                </div>
              ) : (
                <div className="border-t border-border p-4 bg-[#0f0f18] text-center">
                  <p className="text-xs text-muted-foreground">This complaint is closed. Reopen it to reply.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 text-xs"
                    onClick={() => handleUpdateStatus(selected.id, 'OPEN')}
                  >
                    Reopen complaint
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer count */}
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {complaints.length} complaints
        </p>
      </div>

      {/* ── Close Confirmation ── */}
      <AlertDialog open={!!closeId} onOpenChange={() => setCloseId(null)}>
        <AlertDialogContent className="bg-[#0f0f18] border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Close this complaint?</AlertDialogTitle>
            <AlertDialogDescription>
              The complaint will be marked as closed. The user will no longer be
              able to receive replies unless it's reopened.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (closeId) handleUpdateStatus(closeId, 'CLOSED');
                setCloseId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Close complaint
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[#0f0f18] border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this complaint?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The complaint will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}





// 'use client';

// import { useState } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   MoreHorizontal,
//   Search,
//   MessageSquare,
//   CheckCircle2,
//   Clock,
//   AlertCircle,
//   X,
//   Send,
//   ChevronDown,
// } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import { toast } from 'sonner';

// // ── Types ──────────────────────────────────────────────────────────────────────

// type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
// type ComplaintCategory =
//   | 'Billing / Subscription'
//   | 'API Issue'
//   | 'Documentation Error'
//   | 'Performance / Downtime'
//   | 'Security Concern'
//   | 'Other';

// interface Reply {
//   id: string;
//   author: 'admin' | 'user';
//   authorName: string;
//   message: string;
//   createdAt: string;
// }

// interface Complaint {
//   id: string;
//   name: string;
//   email: string;
//   category: ComplaintCategory;
//   subject: string;
//   message: string;
//   status: ComplaintStatus;
//   createdAt: string;
//   replies: Reply[];
// }

// // ── Static Data ────────────────────────────────────────────────────────────────

// const STATIC_COMPLAINTS: Complaint[] = [
//   {
//     id: 'CMP-001',
//     name: 'Adewale Okonkwo',
//     email: 'adewale@acme.io',
//     category: 'API Issue',
//     subject: 'Rate limit errors on /v1/events endpoint',
//     message:
//       'We are consistently hitting 429 errors on the /v1/events endpoint even though our usage is well within the documented limits. This has been ongoing for 3 days and is blocking our production pipeline.',
//     status: 'open',
//     createdAt: '2025-05-14T08:22:00Z',
//     replies: [],
//   },
//   {
//     id: 'CMP-002',
//     name: 'Chidinma Eze',
//     email: 'chidinma@techbridge.ng',
//     category: 'Billing / Subscription',
//     subject: 'Charged twice for May subscription',
//     message:
//       'My card was charged twice on May 1st for the Pro plan. The duplicate charge of $49 has not been reversed. Please investigate and issue a refund.',
//     status: 'in_progress',
//     createdAt: '2025-05-12T14:05:00Z',
//     replies: [
//       {
//         id: 'r1',
//         author: 'admin',
//         authorName: 'Support Team',
//         message:
//           "Hi Chidinma, we've identified the duplicate charge and have initiated a refund. It should reflect in 3-5 business days. Apologies for the inconvenience.",
//         createdAt: '2025-05-13T09:30:00Z',
//       },
//     ],
//   },
//   {
//     id: 'CMP-003',
//     name: 'Emeka Nwosu',
//     email: 'emeka@buildfast.dev',
//     category: 'Documentation Error',
//     subject: 'Incorrect code sample in Drop-ID docs',
//     message:
//       'The TypeScript example under "Initializing Drop-ID" uses a deprecated `init()` signature that throws a TypeError at runtime. The correct signature should match v2.x.',
//     status: 'resolved',
//     createdAt: '2025-05-10T11:45:00Z',
//     replies: [
//       {
//         id: 'r2',
//         author: 'admin',
//         authorName: 'Docs Team',
//         message:
//           "Thank you for catching this, Emeka! We've updated the TypeScript example to use the correct v2.x signature. The live docs reflect the fix now.",
//         createdAt: '2025-05-10T15:20:00Z',
//       },
//       {
//         id: 'r3',
//         author: 'user',
//         authorName: 'Emeka Nwosu',
//         message: 'Confirmed — the updated example works perfectly. Thanks for the quick turnaround!',
//         createdAt: '2025-05-10T16:00:00Z',
//       },
//     ],
//   },
//   {
//     id: 'CMP-004',
//     name: 'Funmilayo Adeyemi',
//     email: 'funmi@datastride.co',
//     category: 'Performance / Downtime',
//     subject: 'Webhook delivery delays exceeding 10 minutes',
//     message:
//       'Our webhook subscribers are receiving events 10-15 minutes late since the May 11 maintenance window. Real-time delivery is critical for our use case.',
//     status: 'in_progress',
//     createdAt: '2025-05-11T19:30:00Z',
//     replies: [
//       {
//         id: 'r4',
//         author: 'admin',
//         authorName: 'Infrastructure Team',
//         message:
//           "We're aware of the webhook queue delay introduced in the May 11 deployment. Our team is actively working on a hotfix. We'll update you as soon as it's deployed.",
//         createdAt: '2025-05-12T08:10:00Z',
//       },
//     ],
//   },
//   {
//     id: 'CMP-005',
//     name: 'Babatunde Lawal',
//     email: 'babs@nexwave.io',
//     category: 'Security Concern',
//     subject: 'Possible API key exposure in error response',
//     message:
//       "When an authentication error occurs, the error response body appears to partially echo back the provided API key. This shouldn't happen and could be a security risk.",
//     status: 'open',
//     createdAt: '2025-05-15T07:50:00Z',
//     replies: [],
//   },
//   {
//     id: 'CMP-006',
//     name: 'Ngozi Okafor',
//     email: 'ngozi@lumnstack.com',
//     category: 'Other',
//     subject: 'Request for EU data residency option',
//     message:
//       'Our enterprise clients require all data to be stored within the EU. We currently cannot use DropAPHI due to the lack of an EU region. Is this on the roadmap?',
//     status: 'closed',
//     createdAt: '2025-05-08T13:00:00Z',
//     replies: [
//       {
//         id: 'r5',
//         author: 'admin',
//         authorName: 'Product Team',
//         message:
//           "Hi Ngozi, EU data residency is on our Q3 roadmap. We'll notify you as soon as it's available for beta access. Thank you for flagging this.",
//         createdAt: '2025-05-09T10:00:00Z',
//       },
//     ],
//   },
// ];

// // ── Helpers ────────────────────────────────────────────────────────────────────

// const STATUS_CONFIG: Record<
//   ComplaintStatus,
//   { label: string; className: string; icon: React.ReactNode }
// > = {
//   open: {
//     label: 'Open',
//     className: 'border-yellow-600 text-yellow-500',
//     icon: <AlertCircle size={11} />,
//   },
//   in_progress: {
//     label: 'In Progress',
//     className: 'border-blue-600 text-blue-400',
//     icon: <Clock size={11} />,
//   },
//   resolved: {
//     label: 'Resolved',
//     className: 'border-green-700 text-green-500',
//     icon: <CheckCircle2 size={11} />,
//   },
//   closed: {
//     label: 'Closed',
//     className: 'border-border text-muted-foreground',
//     icon: <X size={11} />,
//   },
// };

// function formatDate(iso: string) {
//   return new Date(iso).toLocaleDateString('en-GB', {
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   });
// }

// function formatTime(iso: string) {
//   return new Date(iso).toLocaleTimeString('en-GB', {
//     hour: '2-digit',
//     minute: '2-digit',
//   });
// }

// function initials(name: string) {
//   return name
//     .split(' ')
//     .map((n) => n[0])
//     .join('')
//     .slice(0, 2)
//     .toUpperCase();
// }

// // ── Main Component ─────────────────────────────────────────────────────────────

// export default function AdminComplaintsPage() {
//   const [complaints, setComplaints] = useState<Complaint[]>(STATIC_COMPLAINTS);
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [replyText, setReplyText] = useState('');
//   const [closeId, setCloseId] = useState<string | null>(null);

//   const filtered = complaints.filter((c) => {
//     const matchSearch =
//       !search ||
//       c.subject.toLowerCase().includes(search.toLowerCase()) ||
//       c.name.toLowerCase().includes(search.toLowerCase()) ||
//       c.email.toLowerCase().includes(search.toLowerCase()) ||
//       c.category.toLowerCase().includes(search.toLowerCase());
//     const matchStatus = statusFilter === 'all' || c.status === statusFilter;
//     return matchSearch && matchStatus;
//   });

//   const selected = complaints.find((c) => c.id === selectedId) ?? null;

//   const updateStatus = (id: string, status: ComplaintStatus) => {
//     setComplaints((prev) =>
//       prev.map((c) => (c.id === id ? { ...c, status } : c))
//     );
//     toast.success(`Complaint marked as ${STATUS_CONFIG[status].label}`);
//   };

//   const sendReply = () => {
//     if (!replyText.trim() || !selectedId) return;
//     const reply: Reply = {
//       id: `r${Date.now()}`,
//       author: 'admin',
//       authorName: 'Support Team',
//       message: replyText.trim(),
//       createdAt: new Date().toISOString(),
//     };
//     setComplaints((prev) =>
//       prev.map((c) =>
//         c.id === selectedId
//           ? {
//               ...c,
//               replies: [...c.replies, reply],
//               status: c.status === 'open' ? 'in_progress' : c.status,
//             }
//           : c
//       )
//     );
//     setReplyText('');
//     toast.success('Reply sent');
//   };

//   const statusCounts = {
//     all: complaints.length,
//     open: complaints.filter((c) => c.status === 'open').length,
//     in_progress: complaints.filter((c) => c.status === 'in_progress').length,
//     resolved: complaints.filter((c) => c.status === 'resolved').length,
//     closed: complaints.filter((c) => c.status === 'closed').length,
//   };

//   return (
//     <div className="min-h-screen bg-transparent text-foreground">
//       <div className="w-full  space-y-8">
//         {/* ── Header ── */}
//         <div className="flex items-start justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
//             <p className="text-muted-foreground text-sm mt-1">
//               Review and respond to user complaints across all workspaces.
//             </p>
//           </div>
//           <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-lg px-3 py-2">
//             <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
//             All systems operational
//           </div>
//         </div>

//         {/* ── Stat Pills ── */}
//         <div className="flex flex-wrap gap-2">
//           {(
//             [
//               ['all', 'All'],
//               ['open', 'Open'],
//               ['in_progress', 'In Progress'],
//               ['resolved', 'Resolved'],
//               ['closed', 'Closed'],
//             ] as [ComplaintStatus | 'all', string][]
//           ).map(([key, label]) => (
//             <button
//               key={key}
//               onClick={() => setStatusFilter(key)}
//               className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
//                 statusFilter === key
//                   ? 'bg-red-600 border-red-600 text-white'
//                   : 'border-border text-muted-foreground hover:border-red-600/50 hover:text-foreground'
//               }`}
//             >
//               {label}
//               <span
//                 className={`rounded-full px-1.5 py-0 text-[10px] font-bold ${
//                   statusFilter === key ? 'bg-red-800 text-white' : 'bg-[#1a1a2e] text-muted-foreground'
//                 }`}
//               >
//                 {statusCounts[key]}
//               </span>
//             </button>
//           ))}
//         </div>

//         {/* ── Search ── */}
//         <div className="relative max-w-sm">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//           <Input
//             placeholder="Search complaints…"
//             className="pl-10 bg-transparent border-border focus:border-red-600/50"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         {/* ── Main Layout ── */}
//         <div className={`flex gap-6 ${selected ? 'items-start' : ''}`}>
//           {/* Table */}
//           <div className={`${selected ? 'w-1/2' : 'w-full'} rounded-xl border border-border overflow-hidden transition-all duration-300`}>
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-background border hover:border-border ">
//                   <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Complaint</TableHead>
//                   <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">From</TableHead>
//                   <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Category</TableHead>
//                   <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Status</TableHead>
//                   <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Date</TableHead>
//                   <TableHead className="text-right text-xs uppercase tracking-widest text-muted-foreground font-semibold">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filtered.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
//                       No complaints found.
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   filtered.map((c) => (
//                     <TableRow
//                       key={c.id}
//                       className={`cursor-pointer transition-colors ${
//                         selectedId === c.id
//                           ? 'bg-red-950/20 border-l-2 border-l-red-600'
//                           : 'border hover:border-border'
//                       }`}
//                       onClick={() =>
//                         setSelectedId(selectedId === c.id ? null : c.id)
//                       }
//                     >
//                       <TableCell>
//                         <div className="flex flex-col gap-0.5">
//                           <span className="text-xs text-muted-foreground ">{c.id}</span>
//                           <span className="font-medium text-sm line-clamp-1">{c.subject}</span>
//                           {c.replies.length > 0 && (
//                             <span className="flex items-center gap-1 text-xs text-muted-foreground">
//                               <MessageSquare size={10} /> {c.replies.length} repl{c.replies.length === 1 ? 'y' : 'ies'}
//                             </span>
//                           )}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex flex-col">
//                           <span className="text-sm font-medium">{c.name}</span>
//                           <span className="text-xs text-muted-foreground">{c.email}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <span className="text-xs text-muted-foreground">{c.category}</span>
//                       </TableCell>
//                       <TableCell>
//                         <Badge
//                           variant="outline"
//                           className={`gap-1 text-xs ${STATUS_CONFIG[c.status].className}`}
//                         >
//                           {STATUS_CONFIG[c.status].icon}
//                           {STATUS_CONFIG[c.status].label}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
//                         {formatDate(c.createdAt)}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={(e) => e.stopPropagation()}
//                             >
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end" className="w-44">
//                             <DropdownMenuItem
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedId(c.id);
//                               }}
//                             >
//                               <MessageSquare className="mr-2 h-3.5 w-3.5" /> Open thread
//                             </DropdownMenuItem>
//                             {c.status !== 'in_progress' && (
//                               <DropdownMenuItem
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   updateStatus(c.id, 'in_progress');
//                                 }}
//                               >
//                                 <Clock className="mr-2 h-3.5 w-3.5" /> Mark in progress
//                               </DropdownMenuItem>
//                             )}
//                             {c.status !== 'resolved' && (
//                               <DropdownMenuItem
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   updateStatus(c.id, 'resolved');
//                                 }}
//                               >
//                                 <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Mark resolved
//                               </DropdownMenuItem>
//                             )}
//                             {c.status !== 'closed' && (
//                               <DropdownMenuItem
//                                 className="text-destructive focus:text-destructive"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   setCloseId(c.id);
//                                 }}
//                               >
//                                 <X className="mr-2 h-3.5 w-3.5" /> Close
//                               </DropdownMenuItem>
//                             )}
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           {/* ── Detail / Thread Panel ── */}
//           {selected && (
//             <div className="w-1/2 rounded-xl border border-border bg-background flex flex-col overflow-hidden sticky top-6" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
//               {/* Panel Header */}
//               <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border bg-transparent">
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 mb-1">
//                     <span className="text-xs font-mono text-muted-foreground">{selected.id}</span>
//                     <Badge
//                       variant="outline"
//                       className={`gap-1 text-xs ${STATUS_CONFIG[selected.status].className}`}
//                     >
//                       {STATUS_CONFIG[selected.status].icon}
//                       {STATUS_CONFIG[selected.status].label}
//                     </Badge>
//                   </div>
//                   <h2 className="text-sm font-semibold leading-tight line-clamp-2">{selected.subject}</h2>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     {selected.name} · {selected.email} · {selected.category}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-1 shrink-0">
//                   {/* Quick status change */}
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
//                         Status <ChevronDown size={12} />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       {(['open', 'in_progress', 'resolved', 'closed'] as ComplaintStatus[]).map((s) => (
//                         <DropdownMenuItem
//                           key={s}
//                           onClick={() => updateStatus(selected.id, s)}
//                           className={selected.status === s ? 'font-semibold' : ''}
//                         >
//                           {STATUS_CONFIG[s].label}
//                         </DropdownMenuItem>
//                       ))}
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-7 w-7"
//                     onClick={() => setSelectedId(null)}
//                   >
//                     <X size={14} />
//                   </Button>
//                 </div>
//               </div>

//               {/* Thread */}
//               <div className="flex-1 overflow-y-auto p-5 space-y-4">
//                 {/* Original message */}
//                 <div className="flex gap-3">
//                   <div className="w-8 h-8 rounded-full bg-[#1a1a2e] border border-border flex items-center justify-center text-xs font-bold shrink-0 text-blue-400">
//                     {initials(selected.name)}
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-xs font-semibold">{selected.name}</span>
//                       <span className="text-[10px] text-muted-foreground">
//                         {formatDate(selected.createdAt)} · {formatTime(selected.createdAt)}
//                       </span>
//                     </div>
//                     <div className="rounded-xl rounded-tl-none bg-[#0f0f18] border border-border p-3 text-sm text-white leading-relaxed">
//                       {selected.message}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Replies */}
//                 {selected.replies.map((reply) => (
//                   <div key={reply.id} className={`flex gap-3 ${reply.author === 'admin' ? 'flex-row-reverse' : ''}`}>
//                     <div
//                       className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
//                         reply.author === 'admin'
//                           ? 'bg-red-950 border border-red-800 text-red-400'
//                           : 'bg-[#1a1a2e] border border-border text-blue-400'
//                       }`}
//                     >
//                       {reply.author === 'admin' ? 'ST' : initials(reply.authorName)}
//                     </div>
//                     <div className="flex-1">
//                       <div className={`flex items-center gap-2 mb-1 ${reply.author === 'admin' ? 'flex-row-reverse' : ''}`}>
//                         <span className="text-xs font-semibold">{reply.authorName}</span>
//                         {reply.author === 'admin' && (
//                           <span className="text-[10px] bg-red-950/40 text-red-400 border border-red-900 px-1.5 rounded-full">Admin</span>
//                         )}
//                         <span className="text-[10px] text-muted-foreground">
//                           {formatDate(reply.createdAt)} · {formatTime(reply.createdAt)}
//                         </span>
//                       </div>
//                       <div
//                         className={`rounded-xl p-3 text-sm leading-relaxed ${
//                           reply.author === 'admin'
//                             ? 'rounded-tr-none bg-red-950/20 border border-red-900/40 text-foreground/90'
//                             : 'rounded-tl-none bg-[#0f0f18] border border-border text-foreground/90'
//                         }`}
//                       >
//                         {reply.message}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Reply Input */}
//               {selected.status !== 'closed' ? (
//                 <div className="border-t border-border p-4 ">
//                   <div className="flex gap-2 items-end">
//                     <textarea
//                       rows={3}
//                       placeholder="Type your reply…"
//                       value={replyText}
//                       onChange={(e) => setReplyText(e.target.value)}
//                       onKeyDown={(e) => {                      }}
//                       className="flex-1 resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/20 transition-all"
//                     />
//                     <Button
//                       size="sm"
//                       disabled={!replyText.trim()}
//                       onClick={sendReply}
//                       className="bg-red-600 hover:bg-red-700 text-white shrink-0 gap-1.5 h-9"
//                     >
//                       <Send size={13} /> Send
//                     </Button>
//                   </div>
//                   <p className="text-[10px] text-muted-foreground mt-1.5">
//                     ⌘ + Enter to send · Sending marks complaint as "In Progress"
//                   </p>
//                 </div>
//               ) : (
//                 <div className="border-t border-border p-4 bg-[#0f0f18] text-center">
//                   <p className="text-xs text-muted-foreground">This complaint is closed. Reopen it to reply.</p>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="mt-2 text-xs"
//                     onClick={() => updateStatus(selected.id, 'open')}
//                   >
//                     Reopen complaint
//                   </Button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Footer count */}
//         <p className="text-xs text-muted-foreground">
//           Showing {filtered.length} of {complaints.length} complaints
//         </p>
//       </div>

//       {/* ── Close Confirmation ── */}
//       <AlertDialog open={!!closeId} onOpenChange={() => setCloseId(null)}>
//         <AlertDialogContent className="bg-[#0f0f18] border-border">
//           <AlertDialogHeader>
//             <AlertDialogTitle>Close this complaint?</AlertDialogTitle>
//             <AlertDialogDescription>
//               The complaint will be marked as closed. The user will no longer be
//               able to receive replies unless it's reopened.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => {
//                 if (closeId) updateStatus(closeId, 'closed');
//                 setCloseId(null);
//               }}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               Close complaint
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }
