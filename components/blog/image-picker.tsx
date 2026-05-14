'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, FileIcon, Grid2X2, List, Check, Upload } from 'lucide-react';
import { useFileStore } from '@/lib/stores/file/file-store';
import { formatFileSize } from '@/lib/auth/auth-client';
import { motion, AnimatePresence } from 'framer-motion';

interface ImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  workspaceId: string;
}

export function ImagePicker({ isOpen, onClose, onSelect, workspaceId }: ImagePickerProps) {
  const {
    files,
    isLoading,
    fetchFiles,
    getFileUrl,
    uploadFile,
    pagination,
  } = useFileStore();

  const [search, setSearch] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen && workspaceId) {
      fetchFiles(workspaceId);
    }
  }, [isOpen, workspaceId, fetchFiles]);

  const filteredFiles = files.filter(file => 
    file.mimeType.startsWith('image/') && 
    (file.originalName.toLowerCase().includes(search.toLowerCase()) || 
     file.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && workspaceId) {
      setIsUploading(true);
      try {
        const result = await uploadFile(workspaceId, file);
        if (result) {
          const url = getFileUrl(result);
          onSelect(url);
          onClose();
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Select Image</DialogTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search images..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid2X2 size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List size={16} />
              </Button>
            </div>
            <Button variant="outline" size="sm" asChild disabled={isUploading}>
              <label className="cursor-pointer gap-2">
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Upload
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-sm text-muted-foreground">Loading images...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <FileIcon size={48} />
              <p>No images found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredFiles.map((file) => {
                const url = getFileUrl(file);
                const isSelected = selectedUrl === url;
                return (
                  <div
                    key={file.id}
                    className={`relative aspect-square rounded-lg border-2 cursor-pointer overflow-hidden group transition-all ${
                      isSelected ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setSelectedUrl(url)}
                  >
                    <img
                      src={url}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check size={16} />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white truncate px-1">{file.originalName}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border rounded-md divide-y">
              {filteredFiles.map((file) => {
                const url = getFileUrl(file);
                const isSelected = selectedUrl === url;
                return (
                  <div
                    key={file.id}
                    className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/50 transition-colors ${
                      isSelected ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => setSelectedUrl(url)}
                  >
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <img src={url} alt={file.originalName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.originalName}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    {isSelected && <Check size={16} className="text-primary mr-2" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSelect} disabled={!selectedUrl}>Select Image</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
