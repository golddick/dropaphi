// app/admin/demos/page.tsx (Complete updated file)
'use client';

import { useState, useEffect, useRef } from 'react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  Search,
  Plus,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Play,
  Image as ImageIcon,
  Video,
  Code2,
  MessageSquare,
  Mail,
  Shield,
  HardDrive,
  Bell,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  X,
} from 'lucide-react';
import { dropid } from 'dropid';
import { UploadZone } from '@/components/UploadZone';

/* ─── Types ──────────────────────────────────────────────────── */

type DemoCategory = 'SMS' | 'Email' | 'OTP / 2FA' | 'File Storage' | 'Push' | 'Blog';

interface DemoStep {
  id: string;
  text: string;
}

interface DemoVideo {
  id: string;
  category: DemoCategory;
  title: string;
  description: string;
  duration: string;
  tag: string;
  tagColor: string;
  src: string;
  poster: string;
  steps: DemoStep[];
  codeSnippet: string;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/* ─── Constants ──────────────────────────────────────────────── */

const CATEGORY_META: Record<DemoCategory, { color: string; icon: React.ReactNode }> = {
  'SMS':          { color: '#ef4444', icon: <MessageSquare size={13} /> },
  'Email':        { color: '#3b82f6', icon: <Mail size={13} /> },
  'OTP / 2FA':    { color: '#22c55e', icon: <Shield size={13} /> },
  'File Storage': { color: '#f97316', icon: <HardDrive size={13} /> },
  'Push':         { color: '#a855f7', icon: <Bell size={13} /> },
  'Blog':         { color: '#a855f7', icon: <Bell size={13} /> },
};

const CATEGORIES = Object.keys(CATEGORY_META) as DemoCategory[];

const EMPTY_FORM: Omit<DemoVideo, 'id' | 'createdAt' | 'updatedAt' | 'duration'> = {
  category:    'SMS',
  title:       '',
  description: '',
  tag:         'SMS',
  tagColor:    '#ef4444',
  src:         '',
  poster:      '',
  steps:       [{ id: dropid('step'), text: '' }],
  codeSnippet: '',
  isPublished: false,
  isFeatured:  false,
  sortOrder:   0,
};

/* ─── Helpers ────────────────────────────────────────────────── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/* ─── Sub-components ─────────────────────────────────────────── */

/** Drag-able steps list editor */
function StepsEditor({
  steps,
  onChange,
}: {
  steps: DemoStep[];
  onChange: (steps: DemoStep[]) => void;
}) {
  const add = () => onChange([...steps, { id: dropid("step"), text: '' }]);
  const remove = (id: string) => onChange(steps.filter(s => s.id !== id));
  const update = (id: string, text: string) =>
    onChange(steps.map(s => (s.id === id ? { ...s, text } : s)));
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...steps];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="text-muted-foreground/40 hover:text-muted-foreground disabled:opacity-20 transition-colors"
            >
              <ChevronUp size={13} />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === steps.length - 1}
              className="text-muted-foreground/40 hover:text-muted-foreground disabled:opacity-20 transition-colors"
            >
              <ChevronDown size={13} />
            </button>
          </div>
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center
            font-mono text-[0.6rem] text-muted-foreground shrink-0">
            {i + 1}
          </div>
          <Input
            value={step.text}
            onChange={e => update(step.id, e.target.value)}
            placeholder={`Step ${i + 1} description`}
            className="flex-1 h-8 text-sm"
          />
          <button
            type="button"
            onClick={() => remove(step.id)}
            disabled={steps.length === 1}
            className="text-muted-foreground/40 hover:text-destructive disabled:opacity-20 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="h-7 text-xs gap-1">
        <Plus size={11} /> Add Step
      </Button>
    </div>
  );
}

/* ─── Main form dialog ───────────────────────────────────────── */

function VideoFormDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Partial<DemoVideo> | null;
  onSave: (data: Partial<DemoVideo>) => Promise<void>;
}) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(initial ?? {}),
    steps: initial?.steps?.length
      ? initial.steps
      : [{ id: dropid("step"), text: '' }],
  }));
  const [saving, setSaving] = useState(false);

  // Sync category → tag + color
  const setCategory = (cat: DemoCategory) => {
    const meta = CATEGORY_META[cat];
    setForm(f => ({ ...f, category: cat, tag: cat, tagColor: meta.color }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim())       { toast.error('Title is required'); return; }
    if (!form.src.trim())         { toast.error('Video file is required'); return; }
    if (!form.poster.trim())      { toast.error('Thumbnail is required'); return; }
    if (!form.codeSnippet.trim()) { toast.error('Code snippet is required'); return; }
    const validSteps = form.steps.filter(s => s.text.trim());
    if (validSteps.length < 2)    { toast.error('Add at least 2 steps'); return; }

    setSaving(true);
    try {
      await onSave({ ...form, steps: validSteps });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Bricolage_Grotesque'] text-xl">
            {isEdit ? 'Edit Demo Video' : 'Upload New Demo Video'}
          </DialogTitle>
          <DialogDescription>
            This will appear on the{' '}
            <span className="font-medium text-foreground">"See It In Action"</span> public page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5 mt-2">

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Service Category</Label>
            <Select value={form.category} onValueChange={v => setCategory(v as DemoCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      <span style={{ color: CATEGORY_META[cat].color }}>
                        {CATEGORY_META[cat].icon}
                      </span>
                      {cat}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label>Video Title</Label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Send Your First SMS in 60 Seconds"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Short Description</Label>
            <Textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Shown below the video title on the public page…"
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Uploads - Using the new UploadZone component */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Video File</Label>
              <UploadZone
                label="MP4 / WebM"
                accept="video/mp4,video/webm"
                icon={<Video size={22} />}
                value={form.src}
                onUpload={url => setForm(f => ({ ...f, src: url }))}
                type="video"
                entityType="demo"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Thumbnail / Poster</Label>
              <UploadZone
                label="JPG / PNG / WebP"
                accept="image/jpeg,image/png,image/webp"
                icon={<ImageIcon size={22} />}
                value={form.poster}
                onUpload={url => setForm(f => ({ ...f, poster: url }))}
                type="thumbnail"
                entityType="demo"
              />
            </div>
          </div>

          {/* Manual URL override */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Video URL (override)</Label>
              <Input
                value={form.src}
                onChange={e => setForm(f => ({ ...f, src: e.target.value }))}
                placeholder="https://cdn.example.com/video.mp4"
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Poster URL (override)</Label>
              <Input
                value={form.poster}
                onChange={e => setForm(f => ({ ...f, poster: e.target.value }))}
                placeholder="https://cdn.example.com/thumbnail.jpg"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <Label>Integration Steps <span className="text-muted-foreground font-normal">(shown as numbered cards)</span></Label>
            <StepsEditor
              steps={form.steps}
              onChange={steps => setForm(f => ({ ...f, steps }))}
            />
          </div>

          {/* Code snippet */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Code2 size={13} className="text-red-500" />
              Code Snippet
            </Label>
            <Textarea
              value={form.codeSnippet}
              onChange={e => setForm(f => ({ ...f, codeSnippet: e.target.value }))}
              placeholder={`const res = await fetch('https://api.example.com/v1/…'`}
              rows={7}
              className="resize-none font-mono text-xs"
            />
          </div>

          {/* Sort order */}
          <div className="space-y-1.5">
            <Label>Sort Order <span className="text-muted-foreground font-normal">(lower = shown first)</span></Label>
            <Input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
              className="w-28 h-8 text-sm"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-red-500 hover:bg-red-600 text-white gap-2"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {isEdit ? 'Save Changes' : 'Upload & Publish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function AdminDemoUploadPage() {
  const [videos, setVideos]         = useState<DemoVideo[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const [formOpen, setFormOpen]     = useState(false);
  const [editing, setEditing]       = useState<DemoVideo | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  /* fetch */
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page:     pagination.page.toString(),
        limit:    pagination.limit.toString(),
        search,
        category: categoryFilter === 'All' ? '' : categoryFilter,
      });
      const res  = await fetch(`/api/admin/demos?${q}`);
      const data = await res.json();
      if (data.success) {
        setVideos(data.data.videos);
        setPagination(data.data.pagination);
      }
    } catch {
      toast.error('Failed to fetch demo videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, [pagination.page, search, categoryFilter]);

  /* create / update */
  const handleSave = async (payload: Partial<DemoVideo>) => {
    const isEdit = !!editing?.id;
    const url    = isEdit ? `/api/admin/demos/${editing!.id}` : '/api/admin/demos';
    const method = isEdit ? 'PATCH' : 'POST';

    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(isEdit ? 'Demo updated' : 'Demo video uploaded');
      fetchVideos();
    } else {
      toast.error(data.error || 'Failed to save');
      throw new Error(data.error);
    }
  };

  /* toggle field */
  const toggle = async (id: string, field: 'isPublished' | 'isFeatured', current: boolean) => {
    const res  = await fetch(`/api/admin/demos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !current }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Updated');
      fetchVideos();
    } else {
      toast.error(data.error || 'Failed');
    }
  };

  /* delete */
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res  = await fetch(`/api/admin/demos/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Demo deleted'); fetchVideos(); }
      else toast.error(data.error || 'Delete failed');
    } catch {
      toast.error('An error occurred');
    } finally {
      setDeleteId(null);
    }
  };

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit   = (v: DemoVideo) => { setEditing(v); setFormOpen(true); };

  /* category counts */
  const counts = videos.reduce<Record<string, number>>((acc, v) => {
    acc[v.category] = (acc[v.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {/* ── Form dialog ── */}
      {formOpen && (
        <VideoFormDialog
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          initial={editing}
          onSave={handleSave}
        />
      )}

      {/* ── Delete confirm ── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this demo video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the video from the public{' '}
              <strong>"See It In Action"</strong> page immediately.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 size={13} className="mr-1.5" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Page ── */}
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-['Bricolage_Grotesque']">
              Demo Videos
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage integration demo videos shown on the{' '}
              <a
                href="/see-it-in-action"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:underline inline-flex items-center gap-0.5"
              >
                See It In Action <ExternalLink size={11} className="ml-0.5" />
              </a>{' '}
              public page.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-red-500 hover:bg-red-600 text-white gap-2"
          >
            <Plus size={15} /> Upload Demo Video
          </Button>
        </div>

        {/* Category quick-stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => {
            const meta  = CATEGORY_META[cat];
            const count = counts[cat] ?? 0;
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(isActive ? 'All' : cat)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left
                  transition-all duration-150 hover:-translate-y-0.5
                  ${isActive
                    ? 'border-red-500/40 bg-red-50 dark:bg-red-950/20'
                    : 'border-border bg-card hover:border-border/60'
                  }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${meta.color}18`, color: meta.color }}
                >
                  {meta.icon}
                </div>
                <div>
                  <p className=" font-bold text-lg leading-none text-foreground">
                    {count}
                  </p>
                  <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wide mt-0.5">
                    {cat}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search + filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, category or tag…"
              className="pl-10"
              value={search}
              onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            />
          </div>
          <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPagination(p => ({ ...p, page: 1 })); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-8 text-center">#</TableHead>
                <TableHead>Video</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading demo videos…
                    </div>
                  </TableCell>
                </TableRow>
              ) : videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Video size={28} className="opacity-30" />
                      <p className="text-sm">No demo videos found.</p>
                      <Button variant="outline" size="sm" onClick={openCreate} className="gap-1 mt-1">
                        <Plus size={12} /> Upload your first demo
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                videos.map((video, i) => {
                  const meta = CATEGORY_META[video.category] ?? { color: '#999', icon: <Video size={13} /> };
                  return (
                    <TableRow key={video.id} className="group">
                      {/* Sort order */}
                      <TableCell className="text-center">
                        <span className="font-mono text-xs text-muted-foreground">{video.sortOrder}</span>
                      </TableCell>

                      {/* Title + thumbnail */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* Poster preview */}
                          <div className="w-14 h-9 rounded-md overflow-hidden bg-muted border border-border shrink-0 relative">
                            {video.poster ? (
                              <img src={video.poster} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon size={14} className="text-muted-foreground/30" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center
                              bg-black/0 group-hover:bg-black/30 transition-colors">
                              <Play size={10} className="text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
                            </div>
                          </div>
                          {/* Meta */}
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate max-w-55">
                              {video.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[0.58rem] text-muted-foreground">
                                {video.duration || '—'}
                              </span>
                              {video.src && (
                                <a
                                  href={video.src}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground/40 hover:text-red-500 transition-colors"
                                >
                                  <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Category badge */}
                      <TableCell>
                        <Badge
                          className="gap-1 text-[0.65rem] font-medium border"
                          style={{
                            background: `${meta.color}15`,
                            color: meta.color,
                            borderColor: `${meta.color}30`,
                          }}
                        >
                          {meta.icon}
                          {video.category}
                        </Badge>
                      </TableCell>

                      {/* Steps count */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {video.steps.length} step{video.steps.length !== 1 ? 's' : ''}
                        </span>
                      </TableCell>

                      {/* Published */}
                      <TableCell>
                        <button
                          onClick={() => toggle(video.id, 'isPublished', video.isPublished)}
                          className="transition-all duration-150"
                        >
                          {video.isPublished ? (
                            <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20 gap-1 hover:bg-green-500/25">
                              <Eye size={10} /> Published
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground gap-1 hover:border-foreground/30">
                              <EyeOff size={10} /> Draft
                            </Badge>
                          )}
                        </button>
                      </TableCell>

                      {/* Featured */}
                      <TableCell>
                        <button
                          onClick={() => toggle(video.id, 'isFeatured', video.isFeatured)}
                          className="transition-all duration-150"
                        >
                          {video.isFeatured ? (
                            <Badge className="bg-yellow-400/15 text-yellow-600 dark:text-yellow-400 border border-yellow-400/20 gap-1 hover:bg-yellow-400/25">
                              ★ Featured
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground/40 gap-1 hover:border-foreground/30">
                              ☆ Normal
                            </Badge>
                          )}
                        </button>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatDate(video.updatedAt)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => openEdit(video)} className="gap-2">
                              <Pencil size={13} /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggle(video.id, 'isPublished', video.isPublished)}
                              className="gap-2"
                            >
                              {video.isPublished
                                ? <><EyeOff size={13} /> Unpublish</>
                                : <><Eye size={13} /> Publish</>
                              }
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggle(video.id, 'isFeatured', video.isFeatured)}
                              className="gap-2"
                            >
                              {video.isFeatured ? '☆ Unfeature' : '★ Mark Featured'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <a
                                href={`/in-action?demo=${video.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <ExternalLink size={13} /> Preview Live
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive gap-2"
                              onClick={() => setDeleteId(video.id)}
                            >
                              <Trash2 size={13} /> Delete
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

        {/* Pagination */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{videos.length}</span> of{' '}
            <span className="text-foreground font-medium">{pagination.total}</span> demo videos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            >
              Previous
            </Button>
            <span className="font-mono text-xs text-muted-foreground px-2">
              {pagination.page} / {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>

      </div>
    </>
  );
}







// 'use client';

// import { useState, useEffect, useRef } from 'react';
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
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
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
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { toast } from 'sonner';
// import {
//   MoreHorizontal,
//   Search,
//   Plus,
//   Loader2,
//   Upload,
//   Eye,
//   EyeOff,
//   Trash2,
//   Pencil,
//   Play,
//   Image as ImageIcon,
//   Video,
//   Code2,
//   GripVertical,
//   MessageSquare,
//   Mail,
//   Shield,
//   HardDrive,
//   Bell,
//   ChevronUp,
//   ChevronDown,
//   ExternalLink,
//   X,
// } from 'lucide-react';
// import { dropid } from 'dropid';

// /* ─── Types ──────────────────────────────────────────────────── */

// type DemoCategory = 'SMS' | 'Email' | 'OTP / 2FA' | 'File Storage' | 'Push / Blog';

// interface DemoStep {
//   id: string;
//   text: string;
// }

// interface DemoVideo {
//   id: string;
//   category: DemoCategory;
//   title: string;
//   description: string;
//   duration: string;            // e.g. "1:02" — auto-read from video after upload
//   tag: string;
//   tagColor: string;
//   src: string;                 // CDN URL of uploaded video
//   poster: string;              // CDN URL of poster/thumbnail
//   steps: DemoStep[];
//   codeSnippet: string;
//   isPublished: boolean;
//   isFeatured: boolean;
//   sortOrder: number;
//   createdAt: string;
//   updatedAt: string;
// }

// /* ─── Constants ──────────────────────────────────────────────── */

// const CATEGORY_META: Record<DemoCategory, { color: string; icon: React.ReactNode }> = {
//   'SMS':          { color: '#ef4444', icon: <MessageSquare size={13} /> },
//   'Email':        { color: '#3b82f6', icon: <Mail size={13} /> },
//   'OTP / 2FA':    { color: '#22c55e', icon: <Shield size={13} /> },
//   'File Storage': { color: '#f97316', icon: <HardDrive size={13} /> },
//   'Push / Blog':  { color: '#a855f7', icon: <Bell size={13} /> },
// };

// const CATEGORIES = Object.keys(CATEGORY_META) as DemoCategory[];

// const EMPTY_FORM: Omit<DemoVideo, 'id' | 'createdAt' | 'updatedAt' | 'duration'> = {
//   category:    'SMS',
//   title:       '',
//   description: '',
//   tag:         'SMS',
//   tagColor:    '#ef4444',
//   src:         '',
//   poster:      '',
//   steps:       [{ id: dropid('step'), text: '' }],
//   codeSnippet: '',
//   isPublished: false,
//   isFeatured:  false,
//   sortOrder:   0,
// };

// /* ─── Helpers ────────────────────────────────────────────────── */


// function formatDate(iso: string) {
//   return new Date(iso).toLocaleDateString('en-GB', {
//     day: '2-digit', month: 'short', year: 'numeric',
//   });
// }

// /* ─── Sub-components ─────────────────────────────────────────── */

// /** Drag-able steps list editor */
// function StepsEditor({
//   steps,
//   onChange,
// }: {
//   steps: DemoStep[];
//   onChange: (steps: DemoStep[]) => void;
// }) {
//   const add = () => onChange([...steps, { id: dropid("step"), text: '' }]);
//   const remove = (id: string) => onChange(steps.filter(s => s.id !== id));
//   const update = (id: string, text: string) =>
//     onChange(steps.map(s => (s.id === id ? { ...s, text } : s)));
//   const move = (idx: number, dir: -1 | 1) => {
//     const next = [...steps];
//     const target = idx + dir;
//     if (target < 0 || target >= next.length) return;
//     [next[idx], next[target]] = [next[target], next[idx]];
//     onChange(next);
//   };

//   return (
//     <div className="space-y-2">
//       {steps.map((step, i) => (
//         <div key={step.id} className="flex items-center gap-2">
//           <div className="flex flex-col gap-0.5">
//             <button
//               type="button"
//               onClick={() => move(i, -1)}
//               disabled={i === 0}
//               className="text-muted-foreground/40 hover:text-muted-foreground disabled:opacity-20 transition-colors"
//             >
//               <ChevronUp size={13} />
//             </button>
//             <button
//               type="button"
//               onClick={() => move(i, 1)}
//               disabled={i === steps.length - 1}
//               className="text-muted-foreground/40 hover:text-muted-foreground disabled:opacity-20 transition-colors"
//             >
//               <ChevronDown size={13} />
//             </button>
//           </div>
//           <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center
//             font-mono text-[0.6rem] text-muted-foreground shrink-0">
//             {i + 1}
//           </div>
//           <Input
//             value={step.text}
//             onChange={e => update(step.id, e.target.value)}
//             placeholder={`Step ${i + 1} description`}
//             className="flex-1 h-8 text-sm"
//           />
//           <button
//             type="button"
//             onClick={() => remove(step.id)}
//             disabled={steps.length === 1}
//             className="text-muted-foreground/40 hover:text-destructive disabled:opacity-20 transition-colors"
//           >
//             <X size={14} />
//           </button>
//         </div>
//       ))}
//       <Button type="button" variant="outline" size="sm" onClick={add} className="h-7 text-xs gap-1">
//         <Plus size={11} /> Add Step
//       </Button>
//     </div>
//   );
// }

// /** File upload dropzone — shows preview thumbnail */
// function UploadZone({
//   label,
//   accept,
//   icon,
//   value,
//   onUpload,
// }: {
//   label: string;
//   accept: string;
//   icon: React.ReactNode;
//   value: string;
//   onUpload: (url: string) => void;
// }) {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [uploading, setUploading] = useState(false);

//   const handleFile = async (file: File) => {
//     setUploading(true);
//     try {
//       // ── Replace this block with your real upload logic ──────
//       // e.g. call /api/admin/demos/upload which returns { url }
//       const formData = new FormData();
//       formData.append('file', file);
//       const res = await fetch('/api/admin/demos/upload', {
//         method: 'POST',
//         body: formData,
//       });
//       const data = await res.json();
//       if (data.url) {
//         onUpload(data.url);
//         toast.success(`${label} uploaded`);
//       } else {
//         toast.error(data.error || 'Upload failed');
//       }
//       // ── End real upload block ────────────────────────────────
//     } catch {
//       toast.error('Upload failed');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const onDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     const file = e.dataTransfer.files[0];
//     if (file) handleFile(file);
//   };

//   return (
//     <div
//       className={`relative border-2 border-dashed rounded-xl p-4 text-center
//         transition-colors duration-200 cursor-pointer group
//         ${value
//           ? 'border-(--drop-red)/30 bg-red-50/50 dark:bg-red-950/10'
//           : 'border-border hover:border-(--drop-red)/40 bg-muted/30'
//         }`}
//       onClick={() => inputRef.current?.click()}
//       onDragOver={e => e.preventDefault()}
//       onDrop={onDrop}
//     >
//       <input
//         ref={inputRef}
//         type="file"
//         accept={accept}
//         className="hidden"
//         onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
//       />

//       {uploading ? (
//         <div className="flex flex-col items-center gap-2 py-2">
//           <Loader2 size={20} className="animate-spin text-(--drop-red)" />
//           <span className="text-xs text-muted-foreground">Uploading…</span>
//         </div>
//       ) : value ? (
//         <div className="flex items-center gap-2 justify-center">
//           <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
//             <div className="w-2 h-2 rounded-full bg-green-500" />
//           </div>
//           <span className="text-xs text-muted-foreground truncate max-w-50">
//             {value.split('/').pop()}
//           </span>
//           <button
//             type="button"
//             onClick={e => { e.stopPropagation(); onUpload(''); }}
//             className="ml-1 text-muted-foreground/40 hover:text-destructive transition-colors"
//           >
//             <X size={13} />
//           </button>
//         </div>
//       ) : (
//         <div className="flex flex-col items-center gap-1.5 py-1">
//           <div className="text-muted-foreground/50 group-hover:text-(--drop-red) transition-colors">
//             {icon}
//           </div>
//           <span className="text-xs text-muted-foreground">
//             <span className="font-medium text-foreground">Click to upload</span> or drag &amp; drop
//           </span>
//           <span className="text-[0.6rem] text-muted-foreground/50">{label}</span>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ─── Main form dialog ───────────────────────────────────────── */

// function VideoFormDialog({
//   open,
//   onClose,
//   initial,
//   onSave,
// }: {
//   open: boolean;
//   onClose: () => void;
//   initial: Partial<DemoVideo> | null;
//   onSave: (data: Partial<DemoVideo>) => Promise<void>;
// }) {
//   const isEdit = !!initial?.id;
//   const [form, setForm] = useState(() => ({
//     ...EMPTY_FORM,
//     ...(initial ?? {}),
//     steps: initial?.steps?.length
//       ? initial.steps
//       : [{ id: dropid("step"), text: '' }],
//   }));
//   const [saving, setSaving] = useState(false);

//   // Sync category → tag + color
//   const setCategory = (cat: DemoCategory) => {
//     const meta = CATEGORY_META[cat];
//     setForm(f => ({ ...f, category: cat, tag: cat, tagColor: meta.color }));
//   };

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.title.trim())       { toast.error('Title is required'); return; }
//     if (!form.src.trim())         { toast.error('Video file is required'); return; }
//     if (!form.poster.trim())      { toast.error('Thumbnail is required'); return; }
//     if (!form.codeSnippet.trim()) { toast.error('Code snippet is required'); return; }
//     const validSteps = form.steps.filter(s => s.text.trim());
//     if (validSteps.length < 2)    { toast.error('Add at least 2 steps'); return; }

//     setSaving(true);
//     try {
//       await onSave({ ...form, steps: validSteps });
//       onClose();
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="font-['Bricolage_Grotesque'] text-xl">
//             {isEdit ? 'Edit Demo Video' : 'Upload New Demo Video'}
//           </DialogTitle>
//           <DialogDescription>
//             This will appear on the{' '}
//             <span className="font-medium text-foreground">"See It In Action"</span> public page.
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={submit} className="space-y-5 mt-2">

//           {/* Category */}
//           <div className="space-y-1.5">
//             <Label>Service Category</Label>
//             <Select value={form.category} onValueChange={v => setCategory(v as DemoCategory)}>
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {CATEGORIES.map(cat => (
//                   <SelectItem key={cat} value={cat}>
//                     <div className="flex items-center gap-2">
//                       <span style={{ color: CATEGORY_META[cat].color }}>
//                         {CATEGORY_META[cat].icon}
//                       </span>
//                       {cat}
//                     </div>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Title */}
//           <div className="space-y-1.5">
//             <Label>Video Title</Label>
//             <Input
//               value={form.title}
//               onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
//               placeholder="e.g. Send Your First SMS in 60 Seconds"
//             />
//           </div>

//           {/* Description */}
//           <div className="space-y-1.5">
//             <Label>Short Description</Label>
//             <Textarea
//               value={form.description}
//               onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
//               placeholder="Shown below the video title on the public page…"
//               rows={2}
//               className="resize-none"
//             />
//           </div>

//           {/* Uploads */}
//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1.5">
//               <Label>Video File</Label>
//               <UploadZone
//                 label="MP4 / WebM"
//                 accept="video/mp4,video/webm"
//                 icon={<Video size={22} />}
//                 value={form.src}
//                 onUpload={url => setForm(f => ({ ...f, src: url }))}
//               />
//             </div>
//             <div className="space-y-1.5">
//               <Label>Thumbnail / Poster</Label>
//               <UploadZone
//                 label="JPG / PNG / WebP"
//                 accept="image/jpeg,image/png,image/webp"
//                 icon={<ImageIcon size={22} />}
//                 value={form.poster}
//                 onUpload={url => setForm(f => ({ ...f, poster: url }))}
//               />
//             </div>
//           </div>

//           {/* Manual URL override */}
//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1.5">
//               <Label className="text-muted-foreground text-xs">Video URL (override)</Label>
//               <Input
//                 value={form.src}
//                 onChange={e => setForm(f => ({ ...f, src: e.target.value }))}
//                 placeholder="https://cdn.dropaphi.com/…"
//                 className="h-8 text-xs font-mono"
//               />
//             </div>
//             <div className="space-y-1.5">
//               <Label className="text-muted-foreground text-xs">Poster URL (override)</Label>
//               <Input
//                 value={form.poster}
//                 onChange={e => setForm(f => ({ ...f, poster: e.target.value }))}
//                 placeholder="https://cdn.dropaphi.com/…"
//                 className="h-8 text-xs font-mono"
//               />
//             </div>
//           </div>

//           {/* Steps */}
//           <div className="space-y-2">
//             <Label>Integration Steps <span className="text-muted-foreground font-normal">(shown as numbered cards)</span></Label>
//             <StepsEditor
//               steps={form.steps}
//               onChange={steps => setForm(f => ({ ...f, steps }))}
//             />
//           </div>

//           {/* Code snippet */}
//           <div className="space-y-1.5">
//             <Label className="flex items-center gap-1.5">
//               <Code2 size={13} className="text-(--drop-red)" />
//               Code Snippet
//             </Label>
//             <Textarea
//               value={form.codeSnippet}
//               onChange={e => setForm(f => ({ ...f, codeSnippet: e.target.value }))}
//               placeholder={`const res = await fetch('https://api.dropaphi.com/v1/…'`}
//               rows={7}
//               className="resize-none font-mono text-xs"
//             />
//           </div>

//           {/* Sort order */}
//           <div className="space-y-1.5">
//             <Label>Sort Order <span className="text-muted-foreground font-normal">(lower = shown first)</span></Label>
//             <Input
//               type="number"
//               min={0}
//               value={form.sortOrder}
//               onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
//               className="w-28 h-8 text-sm"
//             />
//           </div>

//           <DialogFooter className="pt-2">
//             <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={saving}
//               className="bg-(--drop-red) hover:bg-(--drop-red)/90 text-white gap-2"
//             >
//               {saving && <Loader2 size={13} className="animate-spin" />}
//               {isEdit ? 'Save Changes' : 'Upload & Publish'}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// /* ─── Page ───────────────────────────────────────────────────── */

// export default function AdminDemoUploadPage() {
//   const [videos, setVideos]         = useState<DemoVideo[]>([]);
//   const [loading, setLoading]       = useState(true);
//   const [search, setSearch]         = useState('');
//   const [categoryFilter, setCategoryFilter] = useState<string>('All');
//   const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

//   const [formOpen, setFormOpen]     = useState(false);
//   const [editing, setEditing]       = useState<DemoVideo | null>(null);
//   const [deleteId, setDeleteId]     = useState<string | null>(null);

//   /* fetch */
//   const fetchVideos = async () => {
//     setLoading(true);
//     try {
//       const q = new URLSearchParams({
//         page:     pagination.page.toString(),
//         limit:    pagination.limit.toString(),
//         search,
//         category: categoryFilter === 'All' ? '' : categoryFilter,
//       });
//       const res  = await fetch(`/api/admin/demos?${q}`);
//       const data = await res.json();
//       if (data.success) {
//         setVideos(data.data.videos);
//         setPagination(data.data.pagination);
//       }
//     } catch {
//       toast.error('Failed to fetch demo videos');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchVideos(); }, [pagination.page, search, categoryFilter]);

//   /* create / update */
//   const handleSave = async (payload: Partial<DemoVideo>) => {
//     const isEdit = !!editing?.id;
//     const url    = isEdit ? `/api/admin/demos/${editing!.id}` : '/api/admin/demos';
//     const method = isEdit ? 'PATCH' : 'POST';

//     const res  = await fetch(url, {
//       method,
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     });
//     const data = await res.json();
//     if (data.success) {
//       toast.success(isEdit ? 'Demo updated' : 'Demo video uploaded');
//       fetchVideos();
//     } else {
//       toast.error(data.error || 'Failed to save');
//       throw new Error(data.error);
//     }
//   };

//   /* toggle field */
//   const toggle = async (id: string, field: 'isPublished' | 'isFeatured', current: boolean) => {
//     const res  = await fetch(`/api/admin/demos/${id}`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ [field]: !current }),
//     });
//     const data = await res.json();
//     if (data.success) {
//       toast.success('Updated');
//       fetchVideos();
//     } else {
//       toast.error(data.error || 'Failed');
//     }
//   };

//   /* delete */
//   const handleDelete = async () => {
//     if (!deleteId) return;
//     try {
//       const res  = await fetch(`/api/admin/demos/${deleteId}`, { method: 'DELETE' });
//       const data = await res.json();
//       if (data.success) { toast.success('Demo deleted'); fetchVideos(); }
//       else toast.error(data.error || 'Delete failed');
//     } catch {
//       toast.error('An error occurred');
//     } finally {
//       setDeleteId(null);
//     }
//   };

//   const openCreate = () => { setEditing(null); setFormOpen(true); };
//   const openEdit   = (v: DemoVideo) => { setEditing(v); setFormOpen(true); };

//   /* category counts */
//   const counts = videos.reduce<Record<string, number>>((acc, v) => {
//     acc[v.category] = (acc[v.category] ?? 0) + 1;
//     return acc;
//   }, {});

//   return (
//     <>
//       {/* ── Form dialog ── */}
//       {formOpen && (
//         <VideoFormDialog
//           open={formOpen}
//           onClose={() => { setFormOpen(false); setEditing(null); }}
//           initial={editing}
//           onSave={handleSave}
//         />
//       )}

//       {/* ── Delete confirm ── */}
//       <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete this demo video?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will remove the video from the public{' '}
//               <strong>"See It In Action"</strong> page immediately.
//               This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDelete}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               <Trash2 size={13} className="mr-1.5" /> Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* ── Page ── */}
//       <div className="space-y-6">

//         {/* Header */}
//         <div className="flex items-start justify-between gap-4 flex-wrap">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight font-['Bricolage_Grotesque']">
//               Demo Videos
//             </h1>
//             <p className="text-muted-foreground text-sm mt-1">
//               Manage integration demo videos shown on the{' '}
//               <a
//                 href="/see-it-in-action"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-(--drop-red) hover:underline inline-flex items-center gap-0.5"
//               >
//                 See It In Action <ExternalLink size={11} className="ml-0.5" />
//               </a>{' '}
//               public page.
//             </p>
//           </div>
//           <Button
//             onClick={openCreate}
//             className="bg-(--drop-red) hover:bg-(--drop-red)/90 text-white gap-2"
//           >
//             <Plus size={15} /> Upload Demo Video
//           </Button>
//         </div>

//         {/* Category quick-stats */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
//           {CATEGORIES.map(cat => {
//             const meta  = CATEGORY_META[cat];
//             const count = counts[cat] ?? 0;
//             const isActive = categoryFilter === cat;
//             return (
//               <button
//                 key={cat}
//                 onClick={() => setCategoryFilter(isActive ? 'All' : cat)}
//                 className={`flex items-center gap-2.5 p-3 rounded-xl border text-left
//                   transition-all duration-150 hover:-translate-y-0.5
//                   ${isActive
//                     ? 'border-(--drop-red)/40 bg-red-50 dark:bg-red-950/20'
//                     : 'border-border bg-card hover:border-border/60'
//                   }`}
//               >
//                 <div
//                   className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
//                   style={{ background: `${meta.color}18`, color: meta.color }}
//                 >
//                   {meta.icon}
//                 </div>
//                 <div>
//                   <p className=" font-bold text-lg leading-none text-foreground">
//                     {count}
//                   </p>
//                   <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wide mt-0.5">
//                     {cat}
//                   </p>
//                 </div>
//               </button>
//             );
//           })}
//         </div>

//         {/* Search + filter bar */}
//         <div className="flex items-center gap-3 flex-wrap">
//           <div className="relative flex-1 min-w-50">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search by title, category or tag…"
//               className="pl-10"
//               value={search}
//               onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
//             />
//           </div>
//           <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPagination(p => ({ ...p, page: 1 })); }}>
//             <SelectTrigger className="w-44">
//               <SelectValue placeholder="All Categories" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="All">All Categories</SelectItem>
//               {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Table */}
//         <div className="rounded-xl border border-border overflow-hidden">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-muted/40">
//                 <TableHead className="w-8 text-center">#</TableHead>
//                 <TableHead>Video</TableHead>
//                 <TableHead>Category</TableHead>
//                 <TableHead>Steps</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Featured</TableHead>
//                 <TableHead>Updated</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={8} className="h-32 text-center">
//                     <div className="flex items-center justify-center gap-2 text-muted-foreground">
//                       <Loader2 className="h-4 w-4 animate-spin" /> Loading demo videos…
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ) : videos.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={8} className="h-32 text-center">
//                     <div className="flex flex-col items-center gap-2 text-muted-foreground">
//                       <Video size={28} className="opacity-30" />
//                       <p className="text-sm">No demo videos found.</p>
//                       <Button variant="outline" size="sm" onClick={openCreate} className="gap-1 mt-1">
//                         <Plus size={12} /> Upload your first demo
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 videos.map((video, i) => {
//                   const meta = CATEGORY_META[video.category] ?? { color: '#999', icon: <Video size={13} /> };
//                   return (
//                     <TableRow key={video.id} className="group">
//                       {/* Sort order */}
//                       <TableCell className="text-center">
//                         <span className="font-mono text-xs text-muted-foreground">{video.sortOrder}</span>
//                       </TableCell>

//                       {/* Title + thumbnail */}
//                       <TableCell>
//                         <div className="flex items-center gap-3">
//                           {/* Poster preview */}
//                           <div className="w-14 h-9 rounded-md overflow-hidden bg-muted border border-border shrink-0 relative">
//                             {video.poster ? (
//                               <img src={video.poster} alt="" className="w-full h-full object-cover" />
//                             ) : (
//                               <div className="w-full h-full flex items-center justify-center">
//                                 <ImageIcon size={14} className="text-muted-foreground/30" />
//                               </div>
//                             )}
//                             <div className="absolute inset-0 flex items-center justify-center
//                               bg-black/0 group-hover:bg-black/30 transition-colors">
//                               <Play size={10} className="text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
//                             </div>
//                           </div>
//                           {/* Meta */}
//                           <div className="min-w-0">
//                             <p className="font-semibold text-sm text-foreground truncate max-w-55">
//                               {video.title}
//                             </p>
//                             <div className="flex items-center gap-1.5 mt-0.5">
//                               <span className="text-[0.58rem] text-muted-foreground">
//                                 {video.duration || '—'}
//                               </span>
//                               {video.src && (
//                                 <a
//                                   href={video.src}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   className="text-muted-foreground/40 hover:text-(--drop-red) transition-colors"
//                                 >
//                                   <ExternalLink size={10} />
//                                 </a>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </TableCell>

//                       {/* Category badge */}
//                       <TableCell>
//                         <Badge
//                           className="gap-1 text-[0.65rem] font-medium border"
//                           style={{
//                             background: `${meta.color}15`,
//                             color: meta.color,
//                             borderColor: `${meta.color}30`,
//                           }}
//                         >
//                           {meta.icon}
//                           {video.category}
//                         </Badge>
//                       </TableCell>

//                       {/* Steps count */}
//                       <TableCell>
//                         <span className="text-xs text-muted-foreground">
//                           {video.steps.length} step{video.steps.length !== 1 ? 's' : ''}
//                         </span>
//                       </TableCell>

//                       {/* Published */}
//                       <TableCell>
//                         <button
//                           onClick={() => toggle(video.id, 'isPublished', video.isPublished)}
//                           className="transition-all duration-150"
//                         >
//                           {video.isPublished ? (
//                             <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20 gap-1 hover:bg-green-500/25">
//                               <Eye size={10} /> Published
//                             </Badge>
//                           ) : (
//                             <Badge variant="outline" className="text-muted-foreground gap-1 hover:border-foreground/30">
//                               <EyeOff size={10} /> Draft
//                             </Badge>
//                           )}
//                         </button>
//                       </TableCell>

//                       {/* Featured */}
//                       <TableCell>
//                         <button
//                           onClick={() => toggle(video.id, 'isFeatured', video.isFeatured)}
//                           className="transition-all duration-150"
//                         >
//                           {video.isFeatured ? (
//                             <Badge className="bg-yellow-400/15 text-yellow-600 dark:text-yellow-400 border border-yellow-400/20 gap-1 hover:bg-yellow-400/25">
//                               ★ Featured
//                             </Badge>
//                           ) : (
//                             <Badge variant="outline" className="text-muted-foreground/40 gap-1 hover:border-foreground/30">
//                               ☆ Normal
//                             </Badge>
//                           )}
//                         </button>
//                       </TableCell>

//                       {/* Date */}
//                       <TableCell>
//                         <span className="font-mono text-xs text-muted-foreground">
//                           {formatDate(video.updatedAt)}
//                         </span>
//                       </TableCell>

//                       {/* Actions */}
//                       <TableCell className="text-right">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon" className="h-8 w-8">
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end" className="w-44">
//                             <DropdownMenuItem onClick={() => openEdit(video)} className="gap-2">
//                               <Pencil size={13} /> Edit Details
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={() => toggle(video.id, 'isPublished', video.isPublished)}
//                               className="gap-2"
//                             >
//                               {video.isPublished
//                                 ? <><EyeOff size={13} /> Unpublish</>
//                                 : <><Eye size={13} /> Publish</>
//                               }
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={() => toggle(video.id, 'isFeatured', video.isFeatured)}
//                               className="gap-2"
//                             >
//                               {video.isFeatured ? '☆ Unfeature' : '★ Mark Featured'}
//                             </DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem asChild>
//                               <a
//                                 href={`/in-action?demo=${video.id}`}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="flex items-center gap-2"
//                               >
//                                 <ExternalLink size={13} /> Preview Live
//                               </a>
//                             </DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem
//                               className="text-destructive focus:text-destructive gap-2"
//                               onClick={() => setDeleteId(video.id)}
//                             >
//                               <Trash2 size={13} /> Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         {/* Pagination */}
//         <div className="flex items-center justify-between flex-wrap gap-3">
//           <p className="text-sm text-muted-foreground">
//             Showing <span className="text-foreground font-medium">{videos.length}</span> of{' '}
//             <span className="text-foreground font-medium">{pagination.total}</span> demo videos
//           </p>
//           <div className="flex items-center gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={pagination.page === 1}
//               onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
//             >
//               Previous
//             </Button>
//             <span className="font-mono text-xs text-muted-foreground px-2">
//               {pagination.page} / {pagination.pages}
//             </span>
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={pagination.page === pagination.pages}
//               onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
//             >
//               Next
//             </Button>
//           </div>
//         </div>

//       </div>
//     </>
//   );
// }
