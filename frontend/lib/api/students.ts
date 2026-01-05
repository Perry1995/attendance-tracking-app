import api from './client';
import { UserRole } from '@/types';

export interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  roles: Array<{ institutionId: string; role: UserRole }>;
  classes?: Array<{
    classId: string;
    className: string;
    section?: string;
    enrollmentDate: Date;
  }>;
}

export interface CreateStudentData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  institutionId?: string;
  role?: UserRole;
}

export const studentsApi = {
  getAll: async (params?: {
    institutionId?: string;
    search?: string;
  }): Promise<{ success: boolean; data: Student[] }> => {
    const response = await api.get<{ success: boolean; data: Student[] }>('/students', { params });
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Student }> => {
    const response = await api.get<{ success: boolean; data: Student }>(`/students/${id}`);
    return response.data;
  },

  create: async (data: CreateStudentData): Promise<{ success: boolean; data: Student }> => {
    const response = await api.post<{ success: boolean; data: Student }>('/students', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateStudentData>): Promise<{ success: boolean; data: Student }> => {
    const response = await api.put<{ success: boolean; data: Student }>(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/students/${id}`);
    return response.data;
  },

  getClasses: async (studentId: string): Promise<{ success: boolean; data: any[] }> => {
    const response = await api.get<{ success: boolean; data: any[] }>(`/students/${studentId}/classes`);
    return response.data;
  },
};
