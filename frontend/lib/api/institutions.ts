import api from './client';

export interface Institution {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
}

export interface CreateInstitutionData {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export const institutionsApi = {
  getAll: async (params?: {
    search?: string;
  }): Promise<{ success: boolean; data: Institution[] }> => {
    const response = await api.get<{ success: boolean; data: Institution[] }>('/institutions', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Institution> => {
    const response = await api.get<Institution>(`/institutions/${id}`);
    return response.data;
  },

  create: async (data: CreateInstitutionData): Promise<Institution> => {
    const response = await api.post<Institution>('/institutions', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateInstitutionData>): Promise<Institution> => {
    const response = await api.put<Institution>(`/institutions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/institutions/${id}`);
  },
};
