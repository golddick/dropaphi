import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, User, Clock, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.blogPost.findFirst({
    where: { slug, status: 'PUBLISHED', isApproved: true },
  });

  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await db.blogPost.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
      isApproved: true,
    },
    include: {
      author: {
        select: {
          fullName: true,
          avatarUrl: true,
          bio: true,
        },
      },
      workspace: {
        select: {
          name: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);

  return (
    <article className="min-h-screen bg-background">
      {/* Header / Hero */}
      <div className="w-full flex justify-center items-center  border-b border-border bg-muted/30">
        <div className="container  max-w-4xl  py-12 px-6">
          <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ChevronLeft size={16} />
            Back to blog
          </Link>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                {post.author.avatarUrl ? (
                  <img src={post.author.avatarUrl} alt={post.author.fullName} className="w-6 h-6 rounded-full" />
                ) : (
                  <User size={16} />
                )}
                <span className="font-medium text-foreground">{post.author.fullName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                {post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy') : 'Recently'}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                {readingTime} min read
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-12 px-6">
        {post.coverImage && (
          <div className="mb-12 rounded-xl overflow-hidden border border-border shadow-lg">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>
        )}

        <div 
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        <div className="mt-16 p-8 rounded-2xl bg-muted/50 border border-border flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
          {post.author.avatarUrl ? (
            <img src={post.author.avatarUrl} alt={post.author.fullName} className="w-20 h-20 rounded-full border-2 border-background shadow-sm" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={40} className="text-primary/40" />
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{post.author.fullName}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
              {post.author.bio || `Author at ${post.workspace.name}. Sharing insights and updates about our journey.`}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
