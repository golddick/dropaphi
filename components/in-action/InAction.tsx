// app/see-it-in-action/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Play,
  Pause,
  ArrowRight,
  MessageSquare,
  Mail,
  Shield,
  HardDrive,
  Bell,
  ChevronRight,
  Clock,
  CheckCircle2,
  Code2,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Loader2,
  Youtube,
  Pen,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Types ─────────────────────────────────────────────────── */

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

interface DemoStep {
  id: string;
  text: string;
}

interface DemoVideo {
  id: string;
  category: string;
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

/* ─── Category Meta ─────────────────────────────────────────── */

const CATEGORY_META: Record<string, { color: string; icon: React.ReactNode }> = {
  'SMS': { color: '#ef4444', icon: <MessageSquare size={15} /> },
  'Email': { color: '#3b82f6', icon: <Mail size={15} /> },
  'OTP / 2FA': { color: '#22c55e', icon: <Shield size={15} /> },
  'File Storage': { color: '#f97316', icon: <HardDrive size={15} /> },
  'Push': { color: '#a855f7', icon: <Bell size={15} /> },
  'Blog': { color: '#a855f7', icon: <Pen size={15} /> },
};

const CATEGORIES = ['All', 'SMS', 'Email', 'OTP / 2FA', 'File Storage', 'Push', 'Blog'];

/* ─── YouTube Player Component ───────────────────────────────── */

function YouTubePlayer({
  videoId,
  onReady,
  onPlay,
  onPause,
  onEnd,
}: {
  videoId: string;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load YouTube API
    if (!document.querySelector('#youtube-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      if (containerRef.current) {
        playerRef.current = new (window as any).YT.Player(containerRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
          },
          events: {
            onReady: () => {
              setIsReady(true);
              onReady?.();
            },
            onStateChange: (event: any) => {
              if (event.data === 1) {
                onPlay?.(); // Playing
              } else if (event.data === 2) {
                onPause?.(); // Paused
              } else if (event.data === 0) {
                onEnd?.(); // Ended
              }
            },
          },
        });
      }
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  return <div ref={containerRef} className="w-full aspect-video" />;
}

/* ─── Custom Video Player (MP4) ──────────────────────────────── */

function CustomVideoPlayer({
  src,
  poster,
  onExpand,
}: {
  src: string;
  poster: string;
  onExpand: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      v.play();
      setPlaying(true);
      setHasStarted(true);
    }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border bg-black group">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        playsInline
        onTimeUpdate={onTimeUpdate}
        onEnded={() => {
          setPlaying(false);
          setProgress(100);
        }}
        className="w-full aspect-video object-cover"
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

      <div className="absolute top-3 right-3">
        <button
          onClick={onExpand}
          className="p-1.5 rounded-lg bg-black/50 border border-white/10 text-white/70
            hover:text-white hover:bg-black/70 transition-all duration-150 opacity-0 group-hover:opacity-100"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {!hasStarted && (
        <button
          onClick={toggle}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center
              shadow-[0_0_40px_rgba(220,20,60,0.5)]"
          >
            <Play size={22} className="fill-white text-white ml-1" />
          </motion.div>
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2">
        <div onClick={seek} className="h-1 bg-white/20 rounded-full cursor-pointer group/bar">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-100 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5
              rounded-full bg-white shadow-sm opacity-0 group-hover/bar:opacity-100 transition-opacity" />
          </div>
        </div>

        {hasStarted && (
          <div className="flex items-center justify-between">
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              {playing ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              onClick={() => {
                setMuted(!muted);
                if (videoRef.current) videoRef.current.muted = !muted;
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Video Player Wrapper (Supports both YouTube and MP4) ───── */

function VideoPlayer({
  video,
  onExpand,
}: {
  video: DemoVideo;
  onExpand: () => void;
}) {
  const isYouTube = video.src.includes('youtube.com') || video.src.includes('youtu.be');
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (isYouTube) {
    const videoId = getYouTubeId(video.src);
    if (!videoId) {
      return <div className="text-red-500">Invalid YouTube URL</div>;
    }

    return (
      <div className="relative rounded-2xl overflow-hidden border border-border bg-black">
        <YouTubePlayer
          videoId={videoId}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnd={() => setIsPlaying(false)}
        />
        <div className="absolute top-3 right-3">
          <button
            onClick={onExpand}
            className="p-1.5 rounded-lg bg-black/50 border border-white/10 text-white/70
              hover:text-white hover:bg-black/70 transition-all duration-150"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <CustomVideoPlayer
      src={video.src}
      poster={video.poster}
      onExpand={onExpand}
    />
  );
}

/* ─── Fullscreen Modal ───────────────────────────────────────── */

function FullscreenModal({
  video,
  onClose,
}: {
  video: DemoVideo;
  onClose: () => void;
}) {
  const isYouTube = video.src.includes('youtube.com') || video.src.includes('youtu.be');
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10"
          onClick={e => e.stopPropagation()}
        >
          {isYouTube ? (
            <div className="w-full aspect-video">
              <YouTubePlayer videoId={getYouTubeId(video.src)!} />
            </div>
          ) : (
            <video
              src={video.src}
              poster={video.poster}
              controls
              autoPlay
              className="w-full aspect-video"
            />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-black/60 border border-white/10
              text-white/70 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Video Card Component ───────────────────────────────────── */

function VideoCard({
  video,
  isActive,
  onClick,
}: {
  video: DemoVideo;
  isActive: boolean;
  onClick: () => void;
}) {
  const meta = CATEGORY_META[video.category] || { color: '#999', icon: <Play size={15} /> };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.18 }}
      className={`w-full text-left flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200
        ${isActive
          ? 'border-red-500/40 bg-red-50 dark:bg-red-950/20'
          : 'border-border bg-card hover:border-red-500/20 hover:bg-muted/50'
        }`}
    >
      <div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
        style={{ background: `${meta.color}18`, color: meta.color }}
      >
        {meta.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[0.6rem] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: `${meta.color}15`, color: meta.color }}
          >
            {video.category}
          </span>
          <span className="text-[0.6rem] text-muted-foreground flex items-center gap-1">
            <Clock size={9} /> {video.duration}
          </span>
        </div>
        <p className="font-semibold text-sm text-foreground leading-snug">
          {video.title}
        </p>
      </div>

      <ChevronRight
        size={14}
        className={`shrink-0 mt-1.5 transition-all duration-200 ${isActive ? 'text-red-500 rotate-90' : 'text-muted-foreground/30'}`}
      />
    </motion.button>
  );
}

/* ─── Code Block Component ───────────────────────────────────── */

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl border border-border bg-[#0d0d12] dark:bg-[#0d0d12] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Code2 size={12} className="text-red-500" />
          <span className="text-[0.6rem] text-muted-foreground uppercase tracking-widest">
            Integration Example
          </span>
        </div>
        <button
          onClick={copy}
          className="text-[0.6rem] px-2.5 py-1 rounded-md border border-border
            text-muted-foreground hover:text-foreground hover:border-white/20 transition-all duration-150"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-[0.72rem] leading-relaxed text-white overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */

export default function SeeItInActionPage() {
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string>('');
  const [filter, setFilter] = useState<string>('All');
  const [expanded, setExpanded] = useState<DemoVideo | null>(null);

  // Fetch demos from API
  useEffect(() => {
    const fetchDemos = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/demos');
        const data = await res.json();
        if (data.success) {
          setVideos(data.data.demos);
          if (data.data.demos.length > 0) {
            setActiveId(data.data.demos[0].id);
          }
        } else {
          toast.error('Failed to load demos');
        }
      } catch (error) {
        console.error('Error fetching demos:', error);
        toast.error('Failed to load demos');
      } finally {
        setLoading(false);
      }
    };

    fetchDemos();
  }, []);

  const filtered = filter === 'All' 
    ? videos 
    : videos.filter(v => v.category === filter);
  
  const active = videos.find(v => v.id === activeId) ?? videos[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          <p className="text-muted-foreground">Loading demos...</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Demos Available</h2>
          <p className="text-muted-foreground">Check back soon for video demonstrations.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {expanded && (
        <FullscreenModal video={expanded} onClose={() => setExpanded(null)} />
      )}

      <main className="relative min-h-screen bg-background overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-175 h-100 rounded-full
            bg-[radial-gradient(ellipse_at_center,rgba(220,20,60,0.08)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-4 text-[0.65rem] text-muted-foreground
              uppercase tracking-widest mb-5">
              <Link href="/" className="hover:text-red-500 transition-colors">Home</Link>
              <ChevronRight size={10} />
              <span className="text-foreground">See It In Action</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6
              bg-red-50 dark:bg-red-950/40
              border border-red-200 dark:border-red-800/40
              font-mono text-[0.68rem] text-red-600 dark:text-red-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
              Live Integration Demos
            </div>

            <h1 className="font-['Bricolage_Grotesque'] font-extrabold
              text-[clamp(2.2rem,5vw,4rem)] leading-[1.06] tracking-[-0.03em]
              text-foreground mb-4">
              Watch How It{' '}
              <span className="text-red-500">All Comes Together</span>
            </h1>
            <p className="font-['Plus_Jakarta_Sans'] text-base md:text-lg text-muted-foreground
              leading-relaxed max-w-2xl mx-auto">
              Real integration walkthroughs — from your first API call to production-ready features.
              No fluff. Just code running live.
            </p>
          </motion.div>

          {/* Filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap gap-2 justify-center mb-10"
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setFilter(cat);
                  if (cat !== 'All') {
                    const v = videos.find(v => v.category === cat);
                    if (v) setActiveId(v.id);
                  } else if (videos.length > 0) {
                    setActiveId(videos[0].id);
                  }
                }}
                className={`px-4 py-2 rounded-full font-mono text-xs border transition-all duration-200
                  ${filter === cat
                    ? 'bg-red-500 border-border text-white shadow-[0_4px_16px_rgba(220,20,60,0.3)]'
                    : 'bg-card border-border text-muted-foreground hover:border-red-500/40 hover:text-foreground'
                  }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Main layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            {/* Left side - Video player */}
            <motion.div layout className="space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <VideoPlayer video={active} onExpand={() => setExpanded(active)} />
                </motion.div>
              </AnimatePresence>

              {/* Video details */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`meta-${active.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="font-mono text-[0.62rem] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: `${CATEGORY_META[active.category]?.color || '#999'}15`,
                            color: CATEGORY_META[active.category]?.color || '#999',
                            border: `1px solid ${CATEGORY_META[active.category]?.color || '#999'}30`,
                          }}
                        >
                          {active.category}
                        </span>
                        <span className="text-[0.62rem] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} /> {active.duration}
                        </span>
                      </div>
                      <h2 className="font-bold text-2xl text-foreground">
                        {active.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        {active.description}
                      </p>
                    </div>
                    <Link
                      href="/auth/signup"
                      className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                        bg-red-500 text-white font-bold text-sm
                        hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(220,20,60,0.3)]
                        transition-all duration-200"
                    >
                      Try It Free <ArrowRight size={14} />
                    </Link>
                  </div>

                  {/* Steps */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {active.steps.map((step, i) => (
                      <div key={step.id} className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card">
                        <div
                          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                            text-[0.6rem] font-bold text-white mt-0.5"
                          style={{ background: CATEGORY_META[active.category]?.color || '#999' }}
                        >
                          {i + 1}
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug">{step.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Code snippet */}
                  <CodeBlock code={active.codeSnippet} />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Right side - Video list */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2.5 lg:sticky lg:top-6"
            >
              <p className="text-[0.65rem] text-muted-foreground uppercase tracking-widest px-1 mb-3">
                {filtered.length} Demo{filtered.length !== 1 ? 's' : ''} Available
              </p>
              {filtered.map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isActive={video.id === activeId}
                  onClick={() => setActiveId(video.id)}
                />
              ))}

              {/* CTA card */}
              <div className="mt-4 p-4 rounded-xl border border-border bg-card dark:bg-red-950/20">
                <p className="font-bold text-sm text-foreground mb-1">
                  Ready to integrate?
                </p>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Get your API key and go live in minutes. No credit card required.
                </p>
                <Link
                  href="/auth/signup"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                    bg-red-500 text-white font-bold text-xs
                    hover:opacity-90 transition-all duration-200"
                >
                  Get Started Free <ArrowRight size={12} />
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { val: '<5min', lbl: 'Avg integration time' },
                  { val: '1 key', lbl: 'For all services' },
                  { val: '99.9%', lbl: 'Uptime SLA' },
                  { val: '24/7', lbl: 'Support' },
                ].map(({ val, lbl }) => (
                  <div key={lbl} className="p-3 rounded-xl border border-border bg-card text-center">
                    <div className="font-extrabold text-base text-foreground">
                      {val}
                    </div>
                    <div className="text-[0.58rem] text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                      {lbl}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom trust strip */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 pt-10 border-t border-border flex flex-col sm:flex-row items-center
              justify-between gap-6"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {[
                'No vendor lock-in',
                'Works with any framework',
                'Webhook support included',
                'Playground & sandbox free',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={14} className="text-red-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground
                hover:text-red-500 transition-colors border-b border-transparent
                hover:border-border pb-0.5"
            >
              Read the full docs <ArrowRight size={12} />
            </Link>
          </motion.div>
        </div>
      </main>
    </>
  );
}


// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import Link from 'next/link';
// import {
//   Play,
//   Pause,
//   ArrowRight,
//   MessageSquare,
//   Mail,
//   Shield,
//   HardDrive,
//   ChevronRight,
//   Clock,
//   CheckCircle2,
//   Code2,
//   Maximize2,
//   X,
//   Volume2,
//   VolumeX,
// } from 'lucide-react';

// /* ─── Types ─────────────────────────────────────────────────── */

// interface Video {
//   id: string;
//   category: string;
//   title: string;
//   description: string;
//   duration: string;
//   tag: string;
//   tagColor: string;
//   icon: React.ReactNode;
//   // Replace these src values with your real video URLs
//   src: string;
//   poster: string;
//   steps: string[];
//   codeSnippet: string;
// }

// /* ─── Data ──────────────────────────────────────────────────── */

// const VIDEOS: Video[] = [
//   {
//     id: 'sms',
//     category: 'SMS',
//     title: 'Send Your First SMS in 60 Seconds',
//     description:
//       'Watch how to authenticate, craft a message payload, and deliver an SMS to any number worldwide — with delivery receipts built in.',
//     duration: '1:02',
//     tag: 'SMS',
//     tagColor: '#ef4444',
//     icon: <MessageSquare size={15} />,
//     src: '/videos/demo-sms.mp4',          // ← swap with real URL
//     poster: '/posters/demo-sms.jpg',      // ← swap with real URL
//     steps: [
//       'Install the SDK or grab your API key',
//       'Build the message payload',
//       'Call send() and handle the response',
//       'Track delivery status in real time',
//     ],
//     codeSnippet: `const res = await fetch('https://api.dropaphi.com/v1/sms/send', {
//   method: 'POST',
//   headers: {
//     'Authorization': 'Bearer YOUR_API_KEY',
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     to: '+2348012345678',
//     message: 'Your OTP is 482910. Valid for 5 mins.',
//   }),
// });
// const { messageId, status } = await res.json();
// // status: 'queued' → 'delivered'`,
//   },
//   {
//     id: 'email',
//     category: 'Email',
//     title: 'Transactional Emails with One Call',
//     description:
//       'From welcome emails to receipts — see how to send HTML & plain-text emails with open-tracking and template support.',
//     duration: '1:28',
//     tag: 'Email',
//     tagColor: '#3b82f6',
//     icon: <Mail size={15} />,
//     src: '/videos/demo-email.mp4',
//     poster: '/posters/demo-email.jpg',
//     steps: [
//       'Verify your sender domain in the dashboard',
//       'Choose a template or pass raw HTML',
//       'Send with metadata for analytics',
//       'Monitor open & click rates live',
//     ],
//     codeSnippet: `const res = await fetch('https://api.dropaphi.com/v1/email/send', {
//   method: 'POST',
//   headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
//   body: JSON.stringify({
//     from: 'hello@yourapp.com',
//     to: 'user@example.com',
//     subject: 'Welcome aboard 🎉',
//     html: '<h1>You're in!</h1><p>Thanks for joining.</p>',
//     tracking: { opens: true, clicks: true },
//   }),
// });`,
//   },
//   {
//     id: 'otp',
//     category: 'OTP / 2FA',
//     title: 'Verify Users with OTP in 3 Steps',
//     description:
//       'Generate a time-limited code, send it via SMS or Email, then verify — all from a single unified API surface.',
//     duration: '0:58',
//     tag: 'OTP / 2FA',
//     tagColor: '#22c55e',
//     icon: <Shield size={15} />,
//     src: '/videos/demo-otp.mp4',
//     poster: '/posters/demo-otp.jpg',
//     steps: [
//       'Request OTP generation for a phone/email',
//       'We deliver the code instantly',
//       'Verify the code server-side',
//       'Get a signed session token back',
//     ],
//     codeSnippet: `// Step 1: Send OTP
// await fetch('https://api.dropaphi.com/v1/otp/send', {
//   method: 'POST',
//   headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
//   body: JSON.stringify({ to: '+2348012345678', channel: 'sms' }),
// });

// // Step 2: Verify OTP
// const { valid, token } = await fetch(
//   'https://api.dropaphi.com/v1/otp/verify',
//   { method: 'POST', body: JSON.stringify({ to: '+2348012345678', code: '482910' }) }
// ).then(r => r.json());`,
//   },
//   {
//     id: 'storage',
//     category: 'File Storage',
//     title: 'Upload & Serve Files Instantly',
//     description:
//       'Multipart upload, CDN delivery, signed URLs and access controls — see the full file lifecycle in under 90 seconds.',
//     duration: '1:34',
//     tag: 'File Storage',
//     tagColor: '#f97316',
//     icon: <HardDrive size={15} />,
//     src: '/videos/demo-storage.mp4',
//     poster: '/posters/demo-storage.jpg',
//     steps: [
//       'Get a pre-signed upload URL',
//       'Stream the file directly from the browser',
//       'Receive a CDN-backed public or private URL',
//       'Set expiry & access policies in one call',
//     ],
//     codeSnippet: `// Get upload URL
// const { uploadUrl, fileId } = await fetch(
//   'https://api.dropaphi.com/v1/storage/presign',
//   { method: 'POST', body: JSON.stringify({ filename: 'avatar.png', mimeType: 'image/png' }) }
// ).then(r => r.json());

// // Upload directly from browser
// await fetch(uploadUrl, { method: 'PUT', body: file });

// // Serve it
// const publicUrl = \`https://cdn.dropaphi.com/\${fileId}\`;`,
//   },
// ];

// const CATEGORIES = ['All', 'SMS', 'Email', 'OTP / 2FA', 'File Storage'];

// /* ─── Sub-components ────────────────────────────────────────── */

// function VideoCard({
//   video,
//   isActive,
//   onClick,
// }: {
//   video: Video;
//   isActive: boolean;
//   onClick: () => void;
// }) {
//   return (
//     <motion.button
//       onClick={onClick}
//       whileHover={{ x: 4 }}
//       transition={{ duration: 0.18 }}
//       className={`w-full text-left flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200
//         ${isActive
//           ? 'border-(--drop-red)/40 bg-red-50 dark:bg-red-950/20'
//           : 'border-border bg-card hover:border-(--drop-red)/20 hover:bg-muted/50'
//         }`}
//     >
//       {/* Icon */}
//       <div
//         className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
//         style={{ background: `${video.tagColor}18`, color: video.tagColor }}
//       >
//         {video.icon}
//       </div>

//       {/* Text */}
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2 mb-0.5">
//           <span
//             className=" text-[0.6rem] px-1.5 py-0.5 rounded-full font-medium"
//             style={{ background: `${video.tagColor}15`, color: video.tagColor }}
//           >
//             {video.tag}
//           </span>
//           <span className=" text-[0.6rem] text-muted-foreground flex items-center gap-1">
//             <Clock size={9} /> {video.duration}
//           </span>
//         </div>
//         <p className=" font-semibold text-sm text-foreground leading-snug">
//           {video.title}
//         </p>
//       </div>

//       {/* Active indicator */}
//       <ChevronRight
//         size={14}
//         className={`shrink-0 mt-1.5 transition-all duration-200 ${isActive ? 'text-(--drop-red)rotate-90' : 'text-muted-foreground/30'}`}
//       />
//     </motion.button>
//   );
// }

// function CodeBlock({ code }: { code: string }) {
//   const [copied, setCopied] = useState(false);

//   const copy = () => {
//     navigator.clipboard.writeText(code);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <div className="relative rounded-xl border border-border bg-[#0d0d12] dark:bg-[#0d0d12] overflow-hidden">
//       {/* Header bar */}
//       <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
//         <div className="flex items-center gap-2">
//           <Code2 size={12} className="text-(--drop-red)" />
//           <span className=" text-[0.6rem] text-muted-foreground uppercase tracking-widest">
//             Integration Example
//           </span>
//         </div>
//         <button
//           onClick={copy}
//           className=" text-[0.6rem] px-2.5 py-1 rounded-md border border-border
//             text-muted-foreground hover:text-foreground hover:border-white/20 transition-all duration-150"
//         >
//           {copied ? '✓ Copied' : 'Copy'}
//         </button>
//       </div>
//       {/* Code */}
//       <pre className="p-4 text-[0.72rem] leading-relaxed text-white overflow-x-auto font-mono">
//         <code>{code}</code>
//       </pre>
//     </div>
//   );
// }

// function VideoPlayer({
//   video,
//   onExpand,
// }: {
//   video: Video;
//   onExpand: () => void;
// }) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [playing, setPlaying] = useState(false);
//   const [muted, setMuted] = useState(true);
//   const [progress, setProgress] = useState(0);
//   const [hasStarted, setHasStarted] = useState(false);

//   // Reset when video changes
//   useEffect(() => {
//     setPlaying(false);
//     setProgress(0);
//     setHasStarted(false);
//     videoRef.current?.load();
//   }, [video.id]);

//   const toggle = () => {
//     const v = videoRef.current;
//     if (!v) return;
//     if (playing) { v.pause(); setPlaying(false); }
//     else { v.play(); setPlaying(true); setHasStarted(true); }
//   };

//   const onTimeUpdate = () => {
//     const v = videoRef.current;
//     if (!v || !v.duration) return;
//     setProgress((v.currentTime / v.duration) * 100);
//   };

//   const seek = (e: React.MouseEvent<HTMLDivElement>) => {
//     const v = videoRef.current;
//     if (!v) return;
//     const rect = e.currentTarget.getBoundingClientRect();
//     const pct  = (e.clientX - rect.left) / rect.width;
//     v.currentTime = pct * v.duration;
//   };

//   return (
//     <div className="relative rounded-2xl overflow-hidden border border-border bg-black group">
//       {/* Video */}
//       <video
//         ref={videoRef}
//         src={video.src}
//         poster={video.poster}
//         muted={muted}
//         playsInline
//         onTimeUpdate={onTimeUpdate}
//         onEnded={() => { setPlaying(false); setProgress(100); }}
//         className="w-full aspect-video object-cover"
//       />

//       {/* Overlay gradient */}
//       <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

//       {/* Tag + expand */}
//       <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
//         <span
//           className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.62rem] font-medium"
//           style={{ background: `${video.tagColor}22`, color: video.tagColor, border: `1px solid ${video.tagColor}33` }}
//         >
//           {video.icon}
//           {video.tag}
//         </span>
//         <button
//           onClick={onExpand}
//           className="p-1.5 rounded-lg bg-black/50 border border-white/10 text-white/70
//             hover:text-white hover:bg-black/70 transition-all duration-150 opacity-0 group-hover:opacity-100"
//         >
//           <Maximize2 size={13} />
//         </button>
//       </div>

//       {/* Big play button — only before start */}
//       {!hasStarted && (
//         <button
//           onClick={toggle}
//           className="absolute inset-0 flex items-center justify-center"
//         >
//           <motion.div
//             whileHover={{ scale: 1.08 }}
//             whileTap={{ scale: 0.95 }}
//             className="w-16 h-16 rounded-full bg-(--drop-red) flex items-center justify-center
//               shadow-[0_0_40px_rgba(220,20,60,0.5)]"
//           >
//             <Play size={22} className="fill-white text-white ml-1" />
//           </motion.div>
//         </button>
//       )}

//       {/* Bottom controls */}
//       <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2">
//         {/* Progress bar */}
//         <div
//           onClick={seek}
//           className="h-1 bg-white/20 rounded-full cursor-pointer group/bar"
//         >
//           <div
//             className="h-full bg-(--drop-red) rounded-full transition-all duration-100 relative"
//             style={{ width: `${progress}%` }}
//           >
//             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5
//               rounded-full bg-white shadow-sm opacity-0 group-hover/bar:opacity-100 transition-opacity" />
//           </div>
//         </div>

//         {/* Controls row */}
//         {hasStarted && (
//           <div className="flex items-center justify-between">
//             <button
//               onClick={toggle}
//               className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
//             >
//               {playing ? <Pause size={13} /> : <Play size={13} />}
//             </button>
//             <button
//               onClick={() => { setMuted(m => !m); if (videoRef.current) videoRef.current.muted = !muted; }}
//               className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
//             >
//               {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function FullscreenModal({
//   video,
//   onClose,
// }: {
//   video: Video;
//   onClose: () => void;
// }) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [playing, setPlaying] = useState(false);
//   const [muted, setMuted] = useState(false);

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
//     window.addEventListener('keydown', onKey);
//     return () => window.removeEventListener('keydown', onKey);
//   }, [onClose]);

//   const toggle = () => {
//     const v = videoRef.current;
//     if (!v) return;
//     if (playing) { v.pause(); setPlaying(false); }
//     else { v.play(); setPlaying(true); }
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.92, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.92, opacity: 0 }}
//           transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
//           className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-white/10"
//           onClick={e => e.stopPropagation()}
//         >
//           <video
//             ref={videoRef}
//             src={video.src}
//             poster={video.poster}
//             muted={muted}
//             playsInline
//             className="w-full aspect-video object-cover"
//           />
//           <div className="absolute inset-0 flex items-center justify-center">
//             {!playing && (
//               <button onClick={toggle}>
//                 <motion.div
//                   whileHover={{ scale: 1.08 }}
//                   className="w-20 h-20 rounded-full bg-(--drop-red) flex items-center justify-center
//                     shadow-[0_0_60px_rgba(220,20,60,0.6)]"
//                 >
//                   <Play size={28} className="fill-white text-white ml-1.5" />
//                 </motion.div>
//               </button>
//             )}
//           </div>
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 p-2 rounded-lg bg-black/60 border border-white/10
//               text-white/70 hover:text-white transition-all"
//           >
//             <X size={16} />
//           </button>
//           {playing && (
//             <button
//               onClick={toggle}
//               className="absolute bottom-4 left-4 p-2 rounded-lg bg-black/60 border border-white/10
//                 text-white/70 hover:text-white transition-all"
//             >
//               <Pause size={16} />
//             </button>
//           )}
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// /* ─── Page ──────────────────────────────────────────────────── */

// export default function SeeItInActionPage() {
//   const [activeId, setActiveId]       = useState<string>(VIDEOS[0].id);
//   const [filter, setFilter]           = useState<string>('All');
//   const [expanded, setExpanded]       = useState<Video | null>(null);

//   const filtered = filter === 'All' ? VIDEOS : VIDEOS.filter(v => v.category === filter);
//   const active   = VIDEOS.find(v => v.id === activeId) ?? VIDEOS[0];

//   return (
//     <>
//       {/* Fullscreen modal */}
//       {expanded && (
//         <FullscreenModal video={expanded} onClose={() => setExpanded(null)} />
//       )}

//       <main className="relative min-h-screen bg-background overflow-hidden">

//         {/* ── Background decorations ── */}
//         <div className="absolute inset-0 pointer-events-none">
//           {/* Dot grid */}
//           <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
//             style={{ backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
//           {/* Red glow top */}
//           <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-175 h-100 rounded-full
//             bg-[radial-gradient(ellipse_at_center,rgba(220,20,60,0.08)_0%,transparent_70%)]" />
//           {/* Red glow bottom-right */}
//           <div className="absolute bottom-0 right-0 w-125 h-100
//             bg-[radial-gradient(ellipse_at_bottom_right,rgba(220,20,60,0.06)_0%,transparent_65%)]" />
//         </div>

//         <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">

//           {/* ── Header ── */}
//           <motion.div
//             initial={{ opacity: 0, y: 24 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
//             className="text-center mb-14"
//           >
//             {/* Breadcrumb */}
//             <div className="inline-flex items-center gap-2 font-mono text-[0.65rem] text-muted-foreground
//               uppercase tracking-widest mb-5">
//               <Link href="/" className="hover:text-(--drop-red) transition-colors">Home</Link>
//               <ChevronRight size={10} />
//               <span className="text-foreground">See It In Action</span>
//             </div>

//             {/* Badge */}
//             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6
//               bg-red-50 dark:bg-red-950/40
//               border border-red-200 dark:border-red-800/40
//               font-mono text-[0.68rem] text-red-600 dark:text-red-400 uppercase tracking-widest">
//               <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
//               Live Integration Demos
//             </div>

//             <h1 className="font-['Bricolage_Grotesque'] font-extrabold
//               text-[clamp(2.2rem,5vw,4rem)] leading-[1.06] tracking-[-0.03em]
//               text-foreground mb-4">
//               Watch How It{' '}
//               <span className="text-(--drop-red)">All Comes Together</span>
//             </h1>
//             <p className="font-['Plus_Jakarta_Sans'] text-base md:text-lg text-muted-foreground
//               leading-relaxed max-w-2xl mx-auto">
//               Real integration walkthroughs — from your first API call to production-ready features.
//               No fluff. Just code running live.
//             </p>
//           </motion.div>

//           {/* ── Filter tabs ── */}
//           <motion.div
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2, duration: 0.5 }}
//             className="flex flex-wrap gap-2 justify-center mb-10"
//           >
//             {CATEGORIES.map(cat => (
//               <button
//                 key={cat}
//                 onClick={() => { setFilter(cat); if (cat !== 'All') { const v = VIDEOS.find(v => v.category === cat); if (v) setActiveId(v.id); } }}
//                 className={`px-4 py-2 rounded-full font-mono text-xs border transition-all duration-200
//                   ${filter === cat
//                     ? 'bg-(--drop-red) border-border text-white shadow-[0_4px_16px_rgba(220,20,60,0.3)]'
//                     : 'bg-card border-border text-muted-foreground hover:border-(--drop-red)/40 hover:text-foreground'
//                   }`}
//               >
//                 {cat}
//               </button>
//             ))}
//           </motion.div>

//           {/* ── Main layout ── */}
//           <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

//             {/* Left — active video + details */}
//             <motion.div
//               layout
//               className="space-y-5"
//             >
//               {/* Video player */}
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={active.id}
//                   initial={{ opacity: 0, y: 16 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -8 }}
//                   transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
//                 >
//                   <VideoPlayer video={active} onExpand={() => setExpanded(active)} />
//                 </motion.div>
//               </AnimatePresence>

//               {/* Video meta */}
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={`meta-${active.id}`}
//                   initial={{ opacity: 0, y: 12 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   transition={{ duration: 0.3 }}
//                   className="space-y-5"
//                 >
//                   {/* Title row */}
//                   <div className="flex items-start justify-between gap-4 flex-wrap">
//                     <div>
//                       <div className="flex items-center gap-2 mb-2">
//                         <span
//                           className="font-mono text-[0.62rem] px-2 py-0.5 rounded-full font-medium"
//                           style={{ background: `${active.tagColor}15`, color: active.tagColor, border: `1px solid ${active.tagColor}30` }}
//                         >
//                           {active.tag}
//                         </span>
//                         <span className=" text-[0.62rem] text-muted-foreground flex items-center gap-1">
//                           <Clock size={10} /> {active.duration}
//                         </span>
//                       </div>
//                       <h2 className=" font-bold text-2xl text-foreground">
//                         {active.title}
//                       </h2>
//                       <p className=" text-sm text-muted-foreground mt-1.5 leading-relaxed">
//                         {active.description}
//                       </p>
//                     </div>
//                     <Link
//                       href="/auth/signup"
//                       className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
//                         bg-(--drop-red) text-white  font-bold text-sm
//                         hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(220,20,60,0.3)]
//                         transition-all duration-200"
//                     >
//                       Try It Free <ArrowRight size={14} />
//                     </Link>
//                   </div>

//                   {/* Steps */}
//                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                     {active.steps.map((step, i) => (
//                       <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card">
//                         <div
//                           className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center
//                             text-[0.6rem] font-bold text-foreground mt-0.5"
//                           style={{ background: active.tagColor }}
//                         >
//                           {i + 1}
//                         </div>
//                         <p className=" text-xs text-muted-foreground leading-snug">{step}</p>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Code snippet */}
//                   <CodeBlock code={active.codeSnippet} />
//                 </motion.div>
//               </AnimatePresence>
//             </motion.div>

//             {/* Right — video list */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
//               className="space-y-2.5 lg:sticky lg:top-6"
//             >
//               <p className=" text-[0.65rem] text-muted-foreground uppercase tracking-widest px-1 mb-3">
//                 {filtered.length} Demo{filtered.length !== 1 ? 's' : ''} Available
//               </p>
//               {filtered.map(video => (
//                 <VideoCard
//                   key={video.id}
//                   video={video}
//                   isActive={video.id === activeId}
//                   onClick={() => setActiveId(video.id)}
//                 />
//               ))}

//               {/* CTA card */}
//               <div className="mt-4 p-4 rounded-xl border border-border
//                 bg-card dark:bg-red-950/20">
//                 <p className=" font-bold text-sm text-foreground mb-1">
//                   Ready to integrate?
//                 </p>
//                 <p className=" text-xs text-muted-foreground mb-3 leading-relaxed">
//                   Get your API key and go live in minutes. No credit card required.
//                 </p>
//                 <Link
//                   href="/auth/signup"
//                   className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
//                     bg-(--drop-red) text-white font-bold text-xs
//                     hover:opacity-90 transition-all duration-200"
//                 >
//                   Get Started Free <ArrowRight size={12} />
//                 </Link>
//               </div>

//               {/* Stat chips */}
//               <div className="grid grid-cols-2 gap-2 pt-1">
//                 {[
//                   { val: '<5min', lbl: 'Avg integration time' },
//                   { val: '1 key', lbl: 'For all services' },
//                   { val: '99.9%', lbl: 'Uptime SLA' },
//                   { val: '24/7',  lbl: 'Support' },
//                 ].map(({ val, lbl }) => (
//                   <div key={lbl} className="p-3 rounded-xl border border-border bg-card text-center">
//                     <div className=" font-extrabold text-base text-foreground">
//                       {val}
//                     </div>
//                     <div className=" text-[0.58rem] text-muted-foreground/60 uppercase tracking-widest mt-0.5">
//                       {lbl}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>
//           </div>

//           {/* ── Bottom trust strip ── */}
//           <motion.div
//             initial={{ opacity: 0, y: 24 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5, duration: 0.6 }}
//             className="mt-16 pt-10 border-t border-border flex flex-col sm:flex-row items-center
//               justify-between gap-6"
//           >
//             <div className="flex flex-col sm:flex-row items-center gap-6">
//               {[
//                 'No vendor lock-in',
//                 'Works with any framework',
//                 'Webhook support included',
//                 'Playground & sandbox free',
//               ].map((item) => (
//                 <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
//                   <CheckCircle2 size={14} className="text-(--drop-red) shrink-0" />
//                   {item}
//                 </div>
//               ))}
//             </div>
//             <Link
//               href="/docs"
//               className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground
//                 hover:text-(--drop-red) transition-colors border-b border-transparent
//                 hover:border-border pb-0.5"
//             >
//               Read the full docs <ArrowRight size={12} />
//             </Link>
//           </motion.div>

//         </div>
//       </main>
//     </>
//   );
// }
