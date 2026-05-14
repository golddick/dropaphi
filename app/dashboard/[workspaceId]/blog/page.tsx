'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2, 
  ExternalLink, FileText, CheckCircle, Clock, Eye 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function BlogListPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const url = new URL(`/api/workspace/${workspaceId}/blog`, window.location.origin);
      if (search) url.searchParams.append('search', search);
      if (statusFilter !== 'ALL') url.searchParams.append('status', statusFilter);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data.posts);
      } else {
        toast.error('Failed to load blog posts');
      }
    } catch (error) {
      toast.error('An error occurred while loading posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/workspace/${workspaceId}/blog/${postId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Post deleted successfully');
        fetchPosts();
      } else {
        toast.error(data.error || 'Failed to delete post');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your workspace blog content and publications.</p>
        </div>
        <Button onClick={() => router.push(`/dashboard/${workspaceId}/blog/new`)} className="gap-2">
          <Plus size={16} />
          Create Post
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search posts..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select 
            className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Published At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="animate-spin text-muted-foreground" size={24} />
                    <p className="text-sm text-muted-foreground">Loading posts...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                  <FileText className="mx-auto mb-4 opacity-20" size={48} />
                  <p>No blog posts found.</p>
                  <Button variant="link" onClick={() => router.push(`/dashboard/${workspaceId}/blog/new`)}>
                    Create your first post
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{post.title}</span>
                      <span className="text-xs text-muted-foreground">/{post.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'} className="gap-1">
                      {post.status === 'PUBLISHED' ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Eye size={14} />
                      {post.viewCount || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/${workspaceId}/blog/${post.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {post.status === 'PUBLISHED' && (
                          <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Public
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
