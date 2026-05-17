// stores/platform-upload.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
  type: string;
  entityType: string;
  entityId?: string;
}

interface PlatformUploadState {
  // State
  uploads: Map<string, UploadFile>;
  isUploading: boolean;
  currentUploads: string[];
  
  // Actions
  addUpload: (file: File, type: string, entityType: string, entityId?: string) => string;
  removeUpload: (id: string) => void;
  updateUpload: (id: string, updates: Partial<UploadFile>) => void;
  clearCompleted: () => void;
  retryUpload: (id: string) => Promise<void>;
  uploadFile: (uploadId: string) => Promise<void>;
  uploadMultiple: (files: File[], type: string, entityType: string, entityId?: string) => Promise<string[]>;
  getUpload: (id: string) => UploadFile | undefined;
  getAllUploads: () => UploadFile[];
  getUploadsByStatus: (status: UploadFile['status']) => UploadFile[];
}

export const usePlatformUploadStore = create<PlatformUploadState>()(
  (set, get) => ({
    // Initial state
    uploads: new Map(),
    isUploading: false,
    currentUploads: [],

    // Add upload to queue
    addUpload: (file: File, type: string, entityType: string, entityId?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newUpload: UploadFile = {
        id,
        file,
        progress: 0,
        status: 'pending',
        type,
        entityType,
        entityId,
      };
      
      set((state) => ({
        uploads: new Map(state.uploads).set(id, newUpload),
      }));
      
      // Auto-start upload
      get().uploadFile(id);
      
      return id;
    },

    // Remove upload
    removeUpload: (id: string) => {
      set((state) => {
        const newUploads = new Map(state.uploads);
        newUploads.delete(id);
        return { uploads: newUploads };
      });
    },

    // Update upload
    updateUpload: (id: string, updates: Partial<UploadFile>) => {
      set((state) => {
        const upload = state.uploads.get(id);
        if (upload) {
          const newUploads = new Map(state.uploads);
          newUploads.set(id, { ...upload, ...updates });
          return { uploads: newUploads };
        }
        return state;
      });
    },

    // Clear completed uploads
    clearCompleted: () => {
      set((state) => {
        const newUploads = new Map(state.uploads);
        for (const [id, upload] of newUploads) {
          if (upload.status === 'success' || upload.status === 'error') {
            newUploads.delete(id);
          }
        }
        return { uploads: newUploads };
      });
    },

    // Retry failed upload
    retryUpload: async (id: string) => {
      const upload = get().uploads.get(id);
      if (!upload) return;
      
      get().updateUpload(id, { status: 'pending', progress: 0, error: undefined });
      await get().uploadFile(id);
    },

    // Upload single file
    uploadFile: async (uploadId: string) => {
      const upload = get().uploads.get(uploadId);
      if (!upload || upload.status === 'uploading') return;
      
      // Update status to uploading
      get().updateUpload(uploadId, { status: 'uploading' });
      
      set((state) => ({
        currentUploads: [...state.currentUploads, uploadId],
        isUploading: true,
      }));
      
      try {
        const formData = new FormData();
        formData.append('file', upload.file);
        formData.append('type', upload.type);
        formData.append('entityType', upload.entityType);
        if (upload.entityId) {
          formData.append('entityId', upload.entityId);
        }
        
        // Simulate progress for better UX
        let progress = 0;
        const progressInterval = setInterval(() => {
          if (progress < 90) {
            progress += 10;
            get().updateUpload(uploadId, { progress });
          }
        }, 200);
        
        const response = await fetch('/api/platform/upload', {
          method: 'POST',
          body: formData,
        });
        
        clearInterval(progressInterval);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }
        
        // Update to success with URL
        const fileUrl = data.data?.file?.cdnUrl || data.data?.file?.directUrl || data.url;
        get().updateUpload(uploadId, {
          status: 'success',
          progress: 100,
          url: fileUrl,
        });
        
      } catch (error: any) {
        // Update to error
        get().updateUpload(uploadId, {
          status: 'error',
          error: error.message || 'Upload failed',
        });
      } finally {
        set((state) => ({
          currentUploads: state.currentUploads.filter(id => id !== uploadId),
          isUploading: state.currentUploads.length > 1,
        }));
      }
    },

    // Upload multiple files
    uploadMultiple: async (files: File[], type: string, entityType: string, entityId?: string) => {
      const uploadIds = files.map(file => 
        get().addUpload(file, type, entityType, entityId)
      );
      return uploadIds;
    },

    // Get upload by ID
    getUpload: (id: string) => {
      return get().uploads.get(id);
    },

    // Get all uploads as array
    getAllUploads: () => {
      return Array.from(get().uploads.values());
    },

    // Get uploads by status
    getUploadsByStatus: (status: UploadFile['status']) => {
      return Array.from(get().uploads.values()).filter(u => u.status === status);
    },
  })
);