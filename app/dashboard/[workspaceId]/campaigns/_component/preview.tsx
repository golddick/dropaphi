// app/(dashboard)/workspace/[workspaceId]/email/campaigns/components/template-preview-modal.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Eye, Code, FileText, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TemplatePreviewModalProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatePreviewModal({ template, open, onOpenChange }: TemplatePreviewModalProps) {
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'preview' | 'html' | 'json'>('preview');

  if (!template) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(template.id);
    toast({
      title: 'Copied!',
      description: 'Template ID copied to clipboard',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{template.name}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode('desktop')}
                className={cn(previewMode === 'desktop' && 'bg-gray-100')}
              >
                <Monitor size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode('mobile')}
                className={cn(previewMode === 'mobile' && 'bg-gray-100')}
              >
                <Smartphone size={16} />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('preview')}
                className={cn(viewMode === 'preview' && 'bg-gray-100')}
              >
                <Eye size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('html')}
                className={cn(viewMode === 'html' && 'bg-gray-100')}
              >
                <Code size={16} />
              </Button>

            </div>
          </DialogTitle>
          <DialogDescription className=' flex items-center'>
            Subject: {template.subject} • Template ID: {template.id}
            <Button
              variant="default"
              size="sm"
              className="ml-2 h-6"
              onClick={handleCopyId}
            >
              <Copy size={12} className="mr-1" />
              Copy ID
            </Button>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 hidden-scrollbar overflow-auto mt-4">
          {viewMode === 'preview' && (
            <div className={cn(
              "mx-auto border rounded-lg overflow-hidden",
              previewMode === 'mobile' ? "max-w-95" : "max-w-3xl"
            )}>
              <iframe
                srcDoc={template.previewHtml || '<html><body><p>No HTML content</p></body></html>'}
                className="w-full h-full min-h-125"
                title="Template Preview"
                sandbox="allow-same-origin"
              />
            </div>
          )}

          {viewMode === 'html' && (
            <ScrollArea className="h-full">
              <pre className="p-4 bg-gray-50 rounded-lg text-xs font-mono">
                {template.previewHtml || 'No HTML content'}
              </pre>
            </ScrollArea>
          )}

          {viewMode === 'json' && (
            <ScrollArea className="h-full">
              <pre className="p-4 bg-gray-50 rounded-lg text-xs font-mono">
                {JSON.stringify(template.elements || {}, null, 2)}
              </pre>
            </ScrollArea>
          )}
        </div>

        {/* <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button style={{ backgroundColor: '#DC143C' }}>
            Use Template
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}