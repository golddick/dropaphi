'use client';

import React, { useState } from 'react';
import { BlogEditor } from '@/components/blog/blog-editor';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';

export default function NewBlogPostPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(data.status === 'PUBLISHED' ? 'Post published successfully' : 'Draft saved');
        router.push(`/dashboard/${workspaceId}/blog`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to save post');
      }
    } catch (error) {
      toast.error('An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-5xl py-6">
      <BlogEditor onSave={handleSave} isSubmitting={isSubmitting} />
    </div>
  );
}
