'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, List, ListOrdered, Link as LinkIcon, 
  Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, 
  Heading1, Heading2, Heading3, Quote, Undo, Redo,
  Upload, X, Save, Eye, Send, Settings, Globe, Loader2, PenTool, HelpCircle,
  Pilcrow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useFileStore } from '@/lib/stores/file/file-store';
import { useParams, useRouter } from 'next/navigation';
import { ImagePicker } from './image-picker';

interface BlogEditorProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

const MenuBar = ({ editor, onImageUpload }: { editor: any; onImageUpload: () => void }) => {
  if (!editor) return null;

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isHeadingDialogOpen, setIsHeadingDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageSettings, setImageSettings] = useState({
    width: 'auto',
    height: 'auto',
    borderRadius: '12px',
    textAlign: 'center'
  });

  const openLinkDialog = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setIsLinkDialogOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    const normalizedLink = linkUrl.trim();
    if (!normalizedLink) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: normalizedLink }).run();
    }
    setIsLinkDialogOpen(false);
  }, [editor, linkUrl]);

  const openImageSettings = useCallback(() => {
    const imageAttrs = editor.getAttributes('image') || {};
    setImageSettings({
      width: imageAttrs.width || 'auto',
      height: imageAttrs.height || 'auto',
      borderRadius: imageAttrs.borderRadius || '12px',
      textAlign: imageAttrs.textAlign || 'center'
    });
    setIsImageDialogOpen(true);
  }, [editor]);

  const saveImageSettings = useCallback(() => {
    editor.chain().focus().updateAttributes('image', {
      width: imageSettings.width || 'auto',
      height: imageSettings.height || 'auto',
      borderRadius: imageSettings.borderRadius || '12px',
      textAlign: imageSettings.textAlign || 'center'
    }).run();
    setIsImageDialogOpen(false);
  }, [editor, imageSettings]);

  const applyParagraph = useCallback(() => {
    editor.chain().focus().setNode('paragraph').run();
  }, [editor]);

  const applyHeading = useCallback((level: 1 | 2 | 3) => {
    editor.chain().focus().setNode('heading', { level }).run();
  }, [editor]);

  const applyQuote = useCallback(() => {
    editor.chain().focus().toggleBlockquote().run();
  }, [editor]);

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30 sticky top-0 z-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-muted' : ''}
        title="Bold"
      >
        <Bold size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-muted' : ''}
        title="Italic"
      >
        <Italic size={16} />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={applyParagraph}
        className={editor.isActive('paragraph') ? 'bg-muted' : ''}
        title="Paragraph"
      >
        <Pilcrow size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsHeadingDialogOpen(true)}
        className={editor.isActive('heading') ? 'bg-muted' : ''}
        title="Heading"
      >
        <Heading1 size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => applyHeading(1)}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
        title="H1"
      >
        <Heading1 size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => applyHeading(2)}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        title="H2"
      >
        <Heading2 size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => applyHeading(3)}
        className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
        title="H3"
      >
        <Heading3 size={16} />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        title="Bullet List"
      >
        <List size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
        title="Align Right"
      >
        <AlignRight size={16} />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={openLinkDialog}
        className={editor.isActive('link') ? 'bg-muted' : ''}
        title="Add Link"
      >
        <LinkIcon size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onImageUpload}
        title="Insert Image"
      >
        <ImageIcon size={16} />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={applyQuote}
        className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        title="Blockquote"
      >
        <Quote size={16} />
      </Button>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={16} />
      </Button>

      {editor.isActive('image') && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={openImageSettings}
            title="Image Settings"
          >
            <Settings size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().updateAttributes('image', { textAlign: 'left' }).run()}
            className={editor.getAttributes('image').textAlign === 'left' ? 'bg-muted' : ''}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().updateAttributes('image', { textAlign: 'center' }).run()}
            className={editor.getAttributes('image').textAlign === 'center' ? 'bg-muted' : ''}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().updateAttributes('image', { textAlign: 'right' }).run()}
            className={editor.getAttributes('image').textAlign === 'right' ? 'bg-muted' : ''}
            title="Align Right"
          >
            <AlignRight size={16} />
          </Button>
        </>
      )}

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-md fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle>Add link</DialogTitle>
            <DialogDescription>Choose the destination URL for the selected text.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blog_link_url">URL</Label>
              <Input id="blog_link_url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>Cancel</Button>
            <Button onClick={applyLink}>Apply Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHeadingDialogOpen} onOpenChange={setIsHeadingDialogOpen}>
        <DialogContent className="sm:max-w-sm fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle>Choose heading</DialogTitle>
            <DialogDescription>Highlight content and select the heading level.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => { applyHeading(1); setIsHeadingDialogOpen(false); }}>H1</Button>
            <Button variant="outline" onClick={() => { applyHeading(2); setIsHeadingDialogOpen(false); }}>H2</Button>
            <Button variant="outline" onClick={() => { applyHeading(3); setIsHeadingDialogOpen(false); }}>H3</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle>Image settings</DialogTitle>
            <DialogDescription>Update the selected image styling.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="image_width">Width</Label>
                <Input id="image_width" value={imageSettings.width} onChange={(e) => setImageSettings(curr => ({ ...curr, width: e.target.value }))} placeholder="auto or 500px" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_height">Height</Label>
                <Input id="image_height" value={imageSettings.height} onChange={(e) => setImageSettings(curr => ({ ...curr, height: e.target.value }))} placeholder="auto or 300px" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_radius">Border radius</Label>
              <Input id="image_radius" value={imageSettings.borderRadius} onChange={(e) => setImageSettings(curr => ({ ...curr, borderRadius: e.target.value }))} placeholder="12px" />
            </div>
            <div className="space-y-2">
              <Label>Alignment</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant={imageSettings.textAlign === 'left' ? 'secondary' : 'outline'} onClick={() => setImageSettings(curr => ({ ...curr, textAlign: 'left' }))}><AlignLeft size={14} className="mr-2" />Left</Button>
                <Button variant={imageSettings.textAlign === 'center' ? 'secondary' : 'outline'} onClick={() => setImageSettings(curr => ({ ...curr, textAlign: 'center' }))}><AlignCenter size={14} className="mr-2" />Center</Button>
                <Button variant={imageSettings.textAlign === 'right' ? 'secondary' : 'outline'} onClick={() => setImageSettings(curr => ({ ...curr, textAlign: 'right' }))}><AlignRight size={14} className="mr-2" />Right</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveImageSettings}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export function BlogEditor({ initialData, onSave, isSubmitting }: BlogEditorProps) {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();
  const { uploadFile } = useFileStore();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [activeTab, setActiveTab] = useState('edit');
  const [isUploading, setIsUploading] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePickerType, setImagePickerType] = useState<'inline' | 'cover'>('inline');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg border border-border max-w-full h-auto my-4 cursor-pointer',
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: 'auto',
              renderHTML: attributes => {
                if (!attributes.width || attributes.width === 'auto') return {};
                return { width: attributes.width };
              },
            },
            height: {
              default: 'auto',
              renderHTML: attributes => {
                if (!attributes.height || attributes.height === 'auto') return {};
                return { height: attributes.height };
              },
            },
            borderRadius: {
              default: '12px',
              renderHTML: attributes => {
                if (!attributes.borderRadius) return {};
                return { style: `border-radius: ${attributes.borderRadius};` };
              },
            },
            textAlign: {
              default: 'center',
              renderHTML: attributes => {
                if (!attributes.textAlign || attributes.textAlign === 'center') return {};
                if (attributes.textAlign === 'left') return { style: 'float: left; margin-right: 1rem;' };
                if (attributes.textAlign === 'right') return { style: 'float: right; margin-left: 1rem;' };
                return {};
              },
            },
          };
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialData?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[400px] max-w-none p-4',
      },
    },
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !initialData?.slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [title, initialData?.slug]);

  // const handleImageUpload = async (file: File, type: 'inline' | 'cover') => {
  //   if (!file) return;
    
  //   setIsUploading(true);
  //   try {
  //     const result = await uploadFile(workspaceId, file);
  //     if (result) {
  //       const url = useFileStore.getState().getFileUrl(result);
  //       if (type === 'inline') {
  //         editor?.chain().focus().setImage({ src: url }).run();
  //       } else {
  //         setCoverImage(url);
  //       }
  //       toast.success('Image uploaded successfully');
  //     }
  //   } catch (error) {
  //     toast.error('Failed to upload image');
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const handleImageSelect = (url: string) => {
    if (imagePickerType === 'inline') {
      editor?.chain().focus().setImage({ src: url }).run();
    } else {
      setCoverImage(url);
    }
  };

  const openImagePicker = (type: 'inline' | 'cover') => {
    setImagePickerType(type);
    setImagePickerOpen(true);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title) {
      toast.error('Please enter a title');
      return;
    }

    if (!slug) {
      toast.error('Please enter a slug');
      return;
    }

    const content = editor?.getHTML() || '';
    const payload = {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      status,
      tags,
      isFeatured,
    };

    await onSave(payload);
  };

  const ReadingPreview = () => (
    <div className="bg-card rounded-lg border border-border p-8 w-full space-y-8">
      {coverImage && (
        <img src={coverImage} alt={title} className="w-full aspect-video object-cover rounded-xl shadow-sm" />
      )}
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{title || 'Untitled Post'}</h1>
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Loader2 size={20} className="animate-spin" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground">Author Name</p>
            <p>{new Date().toLocaleDateString()} • 5 min read</p>
          </div>
        </div>
      </div>
      <div 
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-8 border-t border-border">
          {tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">{initialData?.id ? 'Edit Post' : 'Create New Post'}</h2>
            <p className="text-sm text-muted-foreground">Draft and publish your blog content.</p>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="ml-4">
            <TabsList>
              <TabsTrigger value="edit" className="gap-2">
                <PenTool size={14} />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye size={14} />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Blog editor tips">
                <HelpCircle size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <div className="space-y-2">
                <p className="font-semibold">How to use the blog editor</p>
                <ul className="text-xs space-y-1 list-disc pl-4">
                  <li>Select text, then use Heading, Bold, Italic, Bullet List, and Link buttons.</li>
                  <li>Use the image button to insert media, then set width, height, radius, and alignment.</li>
                  <li>Save your article as a draft or publish it from the status panel.</li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
          <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting || isUploading}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting || isUploading}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {status === 'PUBLISHED' ? 'Update & Publish' : 'Save as Draft'}
                <Save size={16} />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className={activeTab === 'preview' ? 'block' : 'hidden'}>
        <ReadingPreview />
      </div>

      <div className={activeTab === 'edit' ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : 'hidden'}>
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4 bg-card rounded-lg border border-border p-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter post title..."
                className="text-lg font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">dropaphi.xyz/blog/</span>
                <Input 
                  id="slug" 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value)} 
                  placeholder="post-url-slug"
                  className="h-8"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden relative">
            {isUploading && (
              <div className="absolute inset-0 bg-background/50 z-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={32} className="animate-spin text-primary" />
                  <p className="text-sm font-medium">Uploading image...</p>
                </div>
              </div>
            )}
            <MenuBar 
              editor={editor} 
              onImageUpload={() => openImagePicker('inline')} 
            />
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Status</Label>
                <p className="text-xs text-muted-foreground">
                  {status === 'PUBLISHED' ? 'Visible to public' : 'Internal draft'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${status === 'PUBLISHED' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {status}
                </span>
                <Switch 
                  checked={status === 'PUBLISHED'} 
                  onCheckedChange={(checked) => setStatus(checked ? 'PUBLISHED' : 'DRAFT')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="space-y-0.5">
                <Label>Featured Post</Label>
                <p className="text-xs text-muted-foreground">
                  Highlight on main blog page
                </p>
              </div>
              <Switch 
                checked={isFeatured} 
                onCheckedChange={setIsFeatured}
              />
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <Label>Cover Image</Label>
              {isUploading && imagePickerType === 'cover' ? (
                <div className="aspect-video rounded-md border border-border flex flex-col items-center justify-center bg-muted/30">
                  <Loader2 size={24} className="animate-spin text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Uploading...</p>
                </div>
              ) : coverImage ? (
                <div className="relative aspect-video rounded-md overflow-hidden border border-border group">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openImagePicker('cover')}>
                      Change
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setCoverImage('')}>
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="aspect-video rounded-md border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => openImagePicker('cover')}
                >
                  <Upload size={24} className="text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">Add cover image</p>
                </div>
              )}
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea 
                id="excerpt" 
                value={excerpt} 
                onChange={(e) => setExcerpt(e.target.value)} 
                placeholder="Brief summary of the post..."
                className="resize-none h-24"
              />
              <p className="text-[10px] text-muted-foreground">Used for SEO and social sharing.</p>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <Label>Tags</Label>
              <Input 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Add tags..."
                className="h-8"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {tag}
                    <X size={10} className="cursor-pointer" onClick={() => removeTag(tag)} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Globe size={14} />
              Publishing Info
            </h4>
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li>• Notifications sent to active subscribers.</li>
              <li>• Billing credits deducted on first publish.</li>
              <li>• Reading time calculated automatically.</li>
            </ul>
          </div>
        </div>
      </div>

      <ImagePicker 
        isOpen={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleImageSelect}
        workspaceId={workspaceId}
      />
    </div>
  );
}
