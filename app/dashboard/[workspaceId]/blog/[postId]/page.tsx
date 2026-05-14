'use client';

import React, { useState, useEffect } from 'react';
import { BlogEditor } from '@/components/blog/blog-editor';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EditBlogPostPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const postId = params.postId as string;
  const router = useRouter();

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // We use the workspace route to ensure authorization
        const response = await fetch(`/api/workspace/${workspaceId}/blog`);
        const result = await response.json();
        
        if (result.success) {
          const foundPost = result.data.posts.find((p: any) => p.id === postId);
          if (foundPost) {
            setPost(foundPost);
          } else {
            toast.error('Post not found');
            router.push(`/dashboard/${workspaceId}/blog`);
          }
        }
      } catch (error) {
        toast.error('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, workspaceId]);

  const handleSave = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/blog/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Changes saved successfully');
        router.push(`/dashboard/${workspaceId}/blog`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to save changes');
      }
    } catch (error) {
      toast.error('An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="container max-w-5xl py-6">
      <BlogEditor 
        initialData={post} 
        onSave={handleSave} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
}
