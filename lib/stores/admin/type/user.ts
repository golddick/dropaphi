export interface WorkspaceOwner {
  id: string;
  name: string;
  email: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  role: string;
  joinedAt: string;
  memberCount: number;
  owners: WorkspaceOwner[];
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'pending_verification' | 'active' | 'inactive' | 'suspended';
  role: 'owner' | 'admin' | 'user' | 'viewer';
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: string | null;
  joinedAt: string;
  twoFactorEnabled: boolean;
  workspaces: Workspace[];
  workspaceCount: number;
}