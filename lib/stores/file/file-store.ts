import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FileType {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  cdnUrl: string | null;
  directUrl: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  metadata?: any;
  createdAt: string;
  folder?: {
    id: string;
    name: string;
  } | null;
}

interface FileStore {
  // State
  files: FileType[];
  selectedFiles: string[];
  currentFolder: string | null;
  viewMode: "grid" | "list";
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Actions
  setFiles: (files: FileType[]) => void;
  addFile: (file: FileType) => void;
  updateFile: (id: string, data: Partial<FileType>) => void;
  removeFile: (id: string) => void;
  setSelectedFiles: (ids: string[]) => void;
  toggleSelectFile: (id: string) => void;
  clearSelected: () => void;
  setCurrentFolder: (folderId: string | null) => void;
  setViewMode: (mode: "grid" | "list") => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<FileStore["pagination"]>) => void;
  reset: () => void;

  // API Actions
  fetchFiles: (workspaceId: string, folderId?: string | null, page?: number) => Promise<void>;
  uploadFile: (workspaceId: string, file: File, folderId?: string | null) => Promise<FileType | null>;
  deleteFile: (workspaceId: string, fileId: string) => Promise<boolean>;
  copyUrl: (url: string) => Promise<boolean>;
  getFileUrl: (file: FileType) => string;
}

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      // Initial state
      files: [],
      selectedFiles: [],
      currentFolder: null,
      viewMode: "grid",
      isLoading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
      },

      // Basic setters
      setFiles: (files) => set({ files }),
      addFile: (file) => set((state) => ({ 
        files: [file, ...state.files] 
      })),
      updateFile: (id, data) => set((state) => ({
        files: state.files.map((f) => 
          f.id === id ? { ...f, ...data } : f
        ),
      })),
      removeFile: (id) => set((state) => ({
        files: state.files.filter((f) => f.id !== id),
        selectedFiles: state.selectedFiles.filter((fId) => fId !== id),
      })),
      setSelectedFiles: (ids) => set({ selectedFiles: ids }),
      toggleSelectFile: (id) => set((state) => ({
        selectedFiles: state.selectedFiles.includes(id)
          ? state.selectedFiles.filter((fId) => fId !== id)
          : [...state.selectedFiles, id],
      })),
      clearSelected: () => set({ selectedFiles: [] }),
      setCurrentFolder: (folderId) => set({ currentFolder: folderId }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination },
      })),
      reset: () => set({
        files: [],
        selectedFiles: [],
        currentFolder: null,
        error: null,
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0,
        },
      }),

      // API Actions
      fetchFiles: async (workspaceId, folderId = null, page = 1) => {
        const { pagination, setLoading, setError, setFiles, setPagination } = get();
        setLoading(true);
        setError(null);

        try {
          const folderParam = folderId === null ? "root" : folderId;
          const url = `/api/workspace/${workspaceId}/files?folderId=${folderParam}&page=${page}&limit=${pagination.limit}`;
          
          const response = await fetch(url);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch files");
          }

          setFiles(data.data.files);
          setPagination(data.data.pagination);
        } catch (error) {
          setError(error instanceof Error ? error.message : "Failed to fetch files");
        } finally {
          setLoading(false);
        }
      },

      uploadFile: async (workspaceId, file, folderId = null) => {
        const { addFile, setError, setLoading } = get();
        setLoading(true);
        setError(null);

        try {
          const formData = new FormData();
          formData.append("file", file);
          if (folderId) {
            formData.append("folderId", folderId);
          }

          const response = await fetch(`/api/workspace/${workspaceId}/files`, {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to upload file");
          }

          addFile(data.data.file);
          return data.data.file;
        } catch (error) {
          setError(error instanceof Error ? error.message : "Failed to upload file");
          return null;
        } finally {
          setLoading(false);
        }
      },

      deleteFile: async (workspaceId, fileId) => {
        const { removeFile, setError, setLoading } = get();
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `/api/workspace/${workspaceId}/files?id=${fileId}`,
            {
              method: "DELETE",
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to delete file");
          }

          removeFile(fileId);
          return true;
        } catch (error) {
          setError(error instanceof Error ? error.message : "Failed to delete file");
          return false;
        } finally {
          setLoading(false);
        }
      },

      copyUrl: async (url) => {
        try {
          await navigator.clipboard.writeText(url);
          return true;
        } catch (error) {
          console.error("Failed to copy URL:", error);
          return false;
        }
      },

      getFileUrl: (file) => {
        // Return CDN URL first, fallback to direct URL
        return file.cdnUrl || file.directUrl || "#";
      },
    }),
    {
      name: "file-storage",
      partialize: (state) => ({
        viewMode: state.viewMode,
        currentFolder: state.currentFolder,
      }),
    }
  )
);