import api from './client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  roles: Array<{ institutionId: string; role: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  institutionId?: string;
}

export interface BulkImportData {
  users: CreateUserData[];
}

export interface BulkImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

export const usersApi = {
  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    const response = await api.get<{ success: boolean; data: User }>('/users/me');
    return response.data;
  },

  getUsers: async (params?: {
    search?: string;
    role?: string;
    institutionId?: string;
  }): Promise<{ success: boolean; data: User[] }> => {
    const response = await api.get<{ success: boolean; data: User[] }>('/users', { params });
    return response.data;
  },

  getUser: async (id: string): Promise<{ success: boolean; data: User }> => {
    const response = await api.get<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data;
  },

  updateUser: async (
    id: string,
    updates: Partial<User>
  ): Promise<{ success: boolean; data: User }> => {
    const response = await api.put<{ success: boolean; data: User }>(`/users/${id}`, updates);
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/users/${id}`);
    return response.data;
  },

  assignRole: async (
    id: string,
    institutionId: string,
    role: string
  ): Promise<{ success: boolean; data: User }> => {
    const response = await api.post<{ success: boolean; data: User }>(`/users/${id}/roles`, {
      institutionId,
      role,
    });
    return response.data;
  },

  bulkImportUsers: async (
    data: BulkImportData
  ): Promise<{ success: boolean; data: BulkImportResult }> => {
    const response = await api.post<{ success: boolean; data: BulkImportResult }>(
      '/users/bulk-import',
      data
    );
    return response.data;
  },
};
