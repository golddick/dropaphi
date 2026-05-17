// hooks/usePlatformUpload.ts
import { useCallback, useRef } from 'react';

interface UsePlatformUploadOptions {
  type: string;
  entityType: string;
  entityId?: string;
  onSuccess?: (url: string, file: File, uploadId: string) => void;
  onError?: (error: string, file: File, uploadId: string) => void;
  onProgress?: (progress: number, file: File, uploadId: string) => void;
}

export function usePlatformUpload(options: UsePlatformUploadOptions) {
  const activeUploads = useRef<Map<string, { file: File; xhr: XMLHttpRequest }>>(new Map());

  const upload = useCallback(async (file: File): Promise<string> => {
    const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', options.type);
    formData.append('entityType', options.entityType);
    if (options.entityId) {
      formData.append('entityId', options.entityId);
    }

    const xhr = new XMLHttpRequest();
    
    // Track progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        options.onProgress?.(percent, file, uploadId);
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      activeUploads.current.delete(uploadId);
      if (xhr.status === 201 || xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          // Fix: Get the URL from the correct path in response
          const url = response.data?.file?.cdnUrl || 
                      response.data?.file?.directUrl || 
                      response.data?.file?.url ||
                      response.url;
          if (url) {
            options.onSuccess?.(url, file, uploadId);
          } else {
            console.error('No URL in response:', response);
            options.onError?.('No URL returned from server', file, uploadId);
          }
        } catch (error) {
          console.error('Failed to parse response:', error);
          options.onError?.('Failed to parse server response', file, uploadId);
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          options.onError?.(response.error || response.message || 'Upload failed', file, uploadId);
        } catch {
          options.onError?.(`Upload failed with status ${xhr.status}`, file, uploadId);
        }
      }
    });

    // Handle error
    xhr.addEventListener('error', () => {
      activeUploads.current.delete(uploadId);
      options.onError?.('Network error occurred', file, uploadId);
    });

    xhr.open('POST', '/api/platform/upload');
    xhr.send(formData);
    
    activeUploads.current.set(uploadId, { file, xhr });
    
    return uploadId;
  }, [options]);

  const cancelUpload = useCallback((uploadId: string) => {
    const upload = activeUploads.current.get(uploadId);
    if (upload) {
      upload.xhr.abort();
      activeUploads.current.delete(uploadId);
    }
  }, []);

  return {
    upload,
    cancelUpload,
  };
}