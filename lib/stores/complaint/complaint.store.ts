// stores/complaint.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export interface Reply {
  id: string;
  author: 'admin' | 'user';
  authorName: string;
  message: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId?: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  id: string;
  type: 'EMAIL' | 'DISCORD' | 'TWITTER' | 'GITHUB' | 'OTHER';
  label: string;
  value: string;
  href: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ComplaintState {
  // State
  complaints: Complaint[];
  contactInfo: ContactInfo[];
  isLoading: boolean;
  pagination: { page: number; limit: number; total: number; pages: number };
  
  // Actions
  fetchComplaints: (filters?: { status?: string; page?: number }) => Promise<void>;
  fetchContactInfo: () => Promise<void>;
  createComplaint: (data: Omit<Complaint, 'id' | 'status' | 'replies' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateComplaintStatus: (id: string, status: Complaint['status']) => Promise<void>;
  addReply: (id: string, message: string) => Promise<void>;
  deleteComplaint: (id: string) => Promise<void>;
  createContactInfo: (data: Omit<ContactInfo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContactInfo: (id: string, data: Partial<ContactInfo>) => Promise<void>;
  deleteContactInfo: (id: string) => Promise<void>;
}

export const useComplaintStore = create<ComplaintState>()((set, get) => ({
  // Initial state
  complaints: [],
  contactInfo: [],
  isLoading: false,
  pagination: { page: 1, limit: 50, total: 0, pages: 1 },

  // Fetch complaints
  fetchComplaints: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const { status = 'all', page = 1 } = filters;
      const query = new URLSearchParams({ status, page: String(page), limit: '50' });
      const res = await fetch(`/api/complaints?${query}`);
      const data = await res.json();
      
      if (data.success) {
        set({ 
          complaints: data.data.complaints,
          pagination: data.data.pagination,
        });
      } else {
        toast.error(data.error || 'Failed to fetch complaints');
      }
    } catch (error) {
      console.error('Fetch complaints error:', error);
      toast.error('Failed to fetch complaints');
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch contact info
  fetchContactInfo: async () => {
    try {
      const res = await fetch('/api/contact-info');
      const data = await res.json();
      
      if (data.success) {
        set({ contactInfo: data.data.contactInfo });
      }
    } catch (error) {
      console.error('Fetch contact info error:', error);
    }
  },

  // Create complaint
  createComplaint: async (data) => {
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success('Complaint submitted successfully');
        get().fetchComplaints();
      } else {
        toast.error(result.error || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Create complaint error:', error);
      toast.error('Failed to submit complaint');
    }
  },

  // Update complaint status
  updateComplaintStatus: async (id: string, status: Complaint['status']) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success(`Complaint marked as ${status}`);
        get().fetchComplaints();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  },

  // Add reply
  addReply: async (id: string, message: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: message }),
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success('Reply sent successfully');
        get().fetchComplaints();
      } else {
        toast.error(result.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Add reply error:', error);
      toast.error('Failed to send reply');
    }
  },

  // Delete complaint
  deleteComplaint: async (id: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success('Complaint deleted');
        get().fetchComplaints();
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete complaint error:', error);
      toast.error('Failed to delete');
    }
  },

  // Create contact info
  createContactInfo: async (data) => {
    try {
      const res = await fetch('/api/contact-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success('Contact info created');
        get().fetchContactInfo();
      } else {
        toast.error(result.error || 'Failed to create');
      }
    } catch (error) {
      console.error('Create contact info error:', error);
      toast.error('Failed to create');
    }
  },

  // Update contact info
  updateContactInfo: async (id: string, data: Partial<ContactInfo>) => {
    try {
      const res = await fetch('/api/contact-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success('Contact info updated');
        get().fetchContactInfo();
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch (error) {
      console.error('Update contact info error:', error);
      toast.error('Failed to update');
    }
  },

  // Delete contact info
  deleteContactInfo: async (id: string) => {
    try {
      const res = await fetch(`/api/contact-info?id=${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success('Contact info deleted');
        get().fetchContactInfo();
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete contact info error:', error);
      toast.error('Failed to delete');
    }
  },
}));