// components/UploadZone.tsx
'use client';

import { useRef, useState, useCallback } from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePlatformUpload } from '@/hooks/usePlatformUpload';

interface UploadZoneProps {
  label: string;
  accept: string;
  icon: React.ReactNode;
  value: string;
  onUpload: (url: string) => void;
  type: string;
  entityType?: string;
  entityId?: string;
}

export function UploadZone({
  label,
  accept,
  icon,
  value,
  onUpload,
  type,
  entityType = 'demo',
  entityId,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const { upload } = usePlatformUpload({
    type,
    entityType,
    entityId,
    onSuccess: useCallback((url: string, file: File) => {
      console.log('Upload success - URL:', url);
      onUpload(url);
      toast.success(`${label} uploaded: ${file.name}`);
      setIsUploading(false);
      setUploadProgress(0);
    }, [label, onUpload]),
    onError: useCallback((error: string, file: File) => {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${file.name}: ${error}`);
      setIsUploading(false);
      setUploadProgress(0);
    }, []),
    onProgress: useCallback((progress: number) => {
      setUploadProgress(progress);
    }, []),
  });

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const id = await upload(file);
      console.log('Upload started with ID:', id);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [upload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // Reset input
  }, [handleFile]);

  const clearFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onUpload('');
  }, [onUpload]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-4 text-center
        transition-colors duration-200 cursor-pointer group
        ${value
          ? 'border-red-500/30 bg-red-50/50 dark:bg-red-950/10'
          : 'border-border hover:border-red-500/40 bg-muted/30'
        }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onFileChange}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <Loader2 size={20} className="animate-spin text-red-500" />
          <span className="text-xs text-muted-foreground">
            Uploading... {Math.round(uploadProgress)}%
          </span>
          <div className="w-full bg-muted rounded-full h-1">
            <div 
              className="bg-red-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : value ? (
        <div className="flex items-center gap-2 justify-center">
          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-50">
            {value.split('/').pop()}
          </span>
          <button
            type="button"
            onClick={clearFile}
            className="ml-1 text-muted-foreground/40 hover:text-destructive transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 py-1">
          <div className="text-muted-foreground/50 group-hover:text-red-500 transition-colors">
            {icon}
          </div>
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Click to upload</span> or drag &amp; drop
          </span>
          <span className="text-[0.6rem] text-muted-foreground/50">{label}</span>
        </div>
      )}
    </div>
  );
}