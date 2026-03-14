






'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileIcon, Grid2X2, List, MoreVertical, Copy, Trash2, Eye, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceID } from '@/lib/id/workspace';
import { useFileStore } from '@/lib/stores/file/file-store';
import { formatDate, formatFileSize } from '@/lib/auth/auth-client';

export default function FileManagerPage() {
  const  workspaceId = useWorkspaceID();
  const {
    files,
    selectedFiles,
    viewMode,
    isLoading,
    error,
    pagination,
    setViewMode,
    fetchFiles,
    uploadFile,
    deleteFile,
    copyUrl,
    toggleSelectFile,
    clearSelected,
    getFileUrl,
  } = useFileStore();

  const [dragActive, setDragActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Load files on mount
  useEffect(() => {
    if (workspaceId) {
      fetchFiles(workspaceId);
    }
  }, [workspaceId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFilesUpload(droppedFiles);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.currentTarget.files;
    if (selectedFiles) {
      await handleFilesUpload(Array.from(selectedFiles));
    }
    // Reset input
    e.target.value = '';
  };

  const handleFilesUpload = async (files: File[]) => {
    if (!workspaceId) return;

    for (const file of files) {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      // Simulate progress (actual progress would need XMLHttpRequest)
      const interval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: Math.min((prev[file.name] || 0) + 10, 90),
        }));
      }, 200);

      const uploaded = await uploadFile(workspaceId, file);

      clearInterval(interval);
      
      if (uploaded) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 1000);
      } else {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
  };

  const handleCopyUrl = async (file: any) => {
    const url = getFileUrl(file);
    const success = await copyUrl(url);
    if (success) {
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!workspaceId) return;
    if (confirm('Are you sure you want to delete this file?')) {
      await deleteFile(workspaceId, fileId);
      if (previewFile?.id === fileId) {
        setPreviewFile(null);
      }
    }
  };

  const toggleMenu = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === fileId ? null : fileId);
  };

  const loadMore = () => {
    if (workspaceId && pagination.page < pagination.pages) {
      fetchFiles(workspaceId, null, pagination.page + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            File Manager
          </h1>
          <p style={{ color: '#666666' }}>
            Manage your files with CDN integration
          </p>
        </div>
        {selectedFiles.length > 0 && (
          <Button
            variant="outline"
            onClick={clearSelected}
            size="sm"
          >
            Clear Selection ({selectedFiles.length})
          </Button>
        )}
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            <Grid2X2 size={18} />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </Button>
        </div>
        <label>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            disabled={isLoading}
          />
          {/* <Button 
            className="cursor-pointer" 
            style={{ backgroundColor: '#DC143C' }}
            onClick={handleFileInput}
            disabled={isLoading}
          >
            <Upload size={18} className="mr-2" />
            Upload Files
          </Button> */}
        </label>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className="p-8 rounded-lg border-2 border-dashed text-center cursor-pointer transition-colors relative"
        style={{
          borderColor: dragActive ? '#DC143C' : '#E5E5E5',
          backgroundColor: dragActive ? 'rgba(220, 20, 60, 0.05)' : 'transparent',
        }}
      >
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            disabled={isLoading}
          />
          <Upload
            size={32}
            style={{ color: '#999999' }}
            className="mx-auto mb-2"
          />
          <p className="font-medium" style={{ color: '#1A1A1A' }}>
            Drag and drop files here or click to upload
          </p>
          <p className="text-xs mt-1" style={{ color: '#999999' }}>
            Maximum file size: 25MB
          </p>
        </label>

        {/* Upload Progress */}
        <AnimatePresence>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <motion.div
              key={fileName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3 border"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm truncate max-w-50">{fileName}</span>
                <span className="text-xs font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: '#DC143C' }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-lg"
            style={{ backgroundColor: '#FEF2F2', color: '#DC143C' }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && files.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={32} className="animate-spin" style={{ color: '#DC143C' }} />
        </div>
      ) : (
        <>
          {/* Files List/Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {files.length === 0 ? (
              <div className="text-center py-12">
                <FileIcon size={48} style={{ color: '#999999' }} className="mx-auto mb-4" />
                <p style={{ color: '#666666' }}>No files uploaded yet</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-4 rounded-lg border group relative cursor-pointer"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: selectedFiles.includes(file.id) ? '#DC143C' : '#E5E5E5',
                      boxShadow: selectedFiles.includes(file.id) ? '0 0 0 2px rgba(220,20,60,0.2)' : 'none',
                    }}
                    onClick={() => toggleSelectFile(file.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="p-2 rounded"
                        style={{ backgroundColor: 'rgba(220, 20, 60, 0.1)' }}
                      >
                        <FileIcon size={24} style={{ color: '#DC143C' }} />
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => toggleMenu(file.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical size={18} style={{ color: '#999999' }} />
                        </button>
                        <AnimatePresence>
                          {openMenuId === file.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute right-0 top-8 w-40 rounded-lg border shadow-lg z-10 bg-white"
                              style={{ borderColor: '#E5E5E5' }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewFile(file);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-b flex items-center gap-2 first:rounded-t-lg"
                                style={{ borderColor: '#E5E5E5', color: '#1A1A1A' }}
                              >
                                <Eye size={16} />
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyUrl(file);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-b flex items-center gap-2"
                                style={{ borderColor: '#E5E5E5', color: '#1A1A1A' }}
                              >
                                <Copy size={16} />
                                Copy URL
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(file.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 last:rounded-b-lg"
                                style={{ color: '#DC143C' }}
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <p className="text-sm font-bold truncate" style={{ color: '#1A1A1A' }}>
                      {file.name}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#999999' }}>
                      {formatFileSize(file.size)}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(file);
                        }}
                        style={{
                          backgroundColor: copiedId === file.id ? '#DC143C' : 'transparent',
                          color: copiedId === file.id ? 'white' : 'inherit',
                          borderColor: copiedId === file.id ? '#DC143C' : '#E5E5E5',
                        }}
                      >
                        <Copy size={14} className="mr-1" />
                        {copiedId === file.id ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file.id);
                        }}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    style={{
                      borderBottom: index < files.length - 1 ? '1px solid #E5E5E5' : 'none',
                      backgroundColor: selectedFiles.includes(file.id) ? 'rgba(220,20,60,0.05)' : 'transparent',
                    }}
                    onClick={() => toggleSelectFile(file.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileIcon size={20} style={{ color: '#999999' }} />
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
                          {file.name}
                        </p>
                        <p className="text-xs" style={{ color: '#999999' }}>
                          {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(file);
                        }}
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(file);
                        }}
                        style={{
                          backgroundColor: copiedId === file.id ? '#DC143C' : 'transparent',
                          color: copiedId === file.id ? 'white' : 'inherit',
                          borderColor: copiedId === file.id ? '#DC143C' : '#E5E5E5',
                        }}
                      >
                        <Copy size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {pagination.page < pagination.pages && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : null}
                  Load More
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold truncate pr-4" style={{ color: '#1A1A1A' }}>
                  {previewFile.name}
                </h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6 p-6 rounded-lg" style={{ backgroundColor: '#F5F5F5', textAlign: 'center' }}>
                {previewFile.mimeType?.startsWith('image/') ? (
                  <img
                    src={getFileUrl(previewFile)}
                    alt={previewFile.name}
                    className="max-w-full max-h-64 mx-auto object-contain"
                  />
                ) : (
                  <FileIcon size={64} style={{ color: '#DC143C', margin: '0 auto' }} />
                )}
                <p className="mt-4 text-sm" style={{ color: '#666666' }}>
                  {previewFile.name}
                </p>
                <p className="text-xs mt-1" style={{ color: '#999999' }}>
                  {formatFileSize(previewFile.size)} • {formatDate(previewFile.createdAt)}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-xs font-bold" style={{ color: '#666666' }}>
                    CDN URL
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={getFileUrl(previewFile)}
                      readOnly
                      className="flex-1 p-2 border rounded-lg text-sm"
                      style={{ borderColor: '#E5E5E5' }}
                    />
                    <Button
                      onClick={() => handleCopyUrl(previewFile)}
                      style={{ backgroundColor: '#DC143C' }}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold" style={{ color: '#666666' }}>
                    FILE TYPE
                  </label>
                  <p className="mt-1 text-sm" style={{ color: '#1A1A1A' }}>
                    {previewFile.mimeType}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold" style={{ color: '#666666' }}>
                    UPLOADED
                  </label>
                  <p className="mt-1 text-sm" style={{ color: '#1A1A1A' }}>
                    {formatDate(previewFile.createdAt)}
                  </p>
                </div>

                {previewFile.width && previewFile.height && (
                  <div>
                    <label className="text-xs font-bold" style={{ color: '#666666' }}>
                      DIMENSIONS
                    </label>
                    <p className="mt-1 text-sm" style={{ color: '#1A1A1A' }}>
                      {previewFile.width} x {previewFile.height} pixels
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setPreviewFile(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleCopyUrl(previewFile);
                  }}
                  className="flex-1"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  <Copy size={18} className="mr-2" />
                  Copy URL
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}